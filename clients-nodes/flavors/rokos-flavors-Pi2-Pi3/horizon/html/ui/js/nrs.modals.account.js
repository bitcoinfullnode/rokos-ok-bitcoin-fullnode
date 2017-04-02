/******************************************************************************
 * Copyright © 2013-2015 The Nxt Core Developers.                             *
 *                                                                            *
 * See the AUTHORS.txt, DEVELOPER-AGREEMENT.txt and LICENSE.txt files at      *
 * the top-level directory of this distribution for the individual copyright  *
 * holder information and the developer policies on copyright and licensing.  *
 *                                                                            *
 * Unless otherwise agreed in a custom licensing agreement, no part of the    *
 * Nxt software, including this file, may be copied, modified, propagated,    *
 * or distributed except according to the terms contained in the LICENSE.txt  *
 * file.                                                                      *
 *                                                                            *
 * Removal or modification of this copyright notice is prohibited.            *
 *                                                                            *
 ******************************************************************************/

/**
 * @depends {nrs.js}
 * @depends {nrs.modals.js}
 */
var NRS = (function(NRS, $) {
	NRS.userInfoModal = {
		"user": 0
	};
	
	$("body").on("click", ".show_account_modal_action, a[data-user].user_info", function(e) {
		e.preventDefault();

		var account = $(this).data("user");

		NRS.showAccountModal(account);
	});

	NRS.showAccountModal = function(account) {
		if (NRS.fetchingModalData) {
			return;
		}

		if (typeof account == "object") {
			NRS.userInfoModal.user = account.account;
		} else {
			NRS.userInfoModal.user = account;
			NRS.fetchingModalData = true;
		}

		$("#user_info_modal_account").html(NRS.getAccountFormatted(NRS.userInfoModal.user));
		var accountButton;
		if (NRS.userInfoModal.user in NRS.contacts) {
			accountButton = NRS.contacts[NRS.userInfoModal.user].name.escapeHTML();
			$("#user_info_modal_add_as_contact").hide();
		} else {
			accountButton = NRS.userInfoModal.user;
			$("#user_info_modal_add_as_contact").show();
		}

		$("#user_info_modal_actions").find("button").data("account", accountButton);

		if (NRS.fetchingModalData) {
			NRS.sendRequest("getAccount", {
				"account": NRS.userInfoModal.user
			}, function(response) {
				NRS.processAccountModalData(response);
				NRS.fetchingModalData = false;
			});
		} else {
			NRS.processAccountModalData(account);
		}

		$("#user_info_modal_transactions").show();

		NRS.userInfoModal.transactions();
	};

	NRS.processAccountModalData = function(account) {
		if (account.unconfirmedBalanceNQT == "0") {
			$("#user_info_modal_account_balance").html("0");
		} else {
			$("#user_info_modal_account_balance").html(NRS.formatAmount(account.unconfirmedBalanceNQT) + " HZ");
		}

		if (account.name) {
			$("#user_info_modal_account_name").html(String(account.name).escapeHTML());
			$("#user_info_modal_account_name_container").show();
		} else {
			$("#user_info_modal_account_name_container").hide();
		}

		if (account.description) {
			$("#user_info_description").show();
			$("#user_info_modal_description").html(String(account.description).escapeHTML().nl2br());
		} else {
			$("#user_info_description").hide();
		}

		$("#user_info_modal").modal("show");
	};

    var userInfoModal = $("#user_info_modal");
    userInfoModal.on("hidden.bs.modal", function() {
		$(this).find(".user_info_modal_content").hide();
		$(this).find(".user_info_modal_content table tbody").empty();
		$(this).find(".user_info_modal_content:not(.data-loading,.data-never-loading)").addClass("data-loading");
		$(this).find("ul.nav li.active").removeClass("active");
		$("#user_info_transactions").addClass("active");
		NRS.userInfoModal.user = 0;
	});

	userInfoModal.find("ul.nav li").click(function(e) {
		e.preventDefault();

		var tab = $(this).data("tab");

		$(this).siblings().removeClass("active");
		$(this).addClass("active");

		$(".user_info_modal_content").hide();

		var content = $("#user_info_modal_" + tab);

		content.show();

		if (content.hasClass("data-loading")) {
			NRS.userInfoModal[tab]();
		}
	});

	/*some duplicate methods here...*/
	NRS.userInfoModal.transactions = function() {
		NRS.sendRequest("getBlockchainTransactions", {
			"account": NRS.userInfoModal.user,
			"firstIndex": 0,
			"lastIndex": 100
		}, function(response) {
            var infoModalTransactionsTable = $("#user_info_modal_transactions_table");
            if (response.transactions && response.transactions.length) {
				var rows = "";
				for (var i = 0; i < response.transactions.length; i++) {
					var transaction = response.transactions[i];
					var transactionType = $.t(NRS.transactionTypes[transaction.type].subTypes[transaction.subtype].i18nKeyTitle);
					if (transaction.type == NRS.subtype.AliasSell.type && transaction.subtype == NRS.subtype.AliasSell.subtype) {
                        if (transaction.attachment.priceNQT == "0") {
                            if (transaction.sender == transaction.recipient) {
                                transactionType = $.t("alias_sale_cancellation");
                            } else {
                                transactionType = $.t("alias_transfer");
                            }
                        } else {
                            transactionType = $.t("alias_sale");
                        }
                    }
					var receiving;
					if (/^NHZ\-/i.test(String(NRS.userInfoModal.user))) {
						receiving = (transaction.recipientRS == NRS.userInfoModal.user);
					} else {
						receiving = (transaction.recipient == NRS.userInfoModal.user);
					}

					if (transaction.amountNQT) {
						transaction.amount = new BigInteger(transaction.amountNQT);
						transaction.fee = new BigInteger(transaction.feeNQT);
					}

					var account = (receiving ? "sender" : "recipient");
					rows += "<tr>" +
						"<td><a href='#' class='show_transaction_modal_action' data-transaction='" + String(transaction.transaction).escapeHTML() + "'>" + NRS.formatTimestamp(transaction.timestamp) + "</a></td>" +
						"<td>" + NRS.getTransactionIconHTML(transaction.type, transaction.subtype) + "&nbsp" + transactionType + "</td>" +
						"<td style='width:5px;padding-right:0;'>" + (transaction.type == 0 ? (receiving ? "<i class='fa fa-plus-circle' style='color:#65C62E'></i>" : "<i class='fa fa-minus-circle' style='color:#E04434'></i>") : "") + "</td>" +
						"<td " + (transaction.type == 0 && receiving ? " style='color:#006400;'" : (!receiving && transaction.amount > 0 ? " style='color:red'" : "")) + ">" + NRS.formatAmount(transaction.amount) + "</td>" +
						"<td " + (!receiving ? " style='color:red'" : "") + ">" + NRS.formatAmount(transaction.fee) + "</td>" +
						"<td>" + NRS.getAccountTitle(transaction, account) + "</td>" +
					"</tr>";
				}

				infoModalTransactionsTable.find("tbody").empty().append(rows);
				NRS.dataLoadFinished(infoModalTransactionsTable);
			} else {
				infoModalTransactionsTable.find("tbody").empty();
				NRS.dataLoadFinished(infoModalTransactionsTable);
			}
		});
	};

	NRS.userInfoModal.aliases = function() {
		NRS.sendRequest("getAliases", {
			"account": NRS.userInfoModal.user,
			"firstIndex": 0,
			"lastIndex": 100
		}, function(response) {
			var rows = "";

			if (response.aliases && response.aliases.length) {
				var aliases = response.aliases;

				aliases.sort(function(a, b) {
					if (a.aliasName.toLowerCase() > b.aliasName.toLowerCase()) {
						return 1;
					} else if (a.aliasName.toLowerCase() < b.aliasName.toLowerCase()) {
						return -1;
					} else {
						return 0;
					}
				});

				var alias_account_count = 0,
					alias_uri_count = 0,
					empty_alias_count = 0,
					alias_count = aliases.length;

				for (var i = 0; i < alias_count; i++) {
					var alias = aliases[i];

					rows += "<tr data-alias='" + String(alias.aliasName).toLowerCase().escapeHTML() + "'><td class='alias'>" + String(alias.aliasName).escapeHTML() + "</td><td class='uri'>" + (alias.aliasURI.indexOf("http") === 0 ? "<a href='" + String(alias.aliasURI).escapeHTML() + "' target='_blank'>" + String(alias.aliasURI).escapeHTML() + "</a>" : String(alias.aliasURI).escapeHTML()) + "</td></tr>";
					if (!alias.uri) {
						empty_alias_count++;
					} else if (alias.aliasURI.indexOf("http") === 0) {
						alias_uri_count++;
					} else if (alias.aliasURI.indexOf("acct:") === 0 || alias.aliasURI.indexOf("nacc:") === 0) {
						alias_account_count++;
					}
				}
			}

            var infoModalAliasesTable = $("#user_info_modal_aliases_table");
            infoModalAliasesTable.find("tbody").empty().append(rows);
			NRS.dataLoadFinished(infoModalAliasesTable);
		});
	};

	NRS.userInfoModal.marketplace = function() {
		NRS.sendRequest("getDGSGoods", {
			"seller": NRS.userInfoModal.user,
			"firstIndex": 0,
			"lastIndex": 100
		}, function(response) {
			var rows = "";

			if (response.goods && response.goods.length) {
				for (var i = 0; i < response.goods.length; i++) {
					var good = response.goods[i];
					if (good.name.length > 150) {
						good.name = good.name.substring(0, 150) + "...";
					}
					rows += "<tr><td><a href='#' data-goto-goods='" + String(good.goods).escapeHTML() + "' data-seller='" + String(NRS.userInfoModal.user).escapeHTML() + "'>" + String(good.name).escapeHTML() + "</a></td><td>" + NRS.formatAmount(good.priceNQT) + " HZ</td><td>" + NRS.format(good.quantity) + "</td></tr>";
				}
			}

            var infoModalMarketplaceTable = $("#user_info_modal_marketplace_table");
            infoModalMarketplaceTable.find("tbody").empty().append(rows);
			NRS.dataLoadFinished(infoModalMarketplaceTable);
		});
	};
	
	NRS.userInfoModal.currencies = function() {
		NRS.sendRequest("getAccountCurrencies+", {
			"account": NRS.userInfoModal.user
		}, function(response) {
			var rows = "";
			if (response.accountCurrencies && response.accountCurrencies.length) {
				for (var i = 0; i < response.accountCurrencies.length; i++) {
					var currency = response.accountCurrencies[i];
					var code = String(currency.code).escapeHTML();
					rows += "<tr>" +
						"<td>" +
							"<a href='#' data-transaction='" + String(currency.currency).escapeHTML() + "' >" + code + "</a>" +
						"</td>" +
						"<td>" + currency.name + "</td>" +
						"<td>" + NRS.formatQuantity(currency.unconfirmedUnits, currency.decimals) + "</td>" +
					"</tr>";
				}
			}
            var infoModalCurrenciesTable = $("#user_info_modal_currencies_table");
            infoModalCurrenciesTable.find("tbody").empty().append(rows);
			NRS.dataLoadFinished(infoModalCurrenciesTable);
		});
	};

	NRS.userInfoModal.assets = function() {
		NRS.sendRequest("getAccount", {
			"account": NRS.userInfoModal.user
		}, function(response) {
			if (response.assetBalances && response.assetBalances.length) {
				var assets = {};
				var nrAssets = 0;
				var ignoredAssets = 0; // TODO need to understand the purpose of this variable

				for (var i = 0; i < response.assetBalances.length; i++) {
					if (response.assetBalances[i].balanceQNT == "0") {
						ignoredAssets++;

						if (nrAssets + ignoredAssets == response.assetBalances.length) {
							NRS.userInfoModal.addIssuedAssets(assets);
						}
						continue;
					}

					NRS.sendRequest("getAsset", {
						"asset": response.assetBalances[i].asset,
						"_extra": {
							"balanceQNT": response.assetBalances[i].balanceQNT
						}
					}, function(asset, input) {
						asset.asset = input.asset;
						asset.balanceQNT = input["_extra"].balanceQNT;

						assets[asset.asset] = asset;
						nrAssets++;

						if (nrAssets + ignoredAssets == response.assetBalances.length) {
							NRS.userInfoModal.addIssuedAssets(assets);
						}
					});
				}
			} else {
				NRS.userInfoModal.addIssuedAssets({});
			}
		});
	};

	NRS.userInfoModal.trade_history = function() {
		NRS.sendRequest("getTrades", {
			"account": NRS.userInfoModal.user,
			"firstIndex": 0,
			"lastIndex": 100
		}, function(response) {
			var rows = "";
			if (response.trades && response.trades.length) {
				var trades = response.trades;
				for (var i = 0; i < trades.length; i++) {
					trades[i].priceNQT = new BigInteger(trades[i].priceNQT);
					trades[i].quantityQNT = new BigInteger(trades[i].quantityQNT);
					trades[i].totalNQT = new BigInteger(NRS.calculateOrderTotalNQT(trades[i].priceNQT, trades[i].quantityQNT));

					var type = (trades[i].buyerRS == NRS.userInfoModal.user ? "buy" : "sell");

					rows += "<tr><td><a href='#' data-goto-asset='" + String(trades[i].asset).escapeHTML() + "'>" + String(trades[i].name).escapeHTML() + "</a></td><td>" + NRS.formatTimestamp(trades[i].timestamp) + "</td><td style='color:" + (type == "buy" ? "green" : "red") + "'>" + $.t(type) + "</td><td>" + NRS.formatQuantity(trades[i].quantityQNT, trades[i].decimals) + "</td><td class='asset_price'>" + NRS.formatOrderPricePerWholeQNT(trades[i].priceNQT, trades[i].decimals) + "</td><td style='color:" + (type == "buy" ? "red" : "green") + "'>" + NRS.formatAmount(trades[i].totalNQT) + "</td></tr>";
				}
			}
            var infoModalTradeHistoryTable = $("#user_info_modal_trade_history_table");
            infoModalTradeHistoryTable.find("tbody").empty().append(rows);
			NRS.dataLoadFinished(infoModalTradeHistoryTable);
		});
	};

	NRS.userInfoModal.addIssuedAssets = function(assets) {
		NRS.sendRequest("getAssetsByIssuer", {
			"account": NRS.userInfoModal.user
		}, function(response) {
			if (response.assets && response.assets[0] && response.assets[0].length) {
				$.each(response.assets[0], function(key, issuedAsset) {
					if (assets[issuedAsset.asset]) {
						assets[issuedAsset.asset].issued = true;
					} else {
						issuedAsset.balanceQNT = "0";
						issuedAsset.issued = true;
						assets[issuedAsset.asset] = issuedAsset;
					}
				});

				NRS.userInfoModal.assetsLoaded(assets);
			} else if (!$.isEmptyObject(assets)) {
				NRS.userInfoModal.assetsLoaded(assets);
			} else {
                var infoModalAssetsTable = $("#user_info_modal_assets_table");
                infoModalAssetsTable.find("tbody").empty();
				NRS.dataLoadFinished(infoModalAssetsTable);
			}
		});
	};

	NRS.userInfoModal.assetsLoaded = function(assets) {
		var assetArray = [];
		var rows = "";

		$.each(assets, function(key, asset) {
			assetArray.push(asset);
		});

		assetArray.sort(function(a, b) {
			if (a.issued && b.issued) {
				if (a.name.toLowerCase() > b.name.toLowerCase()) {
					return 1;
				} else if (a.name.toLowerCase() < b.name.toLowerCase()) {
					return -1;
				} else {
					return 0;
				}
			} else if (a.issued) {
				return -1;
			} else if (b.issued) {
				return 1;
			} else {
				if (a.name.toLowerCase() > b.name.toLowerCase()) {
					return 1;
				} else if (a.name.toLowerCase() < b.name.toLowerCase()) {
					return -1;
				} else {
					return 0;
				}
			}
		});

		for (var i = 0; i < assetArray.length; i++) {
			var asset = assetArray[i];

			var percentageAsset = NRS.calculatePercentage(asset.balanceQNT, asset.quantityQNT);

			rows += "<tr" + (asset.issued ? " class='asset_owner'" : "") + "><td><a href='#' data-goto-asset='" + String(asset.asset).escapeHTML() + "'" + (asset.issued ? " style='font-weight:bold'" : "") + ">" + String(asset.name).escapeHTML() + "</a></td><td class='quantity'>" + NRS.formatQuantity(asset.balanceQNT, asset.decimals) + "</td><td>" + NRS.formatQuantity(asset.quantityQNT, asset.decimals) + "</td><td>" + percentageAsset + "%</td></tr>";
		}

        var infoModalAssetsTable = $("#user_info_modal_assets_table");
        infoModalAssetsTable.find("tbody").empty().append(rows);
		NRS.dataLoadFinished(infoModalAssetsTable);
	};

	return NRS;
}(NRS || {}, jQuery));