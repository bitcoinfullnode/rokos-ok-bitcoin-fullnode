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
 * @depends {3rdparty/jquery-2.1.0.js}
 * @depends {3rdparty/bootstrap.js}
 * @depends {3rdparty/big.js}
 * @depends {3rdparty/jsbn.js}
 * @depends {3rdparty/jsbn2.js}
 * @depends {3rdparty/pako.js}
 * @depends {3rdparty/webdb.js}
 * @depends {3rdparty/ajaxmultiqueue.js}
 * @depends {3rdparty/growl.js}
 * @depends {3rdparty/zeroclipboard.js}
 * @depends {crypto/curve25519.js}
 * @depends {crypto/curve25519_.js}
 * @depends {crypto/passphrasegenerator.js}
 * @depends {crypto/sha256worker.js}
 * @depends {crypto/3rdparty/cryptojs/aes.js}
 * @depends {crypto/3rdparty/cryptojs/sha256.js}
 * @depends {crypto/3rdparty/jssha256.js}
 * @depends {crypto/3rdparty/seedrandom.js}
 * @depends {util/converters.js}
 * @depends {util/extensions.js}
 * @depends {util/nxtaddress.js}
 */
var NRS = (function(NRS, $, undefined) {
	"use strict";

	NRS.server = "";
	NRS.state = {};
	NRS.blocks = [];
	NRS.account = "";
	NRS.accountRS = "";
	NRS.publicKey = "";
	NRS.accountInfo = {};

	NRS.database = null;
	NRS.databaseSupport = false;
	NRS.databaseFirstStart = false;

	// Legacy database, don't use this for data storage
	NRS.legacyDatabase = null;
	NRS.legacyDatabaseWithData = false;

	NRS.serverConnect = false;
	NRS.peerConnect = false;

	NRS.settings = {};
	NRS.contacts = {};

	NRS.isTestNet = false;
	NRS.isLocalHost = false;
	NRS.forgingStatus = NRS.constants.UNKNOWN;
	NRS.isAccountForging = false;
	NRS.isLeased = false;
	NRS.needsAdminPassword = true;

	NRS.lastBlockHeight = 0;
	NRS.downloadingBlockchain = false;

	NRS.rememberPassword = false;
	NRS.selectedContext = null;

	NRS.currentPage = "dashboard";
	NRS.currentSubPage = "";
	NRS.pageNumber = 1;
	//NRS.itemsPerPage = 50;  /* Now set in nrs.settings.js */

	NRS.pages = {};
	NRS.incoming = {};
	NRS.setup = {};

	if (!_checkDOMenabled()) {
		NRS.hasLocalStorage = false;
	} else {
	NRS.hasLocalStorage = true;
   }
	
	NRS.inApp = false;
	NRS.appVersion = "";
	NRS.appPlatform = "";
	NRS.assetTableKeys = [];

	var stateInterval;
	var stateIntervalSeconds = 30;
	var isScanning = false;

	NRS.init = function() {
		NRS.sendRequest("getState", {
			"includeCounts": "false"
		}, function (response) {
			var isTestnet = false;
			var isOffline = false;
			var peerPort = 0;
			for (var key in response) {
				if (key == "isTestnet") {
					isTestnet = response[key];
				}
				if (key == "isOffline") {
					isOffline = response[key];
				}
				if (key == "peerPort") {
					peerPort = response[key];
				}
				if (key == "needsAdminPassword") {
					NRS.needsAdminPassword = response[key];
				}
			}
			
			if (!isTestnet) {
				$(".testnet_only").hide();
			} else {
				NRS.isTestNet = true;
				var testnetWarningDiv = $("#testnet_warning");
				var warningText = testnetWarningDiv.text() + " The testnet peer port is " + peerPort + (isOffline ? ", the peer is working offline." : ".");
                NRS.logConsole(warningText);
				testnetWarningDiv.text(warningText);
				$(".testnet_only, #testnet_login, #testnet_warning").show();
			}
			NRS.loadServerConstants();
			NRS.loadTransactionTypeConstants();
			NRS.initializePlugins();
            NRS.printEnvInfo();
		});
		
		if (!NRS.server) {
			var hostName = window.location.hostname.toLowerCase();
			NRS.isLocalHost = hostName == "localhost" || hostName == "127.0.0.1" || NRS.isPrivateIP(hostName);
            NRS.logProperty("NRS.isLocalHost");
		}

		if (!NRS.isLocalHost) {
			$(".remote_warning").show();
		}

		try {
			window.localStorage;
		} catch (err) {
			NRS.hasLocalStorage = false;
		}
		if(!(navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1)) {
			// Not Safari
			// Don't use account based DB in Safari due to a buggy indexedDB implementation (2015-02-24)
			NRS.createLegacyDatabase();
		}

		if (NRS.getCookie("remember_passphrase")) {
			$("#remember_password").prop("checked", true);
		}

		NRS.getSettings();

		NRS.getState(function() {
			setTimeout(function() {
				NRS.checkAliasVersions();
			}, 5000);
		});

		$("body").popover({
			"selector": ".show_popover",
			"html": true,
			"trigger": "hover"
		});

		NRS.showLockscreen();

		if (window.parent) {
			var match = window.location.href.match(/\?app=?(win|mac|lin)?\-?([\d\.]+)?/i);

			if (match) {
				NRS.inApp = true;
				if (match[1]) {
					NRS.appPlatform = match[1];
				}
				if (match[2]) {
					NRS.appVersion = match[2];
				}

				if (!NRS.appPlatform || NRS.appPlatform == "mac") {
					var macVersion = navigator.userAgent.match(/OS X 10_([0-9]+)/i);
					if (macVersion && macVersion[1]) {
						macVersion = parseInt(macVersion[1]);

						if (macVersion < 9) {
							$(".modal").removeClass("fade");
						}
					}
				}

				$("#show_console").hide();

				parent.postMessage("loaded", "*");

				window.addEventListener("message", receiveMessage, false);
			}
		}

		NRS.setStateInterval(30);

		if (!NRS.isTestNet) {
			setInterval(NRS.checkAliasVersions, 1000 * 60 * 60);
		}

		NRS.allowLoginViaEnter();

		NRS.automaticallyCheckRecipient();

		$("#dashboard_table, #transactions_table").on("mouseenter", "td.confirmations", function() {
			$(this).popover("show");
		}).on("mouseleave", "td.confirmations", function() {
			$(this).popover("destroy");
			$(".popover").remove();
		});

		_fix();

		$(window).on("resize", function() {
			_fix();

			if (NRS.currentPage == "asset_exchange") {
				NRS.positionAssetSidebar();
			}
		});
		
		$("[data-toggle='tooltip']").tooltip();

		$("#dgs_search_account_top, #dgs_search_account_center").mask("NHZ-****-****-****-*****", {
			"unmask": false
		});
		
		if (NRS.getUrlParameter("account")){
			NRS.login(false,NRS.getUrlParameter("account"));
		}

		NRS.newDefaultStyle();

		/*
		$("#asset_exchange_search input[name=q]").addClear({
			right: 0,
			top: 4,
			onClear: function(input) {
				$("#asset_exchange_search").trigger("submit");
			}
		});

		$("#id_search input[name=q], #alias_search input[name=q]").addClear({
			right: 0,
			top: 4
		});*/
	};

	function _fix() {
		var height = $(window).height() - $("body > .header").height();
		//$(".wrapper").css("min-height", height + "px");
		var content = $(".wrapper").height();

		$(".content.content-stretch:visible").width($(".page:visible").width());

		if (content > height) {
			$(".left-side, html, body").css("min-height", content + "px");
		} else {
			$(".left-side, html, body").css("min-height", height + "px");
		}
	}

	NRS.setStateInterval = function(seconds) {
		if (seconds == stateIntervalSeconds && stateInterval) {
			return;
		}

		if (stateInterval) {
			clearInterval(stateInterval);
		}

		stateIntervalSeconds = seconds;

		stateInterval = setInterval(function() {
			NRS.getState();
			NRS.updateForgingStatus();
		}, 1000 * seconds);
	};

	var _firstTimeAfterLoginRun = false;

	NRS.getState = function(callback) {
		NRS.sendRequest("getBlockchainStatus", {}, function(response) {
			if (response.errorCode) {
				NRS.serverConnect = false;
				//todo
			} else {
				var firstTime = !("lastBlock" in NRS.state);
				var previousLastBlock = (firstTime ? "0" : NRS.state.lastBlock);

				NRS.state = response;
				NRS.serverConnect = true;

				if (firstTime) {
					$("#nrs_version").html(NRS.state.version).removeClass("loading_dots");
					NRS.getBlock(NRS.state.lastBlock, NRS.handleInitialBlocks);
				} else if (NRS.state.isScanning) {
					//do nothing but reset NRS.state so that when isScanning is done, everything is reset.
					isScanning = true;
				} else if (isScanning) {
					//rescan is done, now we must reset everything...
					isScanning = false;
					NRS.blocks = [];
					NRS.tempBlocks = [];
					NRS.getBlock(NRS.state.lastBlock, NRS.handleInitialBlocks);
					if (NRS.account) {
						NRS.getInitialTransactions();
						NRS.getAccountInfo();
					}
				} else if (previousLastBlock != NRS.state.lastBlock) {
					NRS.tempBlocks = [];
					if (NRS.account) {
						NRS.getAccountInfo();
					}
					NRS.getBlock(NRS.state.lastBlock, NRS.handleNewBlocks);
					if (NRS.account) {
						NRS.getNewTransactions();
						NRS.updateApprovalRequests();
					}
				} else {
					if (NRS.account) {
						NRS.getUnconfirmedTransactions(function(unconfirmedTransactions) {
							NRS.handleIncomingTransactions(unconfirmedTransactions, false);
						});
					}
				}
				if (NRS.account && !_firstTimeAfterLoginRun) {
					//Executed ~30 secs after login, can be used for tasks needing this condition state
					_firstTimeAfterLoginRun = true;
				}

				if (callback) {
					callback();
				}
			}
			/* Checks if the client is connected to active peers */
			NRS.checkConnected();
			//only done so that download progress meter updates correctly based on lastFeederHeight
			if (NRS.downloadingBlockchain) {
				NRS.updateBlockchainDownloadProgress();
			}
		});
	};

	$("#logo, .sidebar-menu").on("click", "a", function(e, data) {
		if ($(this).hasClass("ignore")) {
			$(this).removeClass("ignore");
			return;
		}

		e.preventDefault();

		if ($(this).data("toggle") == "modal") {
			return;
		}

		var page = $(this).data("page");

		if (page == NRS.currentPage) {
			if (data && data.callback) {
				data.callback();
			}
			return;
		}

		$(".page").hide();

		$(document.documentElement).scrollTop(0);

		$("#" + page + "_page").show();

		$(".content-header h1").find(".loading_dots").remove();

		if ($(this).attr("id") && $(this).attr("id") == "logo") {
			var $newActiveA = $("#dashboard_link a");
		} else {
			var $newActiveA = $(this);
		}
		var $newActivePageLi = $newActiveA.closest("li.treeview");
		var $currentActivePageLi = $("ul.sidebar-menu > li.active");

		$("ul.sidebar-menu > li.active").each(function(key, elem) {
			if ($newActivePageLi.attr("id") != $(elem).attr("id")) {
				$(elem).children("a").first().addClass("ignore").click();
			}
		});

		$("ul.sidebar-menu > li.sm_simple").removeClass("active");
		if ($newActiveA.parent("li").hasClass("sm_simple")) {
			$newActiveA.parent("li").addClass("active");
		}

		$("ul.sidebar-menu li.sm_treeview_submenu").removeClass("active");
		if($(this).parent("li").hasClass("sm_treeview_submenu")) {
			$(this).closest("li").addClass("active");
		}

		if (NRS.currentPage != "messages") {
			$("#inline_message_password").val("");
		}

		//NRS.previousPage = NRS.currentPage;
		NRS.currentPage = page;
		NRS.currentSubPage = "";
		NRS.pageNumber = 1;
		NRS.showPageNumbers = false;

		if (NRS.pages[page]) {
			NRS.pageLoading();
			NRS.resetNotificationState(page);
			if (data) {
				if (data.callback) {
					var callback = data.callback;	
				} else {
					var callback = data;
				}
			} else {
				var callback = undefined;
			}
			if (data && data.subpage) {
				var subpage = data.subpage;
			} else {
				var subpage = undefined;
			}
			NRS.pages[page](callback, subpage);
		}
	});

	$("button.goto-page, a.goto-page").click(function(event) {
		event.preventDefault();
		NRS.goToPage($(this).data("page"), undefined, $(this).data("subpage"));
	});

	NRS.loadPage = function(page, callback, subpage) {
		NRS.pageLoading();
		NRS.pages[page](callback, subpage);
	};

	NRS.goToPage = function(page, callback, subpage) {
		var $link = $("ul.sidebar-menu a[data-page=" + page + "]");

		if ($link.length > 1) {
			if ($link.last().is(":visible")) {
				$link = $link.last();
			} else {
				$link = $link.first();
			}
		}

		if ($link.length == 1) {
			$link.trigger("click", [{
				"callback": callback,
				"subpage": subpage
			}]);
			NRS.resetNotificationState(page);
		} else {
			NRS.currentPage = page;
			NRS.currentSubPage = "";
			NRS.pageNumber = 1;
			NRS.showPageNumbers = false;

			$("ul.sidebar-menu a.active").removeClass("active");
			$(".page").hide();
			$("#" + page + "_page").show();
			if (NRS.pages[page]) {
				NRS.pageLoading();
				NRS.resetNotificationState(page);
				NRS.pages[page](callback, subpage);
			}
		}
	};

	NRS.pageLoading = function() {
		NRS.hasMorePages = false;

		var $pageHeader = $("#" + NRS.currentPage + "_page .content-header h1");
		$pageHeader.find(".loading_dots").remove();
		$pageHeader.append("<span class='loading_dots'><span>.</span><span>.</span><span>.</span></span>");
	};

	NRS.pageLoaded = function(callback) {
		var $currentPage = $("#" + NRS.currentPage + "_page");

		$currentPage.find(".content-header h1 .loading_dots").remove();

		if ($currentPage.hasClass("paginated")) {
			NRS.addPagination();
		}

		if (callback) {
			callback();
		}
	};

	NRS.addPagination = function(section) {
		var firstStartNr = 1;
		var firstEndNr = NRS.itemsPerPage;
		var currentStartNr = (NRS.pageNumber-1) * NRS.itemsPerPage + 1;
		var currentEndNr = NRS.pageNumber * NRS.itemsPerPage;

		var prevHTML = '<span style="display:inline-block;width:48px;text-align:right;">';
		var firstHTML = '<span style="display:inline-block;min-width:48px;text-align:right;vertical-align:top;margin-top:4px;">';
		var currentHTML = '<span style="display:inline-block;min-width:48px;text-align:left;vertical-align:top;margin-top:4px;">';
		var nextHTML = '<span style="display:inline-block;width:48px;text-align:left;">';

		if (NRS.pageNumber > 1) {
			prevHTML += "<a href='#' data-page='" + (NRS.pageNumber - 1) + "' title='" + $.t("previous") + "' style='font-size:20px;'>";
			prevHTML += "<i class='fa fa-arrow-circle-left'></i></a>";
		} else {
			prevHTML += '&nbsp;';
		}

		if (NRS.hasMorePages) {
			currentHTML += currentStartNr + "-" + currentEndNr + "&nbsp;";
			nextHTML += "<a href='#' data-page='" + (NRS.pageNumber + 1) + "' title='" + $.t("next") + "' style='font-size:20px;'>";
			nextHTML += "<i class='fa fa-arrow-circle-right'></i></a>";
		} else {
			if (NRS.pageNumber > 1) {
				currentHTML += currentStartNr + "+";
			} else {
				currentHTML += "&nbsp;";
			}
			nextHTML += "&nbsp;";
		}
		if (NRS.pageNumber > 1) {
			firstHTML += "&nbsp;<a href='#' data-page='1'>" + firstStartNr + "-" + firstEndNr + "</a>&nbsp;|&nbsp;";
		} else {
			firstHTML += "&nbsp;";
		}

		prevHTML += '</span>';
		firstHTML += '</span>'; 
		currentHTML += '</span>';
		nextHTML += '</span>';

		var output = prevHTML + firstHTML + currentHTML + nextHTML;
		var $paginationContainer = $("#" + NRS.currentPage + "_page .data-pagination");

		if ($paginationContainer.length) {
			$paginationContainer.html(output);
		}
	};

	$(".data-pagination").on("click", "a", function(e) {
		e.preventDefault();

		NRS.goToPageNumber($(this).data("page"));
	});

	NRS.goToPageNumber = function(pageNumber) {
		/*if (!pageLoaded) {
			return;
		}*/
		NRS.pageNumber = pageNumber;

		NRS.pageLoading();

		NRS.pages[NRS.currentPage]();
	};

		

	NRS.initUserDBSuccess = function() {
		NRS.database.select("data", [{
			"id": "asset_exchange_version"
		}], function(error, result) {
			if (!result || !result.length) {
				NRS.database.delete("assets", [], function(error, affected) {
					if (!error) {
						NRS.database.insert("data", {
							"id": "asset_exchange_version",
							"contents": 2
						});
					}
				});
			}
		});

		NRS.database.select("data", [{
			"id": "closed_groups"
		}], function(error, result) {
			if (result && result.length) {
				NRS.closedGroups = result[0].contents.split("#");
			} else {
				NRS.database.insert("data", {
					id: "closed_groups",
					contents: ""
				});
			}
		});

		NRS.databaseSupport = true;
        NRS.logConsole("Browser database initialized");
		NRS.loadContacts();
		NRS.getSettings();
		NRS.updateNotifications();
		NRS.setUnconfirmedNotifications();
		NRS.setPhasingNotifications();
	}

	NRS.initUserDBWithLegacyData = function() {
		var legacyTables = ["contacts", "assets", "data"];
		$.each(legacyTables, function(key, table) {
			NRS.legacyDatabase.select(table, null, function(error, results) {
				if (!error && results && results.length >= 0) {
					NRS.database.insert(table, results, function(error, inserts) {});
				}
			});
		});
		setTimeout(function(){ NRS.initUserDBSuccess(); }, 1000);
	}

	NRS.initUserDBFail = function() {
		NRS.database = null;
		NRS.databaseSupport = false;
		NRS.getSettings();
		NRS.updateNotifications();
		NRS.setUnconfirmedNotifications();
		NRS.setPhasingNotifications();
	}

	NRS.createLegacyDatabase = function() {
		var schema = {}
		var versionLegacyDB = 2;

		// Legacy DB before switching to account based DBs, leave schema as is
		schema["contacts"] = {
			id: {
				"primary": true,
				"autoincrement": true,
				"type": "NUMBER"
			},
			name: "VARCHAR(100) COLLATE NOCASE",
			email: "VARCHAR(200)",
			account: "VARCHAR(25)",
			accountRS: "VARCHAR(25)",
			description: "TEXT"
		}
		schema["assets"] = {
			account: "VARCHAR(25)",
			accountRS: "VARCHAR(25)",
			asset: {
				"primary": true,
				"type": "VARCHAR(25)"
			},
			description: "TEXT",
			name: "VARCHAR(10)",
			decimals: "NUMBER",
			quantityQNT: "VARCHAR(15)",
			groupName: "VARCHAR(30) COLLATE NOCASE"
		}
		schema["data"] = {
			id: {
				"primary": true,
				"type": "VARCHAR(40)"
			},
			contents: "TEXT"
		}
		if (versionLegacyDB = NRS.constants.DB_VERSION) {
			try {
				NRS.legacyDatabase = new WebDB("NRS_USER_DB", schema, versionLegacyDB, 4, function(error, db) {
					if (!error) {
						NRS.legacyDatabase.select("data", [{
							"id": "settings"
						}], function(error, result) {
							if (result && result.length > 0) {
								NRS.legacyDatabaseWithData = true;
							}
						});
					}
				});
			} catch (err) {
                NRS.logConsole("error creating database " + err.message);
			}		
		}
	};

	NRS.createDatabase = function(dbName) {
		var schema = {}

		schema["contacts"] = {
			id: {
				"primary": true,
				"autoincrement": true,
				"type": "NUMBER"
			},
			name: "VARCHAR(100) COLLATE NOCASE",
			email: "VARCHAR(200)",
			account: "VARCHAR(25)",
			accountRS: "VARCHAR(25)",
			description: "TEXT"
		}
		schema["assets"] = {
			account: "VARCHAR(25)",
			accountRS: "VARCHAR(25)",
			asset: {
				"primary": true,
				"type": "VARCHAR(25)"
			},
			description: "TEXT",
			name: "VARCHAR(10)",
			decimals: "NUMBER",
			quantityQNT: "VARCHAR(15)",
			groupName: "VARCHAR(30) COLLATE NOCASE"
		}
		schema["polls"] = {
			account: "VARCHAR(25)",
			accountRS: "VARCHAR(25)",
			name: "VARCHAR(100)",
			description: "TEXT",
			poll: "VARCHAR(25)",
			finishHeight: "VARCHAR(25)"
		}
		schema["data"] = {
			id: {
				"primary": true,
				"type": "VARCHAR(40)"
			},
			contents: "TEXT"
		}

		NRS.assetTableKeys = ["account", "accountRS", "asset", "description", "name", "position", "decimals", "quantityQNT", "groupName"];
		NRS.pollsTableKeys = ["account", "accountRS", "poll", "description", "name", "finishHeight"];


		try {
			NRS.database = new WebDB(dbName, schema, NRS.constants.DB_VERSION, 4, function(error, db) {
				if (!error) {
					NRS.database.select("data", [{
						"id": "settings"
					}], function(error, result) {
						if (result && result.length > 0) {
							NRS.databaseFirstStart = false;
							NRS.initUserDBSuccess();
						} else {
							NRS.databaseFirstStart = true;
							if (NRS.databaseFirstStart && NRS.legacyDatabaseWithData) {
								NRS.initUserDBWithLegacyData();
							} else {
								NRS.initUserDBSuccess();
							}
						}
					});
				} else {
					NRS.initUserDBFail();
				}
			});
		} catch (err) {
			NRS.initUserDBFail();
		}
	};
	
	/* Display connected state in Sidebar */
	NRS.checkConnected = function() {
		NRS.sendRequest("getPeers+", {
			"state": "CONNECTED"
		}, function(response) {
			if (response.peers && response.peers.length) {
				NRS.peerConnect = true;
				$("#connected_indicator").addClass("connected");
				$("#connected_indicator span").html($.t("Connected")).attr("data-i18n", "connected");
				$("#connected_indicator").show();
			} else {
				NRS.peerConnect = false;
				$("#connected_indicator").removeClass("connected");
				$("#connected_indicator span").html($.t("Not Connected")).attr("data-i18n", "not_connected");
				$("#connected_indicator").show();
			}
		});
	};

	NRS.getAccountInfo = function(firstRun, callback) {
		NRS.sendRequest("getAccount", {
			"account": NRS.account
		}, function(response) {
			var previousAccountInfo = NRS.accountInfo;

			NRS.accountInfo = response;

			if (response.errorCode) {
				$("#account_balance, #account_balance_sidebar, #account_nr_assets, #account_assets_balance, #account_currencies_balance, #account_nr_currencies, #account_purchase_count, #account_pending_sale_count, #account_completed_sale_count, #account_message_count, #account_alias_count").html("0");
				
				if (NRS.accountInfo.errorCode == 5) {
					if (NRS.downloadingBlockchain) {
						if (NRS.newlyCreatedAccount) {
							$("#dashboard_message").addClass("alert-success").removeClass("alert-danger").html($.t("status_new_account", {
								"account_id": String(NRS.accountRS).escapeHTML(),
								"public_key": String(NRS.publicKey).escapeHTML()
							}) + "<br /><br />" + $.t("status_blockchain_downloading")).show();
						} else {
							$("#dashboard_message").addClass("alert-success").removeClass("alert-danger").html($.t("status_blockchain_downloading")).show();
						}
					} else if (NRS.state && NRS.state.isScanning) {
						$("#dashboard_message").addClass("alert-danger").removeClass("alert-success").html($.t("status_blockchain_rescanning")).show();
					} else {
                        if (NRS.publicKey == "") {
                            $("#dashboard_message").addClass("alert-success").removeClass("alert-danger").html($.t("status_new_account_no_pk_v2", {
                                "account_id": String(NRS.accountRS).escapeHTML()
                            })).show();
                        } else {
                            $("#dashboard_message").addClass("alert-success").removeClass("alert-danger").html($.t("status_new_account", {
                                "account_id": String(NRS.accountRS).escapeHTML(),
                                "public_key": String(NRS.publicKey).escapeHTML()
                            })).show();
                        }
					}
				} else {
					$("#dashboard_message").addClass("alert-danger").removeClass("alert-success").html(NRS.accountInfo.errorDescription ? NRS.accountInfo.errorDescription.escapeHTML() : $.t("error_unknown")).show();
				}
			} else {
				if (NRS.accountRS && NRS.accountInfo.accountRS != NRS.accountRS) {
					$.growl("Generated Reed Solomon address different from the one in the blockchain!", {
						"type": "danger"
					});
					NRS.accountRS = NRS.accountInfo.accountRS;
				}

				if (NRS.downloadingBlockchain) {
					$("#dashboard_message").addClass("alert-success").removeClass("alert-danger").html($.t("status_blockchain_downloading")).show();
				} else if (NRS.state && NRS.state.isScanning) {
					$("#dashboard_message").addClass("alert-danger").removeClass("alert-success").html($.t("status_blockchain_rescanning")).show();
				} else if (!NRS.accountInfo.publicKey) {
                    var warning = NRS.publicKey != 'undefined' ? $.t("public_key_not_announced_warning", { "public_key": NRS.publicKey }) : $.t("no_public_key_warning");
					$("#dashboard_message").addClass("alert-danger").removeClass("alert-success").html(warning + " " + $.t("public_key_actions")).show();
				} else {
					$("#dashboard_message").hide();
				}

				//only show if happened within last week
				var showAssetDifference = (!NRS.downloadingBlockchain || (NRS.blocks && NRS.blocks[0] && NRS.state && NRS.state.time - NRS.blocks[0].timestamp < 60 * 60 * 24 * 7));

				if (NRS.databaseSupport) {
					NRS.database.select("data", [{
						"id": "asset_balances"
					}], function(error, asset_balance) {
						if (asset_balance && asset_balance.length) {
							var previous_balances = asset_balance[0].contents;

							if (!NRS.accountInfo.assetBalances) {
								NRS.accountInfo.assetBalances = [];
							}

							var current_balances = JSON.stringify(NRS.accountInfo.assetBalances);

							if (previous_balances != current_balances) {
								if (previous_balances != "undefined" && typeof previous_balances != "undefined") {
									previous_balances = JSON.parse(previous_balances);
								} else {
									previous_balances = [];
								}
								NRS.database.update("data", {
									contents: current_balances
								}, [{
									id: "asset_balances"
								}]);
								if (showAssetDifference) {
									NRS.checkAssetDifferences(NRS.accountInfo.assetBalances, previous_balances);
								}
							}
						} else {
							NRS.database.insert("data", {
								id: "asset_balances",
								contents: JSON.stringify(NRS.accountInfo.assetBalances)
							});
						}
					});
				} else if (showAssetDifference && previousAccountInfo && previousAccountInfo.assetBalances) {
					var previousBalances = JSON.stringify(previousAccountInfo.assetBalances);
					var currentBalances = JSON.stringify(NRS.accountInfo.assetBalances);

					if (previousBalances != currentBalances) {
						NRS.checkAssetDifferences(NRS.accountInfo.assetBalances, previousAccountInfo.assetBalances);
					}
				}

				$("#account_balance, #account_balance_sidebar").html(NRS.formatStyledAmount(response.unconfirmedBalanceNQT));
				$("#account_forged_balance").html(NRS.formatStyledAmount(response.forgedBalanceNQT));

				if (response.assetBalances) {
                    var assets = [];
                    var assetBalances = response.assetBalances;
                    var assetBalancesMap = {};
                    for (var i = 0; i < assetBalances.length; i++) {
                        if (assetBalances[i].balanceQNT != "0") {
                            assets.push(assetBalances[i].asset);
                            assetBalancesMap[assetBalances[i].asset] = assetBalances[i].balanceQNT;
                        }
                    }
                    NRS.sendRequest("getLastTrades", {
                        "assets": assets
                    }, function(response) {
                        if (response.trades && response.trades.length) {
                            var assetTotal = 0;
                            for (i=0; i < response.trades.length; i++) {
                                var trade = response.trades[i];
                                assetTotal += assetBalancesMap[trade.asset] * trade.priceNQT / 100000000;
                            }
                            $("#account_assets_balance").html(NRS.formatStyledAmount(new Big(assetTotal).toFixed(8)));
                            $("#account_nr_assets").html(response.trades.length);
                        } else {
                            $("#account_assets_balance").html(0);
                            $("#account_nr_assets").html(0);
                        }
                    });
                } else {
                    $("#account_assets_balance").html(0);
                    $("#account_nr_assets").html(0);
                }

				if (response.accountCurrencies) {
                    var currencies = [];
                    var currencyBalances = response.accountCurrencies;
                    var currencyBalancesMap = {};
                    for (var i = 0; i < currencyBalances.length; i++) {
                        if (currencyBalances[i].units != "0") {
                            currencies.push(currencyBalances[i].currency);
                            currencyBalancesMap[currencyBalances[i].currency] = currencyBalances[i].units;
                        }
                    }
                    NRS.sendRequest("getLastExchanges", {
                        "currencies": currencies
                    }, function(response) {
                        if (response.exchanges && response.exchanges.length) {
                            var currencyTotal = 0;
                            for (i=0; i < response.exchanges.length; i++) {
                                var exchange = response.exchanges[i];
                                currencyTotal += currencyBalancesMap[exchange.currency] * exchange.rateNQT / 100000000;
                            }
                            $("#account_currencies_balance").html(NRS.formatStyledAmount(new Big(currencyTotal).toFixed(8)));
                            $("#account_nr_currencies").html(response.exchanges.length);
                        } else {
                            $("#account_currencies_balance").html(0);
                            $("#account_nr_currencies").html(0);
                        }
                    });
                } else {
                    $("#account_currencies_balance").html(0);
                    $("#account_nr_currencies").html(0);
                }

				/* Display message count in top and limit to 100 for now because of possible performance issues*/
				NRS.sendRequest("getBlockchainTransactions+", {
					"account": NRS.account,
					"type": 1,
					"subtype": 0,
					"firstIndex": 0,
					"lastIndex": 99
				}, function(response) {
					if (response.transactions && response.transactions.length) {
						if (response.transactions.length > 99)
							$("#account_message_count").empty().append("99+");
						else
							$("#account_message_count").empty().append(response.transactions.length);
					} else {
						$("#account_message_count").empty().append("0");
					}
				});	
				
				/***  ******************   ***/
				
				NRS.sendRequest("getAliasCount+", {
					"account":NRS.account
				}, function(response) {
					if (response.numberOfAliases != null) {
						$("#account_alias_count").empty().append(response.numberOfAliases);
					}
				});
				
				NRS.sendRequest("getDGSPurchaseCount+", {
					"buyer": NRS.account
				}, function(response) {
					if (response.numberOfPurchases != null) {
						$("#account_purchase_count").empty().append(response.numberOfPurchases);
					}
				});

				NRS.sendRequest("getDGSPendingPurchases+", {
					"seller": NRS.account
				}, function(response) {
					if (response.purchases && response.purchases.length) {
						$("#account_pending_sale_count").empty().append(response.purchases.length);
					} else {
						$("#account_pending_sale_count").empty().append("0");
					}
				});

				NRS.sendRequest("getDGSPurchaseCount+", {
					"seller": NRS.account,
					"completed": true
				}, function(response) {
					if (response.numberOfPurchases != null) {
						$("#account_completed_sale_count").empty().append(response.numberOfPurchases);
					}
				});

				if (NRS.lastBlockHeight) {
					var isLeased = NRS.lastBlockHeight >= NRS.accountInfo.currentLeasingHeightFrom;
					if (isLeased != NRS.IsLeased) {
						var leasingChange = true;
						NRS.isLeased = isLeased;
					}
				} else {
					var leasingChange = false;
				}

				if (leasingChange ||
					(response.currentLeasingHeightFrom != previousAccountInfo.currentLeasingHeightFrom) ||
					(response.lessors && !previousAccountInfo.lessors) ||
					(!response.lessors && previousAccountInfo.lessors) ||
					(response.lessors && previousAccountInfo.lessors && response.lessors.sort().toString() != previousAccountInfo.lessors.sort().toString())) {
					NRS.updateAccountLeasingStatus();
				}

				if (response.name) {
					$("#account_name").html(response.name.escapeHTML()).removeAttr("data-i18n");
				}
			}

//			if (firstRun) {
				$("#account_balance, #account_balance_sidebar, #account_assets_balance, #account_nr_assets, #account_currencies_balance, #account_nr_currencies, #account_purchase_count, #account_pending_sale_count, #account_completed_sale_count, #account_message_count, #account_alias_count").removeClass("loading_dots");
//			}

			if (callback) {
				callback();
			}
		});
	};

	NRS.updateAccountLeasingStatus = function() {
		var accountLeasingLabel = "";
		var accountLeasingStatus = "";
		var nextLesseeStatus = "";
		if (NRS.accountInfo.nextLeasingHeightFrom < NRS.constants.MAX_INT_JAVA) {
			nextLesseeStatus = $.t("next_lessee_status", {
				"start": String(NRS.accountInfo.nextLeasingHeightFrom).escapeHTML(),
				"end": String(NRS.accountInfo.nextLeasingHeightTo).escapeHTML(),
				"account": String(NRS.convertNumericToRSAccountFormat(NRS.accountInfo.nextLessee)).escapeHTML()
			})
		}

		if (NRS.lastBlockHeight >= NRS.accountInfo.currentLeasingHeightFrom) {
			accountLeasingLabel = $.t("leased_out");
			accountLeasingStatus = $.t("balance_is_leased_out", {
				"blocks": String(NRS.accountInfo.currentLeasingHeightTo - NRS.lastBlockHeight).escapeHTML(),
				"end": String(NRS.accountInfo.currentLeasingHeightTo).escapeHTML(),
				"account": String(NRS.accountInfo.currentLesseeRS).escapeHTML()
			});
			$("#lease_balance_message").html($.t("balance_leased_out_help"));
		} else if (NRS.lastBlockHeight < NRS.accountInfo.currentLeasingHeightTo) {
			accountLeasingLabel = $.t("leased_soon");
			accountLeasingStatus = $.t("balance_will_be_leased_out", {
				"blocks": String(NRS.accountInfo.currentLeasingHeightFrom - NRS.lastBlockHeight).escapeHTML(),
				"start": String(NRS.accountInfo.currentLeasingHeightFrom).escapeHTML(),
				"end": String(NRS.accountInfo.currentLeasingHeightTo).escapeHTML(),
				"account": String(NRS.accountInfo.currentLesseeRS).escapeHTML()
			});
			$("#lease_balance_message").html($.t("balance_leased_out_help"));
		} else {
			accountLeasingStatus = $.t("balance_not_leased_out");
			$("#lease_balance_message").html($.t("balance_leasing_help"));
		}
		if (nextLesseeStatus != "") {
			accountLeasingStatus += "<br>" + nextLesseeStatus;
		}

		//no reed solomon available? do it myself? todo
		if (NRS.accountInfo.lessors) {
			if (accountLeasingLabel) {
				accountLeasingLabel += ", ";
				accountLeasingStatus += "<br /><br />";
			}

			accountLeasingLabel += $.t("x_lessor", {
				"count": NRS.accountInfo.lessors.length
			});
			accountLeasingStatus += $.t("x_lessor_lease", {
				"count": NRS.accountInfo.lessors.length
			});

			var rows = "";

			for (var i = 0; i < NRS.accountInfo.lessorsRS.length; i++) {
				var lessor = NRS.accountInfo.lessorsRS[i];
				var lessorInfo = NRS.accountInfo.lessorsInfo[i];
				var blocksLeft = lessorInfo.currentHeightTo - NRS.lastBlockHeight;
				var blocksLeftTooltip = "From block " + lessorInfo.currentHeightFrom + " to block " + lessorInfo.currentHeightTo;
				var nextLessee = "Not set";
				var nextTooltip = "Next lessee not set";
				if (lessorInfo.nextLesseeRS == NRS.accountRS) {
					nextLessee = "You";
					nextTooltip = "From block " + lessorInfo.nextHeightFrom + " to block " + lessorInfo.nextHeightTo;
				} else if (lessorInfo.nextHeightFrom < NRS.constants.MAX_INT_JAVA) {
					nextLessee = "Not you";
					nextTooltip = "Account " + NRS.getAccountTitle(lessorInfo.nextLesseeRS) +" from block " + lessorInfo.nextHeightFrom + " to block " + lessorInfo.nextHeightTo;
				}
				rows += "<tr>" +
					"<td><a href='#' data-user='" + String(lessor).escapeHTML() + "' class='show_account_modal_action'>" + NRS.getAccountTitle(lessor) + "</a></td>" +
					"<td>" + String(lessorInfo.effectiveBalanceNHZ).escapeHTML() + "</td>" +
					"<td><label>" + String(blocksLeft).escapeHTML() + " <i class='fa fa-question-circle show_popover' data-toggle='tooltip' title='" + blocksLeftTooltip + "' data-placement='right' style='color:#4CAA6E'></i></label></td>" +
					"<td><label>" + String(nextLessee).escapeHTML() + " <i class='fa fa-question-circle show_popover' data-toggle='tooltip' title='" + nextTooltip + "' data-placement='right' style='color:#4CAA6E'></i></label></td>" +
				"</tr>";
			}

			$("#account_lessor_table tbody").empty().append(rows);
			$("#account_lessor_container").show();
			$("#account_lessor_table [data-toggle='tooltip']").tooltip();
		} else {
			$("#account_lessor_table tbody").empty();
			$("#account_lessor_container").hide();
		}

		if (accountLeasingLabel) {
			$("#account_leasing").html(accountLeasingLabel).show();
		} else {
			$("#account_leasing").hide();
		}

		if (accountLeasingStatus) {
			$("#account_leasing_status").html(accountLeasingStatus).show();
		} else {
			$("#account_leasing_status").hide();
		}
	};

	NRS.checkAssetDifferences = function(current_balances, previous_balances) {
		var current_balances_ = {};
		var previous_balances_ = {};

		if (previous_balances && previous_balances.length) {
			for (var k in previous_balances) {
				previous_balances_[previous_balances[k].asset] = previous_balances[k].balanceQNT;
			}
		}

		if (current_balances && current_balances.length) {
			for (var k in current_balances) {
				current_balances_[current_balances[k].asset] = current_balances[k].balanceQNT;
			}
		}

		var diff = {};

		for (var k in previous_balances_) {
			if (!(k in current_balances_)) {
				diff[k] = "-" + previous_balances_[k];
			} else if (previous_balances_[k] !== current_balances_[k]) {
				var change = (new BigInteger(current_balances_[k]).subtract(new BigInteger(previous_balances_[k]))).toString();
				diff[k] = change;
			}
		}

		for (k in current_balances_) {
			if (!(k in previous_balances_)) {
				diff[k] = current_balances_[k]; // property is new
			}
		}

		var nr = Object.keys(diff).length;

		if (nr == 0) {
			return;
		} else if (nr <= 3) {
			for (k in diff) {
				NRS.sendRequest("getAsset", {
					"asset": k,
					"_extra": {
						"asset": k,
						"difference": diff[k]
					}
				}, function(asset, input) {
					if (asset.errorCode) {
						return;
					}
					asset.difference = input["_extra"].difference;
					asset.asset = input["_extra"].asset;

					if (asset.difference.charAt(0) != "-") {
						var quantity = NRS.formatQuantity(asset.difference, asset.decimals)

						if (quantity != "0") {
							if (parseInt(quantity) == 1) {
								$.growl($.t("you_received_assets", {
									"name": String(asset.name).escapeHTML()
								}), {
									"type": "success"
								});
							} else {
								$.growl($.t("you_received_assets_plural", {
									"name": String(asset.name).escapeHTML(),
									"count": quantity
								}), {
									"type": "success"
								});
							}
							NRS.loadAssetExchangeSidebar();
						}
					} else {
						asset.difference = asset.difference.substring(1);

						var quantity = NRS.formatQuantity(asset.difference, asset.decimals)

						if (quantity != "0") {
							if (parseInt(quantity) == 1) {
								$.growl($.t("you_sold_assets", {
									"name": String(asset.name).escapeHTML()
								}), {
									"type": "success"
								});
							} else {
								$.growl($.t("you_sold_assets_plural", {
									"name": String(asset.name).escapeHTML(),
									"count": quantity
								}), {
									"type": "success"
								});
							} 
							NRS.loadAssetExchangeSidebar();
						}
					}
				});
			}
		} else {
			$.growl($.t("multiple_assets_differences"), {
				"type": "success"
			});
		}
	};

	NRS.checkLocationHash = function(password) {
		if (window.location.hash) {
			var hash = window.location.hash.replace("#", "").split(":")

			if (hash.length == 2) {
				if (hash[0] == "message") {
					var $modal = $("#send_message_modal");
				} else if (hash[0] == "send") {
					var $modal = $("#send_money_modal");
				} else if (hash[0] == "asset") {
					NRS.goToAsset(hash[1]);
					return;
				} else {
					var $modal = "";
				}

				if ($modal) {
					var account_id = String($.trim(hash[1]));
					$modal.find("input[name=recipient]").val(account_id.unescapeHTML()).trigger("blur");
					if (password && typeof password == "string") {
						$modal.find("input[name=secretPhrase]").val(password);
					}
					$modal.modal("show");
				}
			}

			window.location.hash = "#";
		}
	};

	NRS.updateBlockchainDownloadProgress = function() {
		var lastNumBlocks = 5000;
		$('#downloading_blockchain .last_num_blocks').html($.t('last_num_blocks', { "blocks": lastNumBlocks }));
		
		if (!NRS.serverConnect || !NRS.peerConnect) {
			$("#downloading_blockchain .db_active").hide();
			$("#downloading_blockchain .db_halted").show();
		} else {
			$("#downloading_blockchain .db_halted").hide();
			$("#downloading_blockchain .db_active").show();

			var percentageTotal = 0;
			var blocksLeft = undefined;
			var percentageLast = 0;
			if (NRS.state.lastBlockchainFeederHeight && NRS.state.numberOfBlocks <= NRS.state.lastBlockchainFeederHeight) {
				percentageTotal = parseInt(Math.round((NRS.state.numberOfBlocks / NRS.state.lastBlockchainFeederHeight) * 100), 10);
				blocksLeft = NRS.state.lastBlockchainFeederHeight - NRS.state.numberOfBlocks;
				if (blocksLeft <= lastNumBlocks && NRS.state.lastBlockchainFeederHeight > lastNumBlocks) {
					percentageLast = parseInt(Math.round(((lastNumBlocks - blocksLeft) / lastNumBlocks) * 100), 10);
				}
			}
			if (!blocksLeft || blocksLeft < parseInt(lastNumBlocks / 2)) {
				$("#downloading_blockchain .db_progress_total").hide();
			} else {
				$("#downloading_blockchain .db_progress_total").show();
				$("#downloading_blockchain .db_progress_total .progress-bar").css("width", percentageTotal + "%");
				$("#downloading_blockchain .db_progress_total .sr-only").html($.t("percent_complete", {
					"percent": percentageTotal
				}));
			}
			if (!blocksLeft || blocksLeft >= (lastNumBlocks * 2) || NRS.state.lastBlockchainFeederHeight <= lastNumBlocks) {
				$("#downloading_blockchain .db_progress_last").hide();
			} else {
				$("#downloading_blockchain .db_progress_last").show();
				$("#downloading_blockchain .db_progress_last .progress-bar").css("width", percentageLast + "%");
				$("#downloading_blockchain .db_progress_last .sr-only").html($.t("percent_complete", {
					"percent": percentageLast
				}));
			}
			if (blocksLeft) {
				$("#downloading_blockchain .blocks_left_outer").show();
				$("#downloading_blockchain .blocks_left").html($.t("blocks_left", { "numBlocks": blocksLeft }));
			}
		}
	};

	NRS.checkIfOnAFork = function() {
		if (!NRS.downloadingBlockchain) {
			var onAFork = true;

			if (NRS.blocks && NRS.blocks.length >= 10) {
				for (var i = 0; i < 10; i++) {
					if (NRS.blocks[i].generator != NRS.account) {
						onAFork = false;
						break;
					}
				}
			} else {
				onAFork = false;
			}

			if (onAFork) {
				$.growl($.t("fork_warning"), {
					"type": "danger"
				});
			}
		}
	};

    NRS.printEnvInfo = function() {
        NRS.logProperty("navigator.userAgent");
        NRS.logProperty("navigator.platform");
        NRS.logProperty("navigator.appVersion");
        NRS.logProperty("navigator.appName");
        NRS.logProperty("navigator.appCodeName");
        NRS.logProperty("navigator.hardwareConcurrency");
        NRS.logProperty("navigator.maxTouchPoints");
        NRS.logProperty("navigator.languages");
        NRS.logProperty("navigator.language");
        NRS.logProperty("navigator.cookieEnabled");
        NRS.logProperty("navigator.onLine");
        NRS.logProperty("NRS.isTestNet");
        NRS.logProperty("NRS.needsAdminPassword");
    };

	$("#id_search").on("submit", function(e) {
		e.preventDefault();

		var id = $.trim($("#id_search input[name=q]").val());

		if (/NHZ\-/i.test(id)) {
			NRS.sendRequest("getAccount", {
				"account": id
			}, function(response, input) {
				if (!response.errorCode) {
					response.account = input.account;
					NRS.showAccountModal(response);
				} else {
					$.growl($.t("error_search_no_results"), {
						"type": "danger"
					});
				}
			});
		} else {
			if (!/^\d+$/.test(id)) {
				$.growl($.t("error_search_invalid"), {
					"type": "danger"
				});
				return;
			}
			NRS.sendRequest("getTransaction", {
				"transaction": id
			}, function(response, input) {
				if (!response.errorCode) {
					response.transaction = input.transaction;
					NRS.showTransactionModal(response);
				} else {
					NRS.sendRequest("getAccount", {
						"account": id
					}, function(response, input) {
						if (!response.errorCode) {
							response.account = input.account;
							NRS.showAccountModal(response);
						} else {
							NRS.sendRequest("getBlock", {
								"block": id,
                                "includeTransactions": "true"
							}, function(response, input) {
								if (!response.errorCode) {
									response.block = input.block;
									NRS.showBlockModal(response);
								} else {
									$.growl($.t("error_search_no_results"), {
										"type": "danger"
									});
								}
							});
						}
					});
				}
			});
		}
	});

	return NRS;
}(NRS || {}, jQuery));

$(document).ready(function() {
	NRS.init();
});

function receiveMessage(event) {
	if (event.origin != "file://") {
		return;
	}
	//parent.postMessage("from iframe", "file://");
}

function _checkDOMenabled() {
	var storage;
	var fail;
	var uid;
	try {
	  uid = new Date;
	  (storage = window.localStorage).setItem(uid, uid);
	  fail = storage.getItem(uid) != uid;
	  storage.removeItem(uid);
	  fail && (storage = false);
	} catch (exception) {}
	return storage;
}