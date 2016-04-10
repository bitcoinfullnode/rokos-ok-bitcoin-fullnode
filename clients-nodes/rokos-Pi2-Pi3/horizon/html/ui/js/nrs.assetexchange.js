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
 */
var NRS = (function (NRS, $, undefined) {
    NRS.assets = [];
    NRS.assetIds = [];
    NRS.closedGroups = [];
    NRS.assetSearch = false;
    NRS.lastIssuerCheck = false;
    NRS.viewingAsset = false; //viewing non-bookmarked asset
    NRS.currentAsset = {};
    NRS.assetTradeHistoryType = "everyone";
    var currentAssetID = 0;

    NRS.pages.asset_exchange = function (callback) {
        $(".content.content-stretch:visible").width($(".page:visible").width());

        if (NRS.databaseSupport) {
            NRS.assets = [];
            NRS.assetIds = [];

            NRS.database.select("assets", null, function (error, assets) {
                //select already bookmarked assets
                $.each(assets, function (index, asset) {
                    NRS.cacheAsset(asset);
                });

                //check owned assets, see if any are not yet in bookmarked assets
                if (NRS.accountInfo.unconfirmedAssetBalances) {
                    var newAssetIds = [];

                    $.each(NRS.accountInfo.unconfirmedAssetBalances, function (key, assetBalance) {
                        if (NRS.assetIds.indexOf(assetBalance.asset) == -1) {
                            newAssetIds.push(assetBalance.asset);
                            NRS.assetIds.push(assetBalance.asset);
                        }
                    });

                    //add to bookmarked assets
                    if (newAssetIds.length) {
                        var qs = [];

                        for (var i = 0; i < newAssetIds.length; i++) {
                            qs.push("assets=" + encodeURIComponent(newAssetIds[i]));
                        }

                        qs = qs.join("&");
                        //first get the assets info
                        NRS.sendRequest("getAssets+", {
                            //special request.. ugly hack.. also does POST due to URL max length
                            "querystring": qs
                        }, function (response) {
                            if (response.assets && response.assets.length) {
                                NRS.saveAssetBookmarks(response.assets, function () {
                                    NRS.loadAssetExchangeSidebar(callback);
                                });
                            } else {
                                NRS.loadAssetExchangeSidebar(callback);
                            }
                        });
                    } else {
                        NRS.loadAssetExchangeSidebar(callback);
                    }
                } else {
                    NRS.loadAssetExchangeSidebar(callback);
                }
            });
        } else {
            //for users without db support, we only need to fetch owned assets
            if (NRS.accountInfo.unconfirmedAssetBalances) {
                var qs = [];

                $.each(NRS.accountInfo.unconfirmedAssetBalances, function (key, assetBalance) {
                    if (NRS.assetIds.indexOf(assetBalance.asset) == -1) {
                        qs.push("assets=" + encodeURIComponent(assetBalance.asset));
                    }
                });

                qs = qs.join("&");

                if (qs) {
                    NRS.sendRequest("getAssets+", {
                        "querystring": qs
                    }, function (response) {
                        if (response.assets && response.assets.length) {
                            $.each(response.assets, function (key, asset) {
                                NRS.cacheAsset(asset);
                            });
                        }
                        NRS.loadAssetExchangeSidebar(callback);
                    });
                } else {
                    NRS.loadAssetExchangeSidebar(callback);
                }
            } else {
                NRS.loadAssetExchangeSidebar(callback);
            }
        }
    };

    NRS.cacheAsset = function (asset) {
        if (NRS.assetIds.indexOf(asset.asset) != -1) {
            return;
        }

        NRS.assetIds.push(asset.asset);

        if (!asset.groupName) {
            asset.groupName = "";
        }

        var cachedAsset = {
            "asset": String(asset.asset),
            "name": String(asset.name).toLowerCase(),
            "description": String(asset.description),
            "groupName": String(asset.groupName).toLowerCase(),
            "account": String(asset.account),
            "accountRS": String(asset.accountRS),
            "quantityQNT": String(asset.quantityQNT),
            "decimals": parseInt(asset.decimals, 10)
        };

        NRS.assets.push(cachedAsset);
    };

    NRS.forms.addAssetBookmark = function ($modal) {
        var data = NRS.getFormData($modal.find("form:first"));

        data.id = $.trim(data.id);

        if (!data.id) {
            return {
                "error": $.t("error_asset_or_account_id_required")
            };
        }

        if (!/^\d+$/.test(data.id) && !/^NHZ\-/i.test(data.id)) {
            return {
                "error": $.t("error_asset_or_account_id_invalid")
            };
        }

        if (/^NHZ\-/i.test(data.id)) {
            NRS.sendRequest("getAssetsByIssuer", {
                "account": data.id
            }, function (response) {
                if (response.errorCode) {
                    NRS.showModalError(NRS.translateServerError(response), $modal);
                } else {
                    if (response.assets && response.assets[0] && response.assets[0].length) {
                        NRS.saveAssetBookmarks(response.assets[0], NRS.forms.addAssetBookmarkComplete);
                    } else {
                        NRS.showModalError($.t("account_no_assets"), $modal);
                    }
                    //NRS.saveAssetIssuer(data.id);
                }
            });
        } else {
            NRS.sendRequest("getAsset", {
                "asset": data.id
            }, function (response) {
                if (response.errorCode) {
                    NRS.sendRequest("getAssetsByIssuer", {
                        "account": data.id
                    }, function (response) {
                        if (response.errorCode) {
                            NRS.showModalError(NRS.translateServerError(response), $modal);
                        } else {
                            if (response.assets && response.assets[0] && response.assets[0].length) {
                                NRS.saveAssetBookmarks(response.assets[0], NRS.forms.addAssetBookmarkComplete);
                                //NRS.saveAssetIssuer(data.id);
                            } else {
                                NRS.showModalError($.t("no_asset_found"), $modal);
                            }
                        }
                    });
                } else {
                    NRS.saveAssetBookmarks(new Array(response), NRS.forms.addAssetBookmarkComplete);
                }
            });
        }
    };

    $("#asset_exchange_bookmark_this_asset").on("click", function () {
        if (NRS.viewingAsset) {
            NRS.saveAssetBookmarks(new Array(NRS.viewingAsset), function (newAssets) {
                NRS.viewingAsset = false;
                NRS.loadAssetExchangeSidebar(function () {
                    $("#asset_exchange_sidebar").find("a[data-asset=" + newAssets[0].asset + "]").addClass("active").trigger("click");
                });
            });
        }
    });

    NRS.forms.addAssetBookmarkComplete = function (newAssets, submittedAssets) {
        NRS.assetSearch = false;
        var assetExchangeSidebar = $("#asset_exchange_sidebar");
        if (newAssets.length == 0) {
            NRS.closeModal();
            $.growl($.t("error_asset_already_bookmarked", {
                "count": submittedAssets.length
            }), {
                "type": "danger"
            });
            assetExchangeSidebar.find("a.active").removeClass("active");
            assetExchangeSidebar.find("a[data-asset=" + submittedAssets[0].asset + "]").addClass("active").trigger("click");
        } else {
            NRS.closeModal();

            var message = $.t("success_asset_bookmarked", {
                "count": newAssets.length
            });

            if (!NRS.databaseSupport) {
                message += " " + $.t("error_assets_save_db");
            }

            $.growl(message, {
                "type": "success"
            });

            NRS.loadAssetExchangeSidebar(function () {
                assetExchangeSidebar.find("a.active").removeClass("active");
                assetExchangeSidebar.find("a[data-asset=" + newAssets[0].asset + "]").addClass("active").trigger("click");
            });
        }
    };

    NRS.saveAssetBookmarks = function (assets, callback) {
        var newAssetIds = [];
        var newAssets = [];

        $.each(assets, function (key, asset) {
            var newAsset = {
                "asset": String(asset.asset),
                "name": String(asset.name),
                "description": String(asset.description),
                "account": String(asset.account),
                "accountRS": String(asset.accountRS),
                "quantityQNT": String(asset.quantityQNT),
                "decimals": parseInt(asset.decimals, 10),
                "groupName": ""
            };

            newAssets.push(newAsset);

            if (NRS.databaseSupport) {
                newAssetIds.push({
                    "asset": String(asset.asset)
                });
            } else if (NRS.assetIds.indexOf(asset.asset) == -1) {
                NRS.assetIds.push(asset.asset);
                newAsset.name = newAsset.name.toLowerCase();
                NRS.assets.push(newAsset);
            }
        });

        if (!NRS.databaseSupport) {
            if (callback) {
                callback(newAssets, assets);
            }
            return;
        }

        NRS.database.select("assets", newAssetIds, function (error, existingAssets) {
            var existingIds = [];

            if (existingAssets.length) {
                $.each(existingAssets, function (index, asset) {
                    existingIds.push(asset.asset);
                });

                newAssets = $.grep(newAssets, function (v) {
                    return (existingIds.indexOf(v.asset) === -1);
                });
            }

            if (newAssets.length == 0) {
                if (callback) {
                    callback([], assets);
                }
            } else {
                NRS.database.insert("assets", newAssets, function () {
                    $.each(newAssets, function (key, asset) {
                        asset.name = asset.name.toLowerCase();
                        NRS.assetIds.push(asset.asset);
                        NRS.assets.push(asset);
                    });

                    if (callback) {
                        //for some reason we need to wait a little or DB won't be able to fetch inserted record yet..
                        setTimeout(function () {
                            callback(newAssets, assets);
                        }, 50);
                    }
                });
            }
        });
    };

    NRS.positionAssetSidebar = function () {
        var assetExchangeSidebar = $("#asset_exchange_sidebar");
        assetExchangeSidebar.parent().css("position", "relative");
        assetExchangeSidebar.parent().css("padding-bottom", "5px");
        assetExchangeSidebar.height($(window).height() - 120);
    };

    //called on opening the asset exchange page and automatic refresh
    NRS.loadAssetExchangeSidebar = function (callback) {
        var assetExchangePage = $("#asset_exchange_page");
        var assetExchangeSidebarContent = $("#asset_exchange_sidebar_content");
        if (!NRS.assets.length) {
            NRS.pageLoaded(callback);
            assetExchangeSidebarContent.empty();
            $("#no_asset_selected, #loading_asset_data, #no_asset_search_results, #asset_details").hide();
            $("#no_assets_available").show();
            assetExchangePage.addClass("no_assets");
            return;
        }

        var rows = "";

        assetExchangePage.removeClass("no_assets");

        NRS.positionAssetSidebar();

        NRS.assets.sort(function (a, b) {
            if (!a.groupName && !b.groupName) {
                if (a.name > b.name) {
                    return 1;
                } else if (a.name < b.name) {
                    return -1;
                } else {
                    return 0;
                }
            } else if (!a.groupName) {
                return 1;
            } else if (!b.groupName) {
                return -1;
            } else if (a.groupName > b.groupName) {
                return 1;
            } else if (a.groupName < b.groupName) {
                return -1;
            } else {
                if (a.name > b.name) {
                    return 1;
                } else if (a.name < b.name) {
                    return -1;
                } else {
                    return 0;
                }
            }
        });

        var lastGroup = "";
        var ungrouped = true;
        var isClosedGroup = false;

        var isSearch = NRS.assetSearch !== false;
        var searchResults = 0;

        for (var i = 0; i < NRS.assets.length; i++) {
            var asset = NRS.assets[i];

            if (isSearch) {
                if (NRS.assetSearch.indexOf(asset.asset) == -1) {
                    continue;
                } else {
                    searchResults++;
                }
            }

            if (asset.groupName.toLowerCase() != lastGroup) {
                var to_check = (asset.groupName ? asset.groupName : "undefined");
                isClosedGroup = NRS.closedGroups.indexOf(to_check) != -1;
                if (asset.groupName) {
                    ungrouped = false;
                    rows += "<a href='#' class='list-group-item list-group-item-header" + (asset.groupName == "Ignore List" ? " no-context" : "") + "'";
                    rows += (asset.groupName != "Ignore List" ? " data-context='asset_exchange_sidebar_group_context' " : "data-context=''");
                    rows += " data-groupname='" + asset.groupName.escapeHTML() + "' data-closed='" + isClosedGroup + "'>";
                    rows += "<h4 class='list-group-item-heading'>" + asset.groupName.toUpperCase().escapeHTML() + "</h4>";
                    rows += "<i class='fa fa-angle-" + (isClosedGroup ? "right" : "down") + " group_icon'></i></h4></a>";
                } else {
                    ungrouped = true;
                    rows += "<a href='#' class='list-group-item list-group-item-header no-context' data-closed='" + isClosedGroup + "'>";
                    rows += "<h4 class='list-group-item-heading'>UNGROUPED <i class='fa pull-right fa-angle-" + (isClosedGroup ? "right" : "down") + "'></i></h4>";
                    rows += "</a>";
                }

                lastGroup = asset.groupName.toLowerCase();
            }

            var ownsAsset = false;
            var ownsQuantityQNT = 0;

            if (NRS.accountInfo.assetBalances) {
                $.each(NRS.accountInfo.assetBalances, function (key, assetBalance) {
                    if (assetBalance.asset == asset.asset && assetBalance.balanceQNT != "0") {
                        ownsAsset = true;
                        ownsQuantityQNT = assetBalance.balanceQNT;
                        return false;
                    }
                });
            }

            rows += "<a href='#' class='list-group-item list-group-item-" + (ungrouped ? "ungrouped" : "grouped") + (ownsAsset ? " owns_asset" : " not_owns_asset") + "' ";
            rows += "data-cache='" + i + "' ";
            rows += "data-asset='" + String(asset.asset).escapeHTML() + "'" + (!ungrouped ? " data-groupname='" + asset.groupName.escapeHTML() + "'" : "");
            rows += (isClosedGroup ? " style='display:none'" : "") + " data-closed='" + isClosedGroup + "'>";
            rows += "<h4 class='list-group-item-heading'>" + asset.name.escapeHTML() + "</h4>";
            rows += "<p class='list-group-item-text'><span>" + $.t('quantity') + "</span>: " + NRS.formatQuantity(ownsQuantityQNT, asset.decimals) + "</p>";
            rows += "</a>";
        }

        var exchangeSidebar = $("#asset_exchange_sidebar");
        var active = exchangeSidebar.find("a.active");


        if (active.length) {
            active = active.data("asset");
        } else {
            active = false;
        }

        assetExchangeSidebarContent.empty().append(rows);
        var assetExchangeSidebarSearch = $("#asset_exchange_sidebar_search");
        assetExchangeSidebarSearch.show();

        if (isSearch) {
            if (active && NRS.assetSearch.indexOf(active) != -1) {
                //check if currently selected asset is in search results, if so keep it at that
                exchangeSidebar.find("a[data-asset=" + active + "]").addClass("active");
            } else if (NRS.assetSearch.length == 1) {
                //if there is only 1 search result, click it
                exchangeSidebar.find("a[data-asset=" + NRS.assetSearch[0] + "]").addClass("active").trigger("click");
            }
        } else if (active) {
            exchangeSidebar.find("a[data-asset=" + active + "]").addClass("active");
        }

        if (isSearch || NRS.assets.length >= 10) {
            assetExchangeSidebarSearch.show();
        } else {
            assetExchangeSidebarSearch.hide();
        }

        if (isSearch && NRS.assetSearch.length == 0) {
            $("#no_asset_search_results").show();
            $("#asset_details, #no_asset_selected, #no_assets_available").hide();
        } else if (!exchangeSidebar.find("a.active").length) {
            $("#no_asset_selected").show();
            $("#asset_details, #no_assets_available, #no_asset_search_results").hide();
        } else if (active) {
            $("#no_assets_available, #no_asset_selected, #no_asset_search_results").hide();
        }

        if (NRS.viewingAsset) {
            $("#asset_exchange_bookmark_this_asset").show();
        } else {
            $("#asset_exchange_bookmark_this_asset").hide();
        }

        NRS.pageLoaded(callback);
    };

    NRS.incoming.asset_exchange = function () {
        var assetExchangeSidebar = $("#asset_exchange_sidebar");
        if (!NRS.viewingAsset) {
            //refresh active asset
            var $active = assetExchangeSidebar.find("a.active");

            if ($active.length) {
                $active.trigger("click", [{
                    "refresh": true
                }]);
            }
        } else {
            NRS.loadAsset(NRS.viewingAsset, true);
        }

        //update assets owned (colored)
        assetExchangeSidebar.find("a.list-group-item.owns_asset").removeClass("owns_asset").addClass("not_owns_asset");

        if (NRS.accountInfo.assetBalances) {
            $.each(NRS.accountInfo.assetBalances, function (key, assetBalance) {
                if (assetBalance.balanceQNT != "0") {
                    $("#asset_exchange_sidebar").find("a.list-group-item[data-asset=" + assetBalance.asset + "]").addClass("owns_asset").removeClass("not_owns_asset");
                }
            });
        }
    };

    $("#asset_exchange_sidebar").on("click", "a", function (e, data) {
        e.preventDefault();

        currentAssetID = String($(this).data("asset")).escapeHTML();

        //refresh is true if data is refreshed automatically by the system (when a new block arrives)
        var refresh = (data && data.refresh);

        //clicked on a group
        if (!currentAssetID) {
            if (NRS.databaseSupport) {
                var group = $(this).data("groupname");
                var closed = $(this).data("closed");

                var $links;
                if (!group) {
                    $links = $("#asset_exchange_sidebar").find("a.list-group-item-ungrouped");
                } else {
                    $links = $("#asset_exchange_sidebar").find("a.list-group-item-grouped[data-groupname='" + group.escapeHTML() + "']");
                }

                if (!group) {
                    group = "undefined";
                }

                if (closed) {
                    var pos = NRS.closedGroups.indexOf(group);
                    if (pos >= 0) {
                        NRS.closedGroups.splice(pos);
                    }
                    $(this).data("closed", "");
                    $(this).find("i").removeClass("fa-angle-right").addClass("fa-angle-down");
                    $links.show();
                } else {
                    NRS.closedGroups.push(group);
                    $(this).data("closed", true);
                    $(this).find("i").removeClass("fa-angle-down").addClass("fa-angle-right");
                    $links.hide();
                }

                NRS.database.update("data", {
                    "contents": NRS.closedGroups.join("#")
                }, [{
                    "id": "closed_groups"
                }]);
            }

            return;
        }

        if (NRS.databaseSupport) {
            NRS.database.select("assets", [{
                "asset": currentAssetID
            }], function (error, asset) {
                if (asset && asset.length && asset[0].asset == currentAssetID) {
                    NRS.loadAsset(asset[0], refresh);
                }
            });
        } else {
            NRS.sendRequest("getAsset+", {
                "asset": currentAssetID
            }, function (response) {
                if (!response.errorCode && response.asset == currentAssetID) {
                    NRS.loadAsset(response, refresh);
                }
            });
        }
    });

    NRS.loadAsset = function (asset, refresh) {
        var assetId = asset.asset;

        NRS.currentAsset = asset;
        NRS.currentSubPage = assetId;

        if (!refresh) {
            var assetExchangeSidebar = $("#asset_exchange_sidebar");
            assetExchangeSidebar.find("a.active").removeClass("active");
            assetExchangeSidebar.find("a[data-asset=" + assetId + "]").addClass("active");

            $("#no_asset_selected, #loading_asset_data, #no_assets_available, #no_asset_search_results").hide();
            //noinspection JSValidateTypes
            $("#asset_details").show().parent().animate({
                "scrollTop": 0
            }, 0);

            $("#asset_account").html("<a href='#' data-user='" + NRS.getAccountFormatted(asset, "account") + "' class='show_account_modal_action user_info'>" + NRS.getAccountTitle(asset, "account") + "</a>");
            $("#asset_id").html(assetId.escapeHTML());
            $("#asset_decimals").html(String(asset.decimals).escapeHTML());
            $("#asset_name").html(String(asset.name).escapeHTML());
            $("#asset_description").html(String(asset.description).autoLink());
            $("#asset_quantity").html(NRS.formatQuantity(asset.quantityQNT, asset.decimals));
            $(".asset_name").html(String(asset.name).escapeHTML());
            $("#sell_asset_button").data("asset", assetId);
            $("#buy_asset_button").data("asset", assetId);
            $("#view_asset_distribution_link").data("asset", assetId);
            $("#sell_asset_for_nxt").html($.t("sell_asset_for_nxt", {
                "assetName": String(asset.name).escapeHTML()
            }));
            $("#buy_asset_with_nxt").html($.t("buy_asset_with_nxt", {
                "assetName": String(asset.name).escapeHTML()
            }));
            $("#sell_asset_price, #buy_asset_price").val("");
            $("#sell_asset_quantity, #sell_asset_total, #buy_asset_quantity, #buy_asset_total").val("0");

            var assetExchangeAskOrdersTable = $("#asset_exchange_ask_orders_table");
            var assetExchangeBidOrdersTable = $("#asset_exchange_bid_orders_table");
            var assetExchangeTradeHistoryTable = $("#asset_exchange_trade_history_table");
            assetExchangeAskOrdersTable.find("tbody").empty();
            assetExchangeBidOrdersTable.find("tbody").empty();
            assetExchangeTradeHistoryTable.find("tbody").empty();
            assetExchangeAskOrdersTable.parent().addClass("data-loading").removeClass("data-empty");
            assetExchangeBidOrdersTable.parent().addClass("data-loading").removeClass("data-empty");
            assetExchangeTradeHistoryTable.parent().addClass("data-loading").removeClass("data-empty");

            $(".data-loading img.loading").hide();

            setTimeout(function () {
                $(".data-loading img.loading").fadeIn(200);
            }, 200);

            var nrDuplicates = 0;

            $.each(NRS.assets, function (key, singleAsset) {
                if (String(singleAsset.name).toLowerCase() == String(asset.name).toLowerCase() && singleAsset.asset != assetId) {
                    nrDuplicates++;
                }
            });

            $("#asset_exchange_duplicates_warning").html($.t("asset_exchange_duplicates_warning", {
                "count": nrDuplicates
            }));

            if (NRS.databaseSupport) {
                NRS.sendRequest("getAsset", {
                    "asset": assetId
                }, function (response) {
                    if (!response.errorCode) {
                        if (response.asset != asset.asset || response.account != asset.account || response.accountRS != asset.accountRS || response.decimals != asset.decimals || response.description != asset.description || response.name != asset.name || response.quantityQNT != asset.quantityQNT) {
                            NRS.database.delete("assets", [{
                                "asset": asset.asset
                            }], function () {
                                setTimeout(function () {
                                    NRS.loadPage("asset_exchange");
                                    $.growl("Invalid asset.", {
                                        "type": "danger"
                                    });
                                }, 50);
                            });
                        }
                    }
                });
            }

            if (asset.viewingAsset) {
                $("#asset_exchange_bookmark_this_asset").show();
                NRS.viewingAsset = asset;
            } else {
                $("#asset_exchange_bookmark_this_asset").hide();
                NRS.viewingAsset = false;
            }
        }

        // Only asset issuers have the ability to pay dividends.
        if (asset.accountRS == NRS.accountRS) {
            $("#dividend_payment_link").show();
        } else {
            $("#dividend_payment_link").hide();
        }

        if (NRS.accountInfo.unconfirmedBalanceNQT == "0") {
            $("#your_nxt_balance").html("0");
            $("#buy_automatic_price").addClass("zero").removeClass("nonzero");
        } else {
            $("#your_nxt_balance").html(NRS.formatAmount(NRS.accountInfo.unconfirmedBalanceNQT));
            $("#buy_automatic_price").addClass("nonzero").removeClass("zero");
        }

        if (NRS.accountInfo.unconfirmedAssetBalances) {
            for (var i = 0; i < NRS.accountInfo.unconfirmedAssetBalances.length; i++) {
                var balance = NRS.accountInfo.unconfirmedAssetBalances[i];

                if (balance.asset == assetId) {
                    NRS.currentAsset.yourBalanceQNT = balance.unconfirmedBalanceQNT;
                    $("#your_asset_balance").html(NRS.formatQuantity(balance.unconfirmedBalanceQNT, NRS.currentAsset.decimals));
                    if (balance.unconfirmedBalanceQNT == "0") {
                        $("#sell_automatic_price").addClass("zero").removeClass("nonzero");
                    } else {
                        $("#sell_automatic_price").addClass("nonzero").removeClass("zero");
                    }
                    break;
                }
            }
        }

        if (!NRS.currentAsset.yourBalanceQNT) {
            NRS.currentAsset.yourBalanceQNT = "0";
            $("#your_asset_balance").html("0");
        }

        NRS.loadAssetOrders("ask", assetId, refresh);
        NRS.loadAssetOrders("bid", assetId, refresh);

        NRS.getAssetTradeHistory(assetId, refresh);
    };

    function processOrders(orders, type, refresh) {
        if (orders.length) {
            $("#" + (type == "ask" ? "sell" : "buy") + "_orders_count").html("(" + orders.length + (orders.length == 50 ? "+" : "") + ")");
            var rows = "";
            for (var i = 0; i < orders.length; i++) {
                var order = orders[i];
                order.priceNQT = new BigInteger(order.priceNQT);
                order.quantityQNT = new BigInteger(order.quantityQNT);
                order.totalNQT = new BigInteger(NRS.calculateOrderTotalNQT(order.quantityQNT, order.priceNQT));

                if (i == 0 && !refresh) {
                    $("#" + (type == "ask" ? "buy" : "sell") + "_asset_price").val(NRS.calculateOrderPricePerWholeQNT(order.priceNQT, NRS.currentAsset.decimals));
                }
                var statusIcon = NRS.getTransactionStatusIcon(order);
                var className = (order.account == NRS.account ? "your-order" : "");
                rows += "<tr class='" + className + "' data-transaction='" + String(order.order).escapeHTML() + "' data-quantity='" + order.quantityQNT.toString().escapeHTML() + "' data-price='" + order.priceNQT.toString().escapeHTML() + "'>" +
                    "<td><a href='#' class='show_transaction_modal_action' data-transaction='" + String(order.order).escapeHTML() + "'>" + statusIcon + "</a></td>" +
                    "<td>" + NRS.getAccountLink(order, "account", NRS.currentAsset.accountRS, "Asset Issuer") + "</td>" +
                    "<td>" + NRS.formatQuantity(order.quantityQNT, NRS.currentAsset.decimals) + "</td>" +
                    "<td>" + NRS.formatOrderPricePerWholeQNT(order.priceNQT, NRS.currentAsset.decimals) + "</td>" +
                    "<td>" + NRS.formatAmount(order.totalNQT) +
                "</tr>";
            }
            $("#asset_exchange_" + type + "_orders_table tbody").empty().append(rows);
        } else {
            $("#asset_exchange_" + type + "_orders_table tbody").empty();
            if (!refresh) {
                $("#" + (type == "ask" ? "buy" : "sell") + "_asset_price").val("0");
            }
            $("#" + (type == "ask" ? "sell" : "buy") + "_orders_count").html("");
        }
        NRS.dataLoadFinished($("#asset_exchange_" + type + "_orders_table"), !refresh);
    }

    NRS.loadAssetOrders = function (type, assetId, refresh) {
        type = type.toLowerCase();
        var params = {
            "asset": assetId,
            "firstIndex": 0,
            "lastIndex": 25
        };
        async.parallel([
            function(callback) {
                params["showExpectedCancellations"] = "true";
                NRS.sendRequest("get" + type.capitalize() + "Orders+" + assetId, params, function (response) {
                    var orders = response[type + "Orders"];
                    if (!orders) {
                        orders = [];
                    }
                    callback(null, orders);
                })
            },
            function(callback) {
                NRS.sendRequest("getExpected" + type.capitalize() + "Orders+" + assetId, params, function (response) {
                    var orders = response[type + "Orders"];
                    if (!orders) {
                        orders = [];
                    }
                    callback(null, orders);
                })
            }
        ],
        // invoked when both the requests above has completed
        // the results array contains both order lists
        function(err, results) {
            if (err) {
                NRS.logConsole(err);
                return;
            }
            var orders = results[0].concat(results[1]);
            orders.sort(function (a, b) {
                if (type == "ask") {
                    return a.priceNQT - b.priceNQT;
                } else {
                    return b.priceNQT - a.priceNQT;
                }
            });
            processOrders(orders, type, refresh);
        });
    };

    NRS.getAssetTradeHistory = function (assetId, refresh) {
        var options = {
            "asset": assetId,
            "firstIndex": 0,
            "lastIndex": 50
        };

        if (NRS.assetTradeHistoryType == "you") {
            options["account"] = NRS.accountRS;
        }

        NRS.sendRequest("getTrades+" + assetId, options, function (response) {
            var exchangeTradeHistoryTable = $("#asset_exchange_trade_history_table");
            if (response.trades && response.trades.length) {
                var trades = response.trades;

                var rows = "";

                for (var i = 0; i < trades.length; i++) {
                    var trade = trades[i];
                    trade.priceNQT = new BigInteger(trade.priceNQT);
                    trade.quantityQNT = new BigInteger(trade.quantityQNT);
                    trade.totalNQT = new BigInteger(NRS.calculateOrderTotalNQT(trade.priceNQT, trade.quantityQNT));
                    rows += "<tr>" +
                        "<td><a href='#' class='show_transaction_modal_action' data-transaction='" + String(trade.bidOrder).escapeHTML() + "'>" + NRS.formatTimestamp(trade.timestamp) + "</a></td>" +
                        "<td>" + $.t(trade.tradeType) + "</td>" +
                        "<td>" + NRS.formatQuantity(trade.quantityQNT, NRS.currentAsset.decimals) + "</td>" +
                        "<td class='asset_price'>" + NRS.formatOrderPricePerWholeQNT(trade.priceNQT, NRS.currentAsset.decimals) + "</td>" +
                        "<td style='color:";
                        if (NRS.getAccountTitle(trade, "buyer") == "You") {
                            rows += "red";
                        } else if (NRS.getAccountTitle(trade, "seller") == "You") {
                            rows += "green";
                        } else {
                            rows += "black";
                        }
                        rows += "'>" + NRS.formatAmount(trade.totalNQT) + "</td><td><a href='#' data-user='" + NRS.getAccountFormatted(trade, "buyer") + "' class='show_account_modal_action user_info'>" + (trade.buyerRS == NRS.currentAsset.accountRS ? "Asset Issuer" : NRS.getAccountTitle(trade, "buyer")) + "</a></td>" +
                        "<td><a href='#' data-user='" + NRS.getAccountFormatted(trade, "seller") + "' class='user_info'>" + (trade.sellerRS == NRS.currentAsset.accountRS ? "Asset Issuer" : NRS.getAccountTitle(trade, "seller")) + "</a></td>" +
                    "</tr>";
                }

                exchangeTradeHistoryTable.find("tbody").empty().append(rows);
                NRS.dataLoadFinished(exchangeTradeHistoryTable, !refresh);
            } else {
                exchangeTradeHistoryTable.find("tbody").empty();
                NRS.dataLoadFinished(exchangeTradeHistoryTable, !refresh);
            }
        });
    };

    $("#asset_exchange_trade_history_type").find(".btn").click(function (e) {
        e.preventDefault();
        NRS.assetTradeHistoryType = $(this).data("type");
        NRS.getAssetTradeHistory(NRS.currentAsset.asset, true);
    });

    var assetExchangeSearch = $("#asset_exchange_search");
    assetExchangeSearch.on("submit", function (e) {
        e.preventDefault();
        $("#asset_exchange_search").find("input[name=q]").trigger("input");
    });

    assetExchangeSearch.find("input[name=q]").on("input", function () {
        var input = $.trim($(this).val()).toLowerCase();

        if (!input) {
            NRS.assetSearch = false;
            NRS.loadAssetExchangeSidebar();
            $("#asset_exchange_clear_search").hide();
        } else {
            NRS.assetSearch = [];

            if (/NHZ\-/i.test(input)) {
                $.each(NRS.assets, function (key, asset) {
                    if (asset.accountRS.toLowerCase() == input || asset.accountRS.toLowerCase().indexOf(input) !== -1) {
                        NRS.assetSearch.push(asset.asset);
                    }
                });
            } else {
                $.each(NRS.assets, function (key, asset) {
                    if (asset.account == input || asset.asset == input || asset.name.toLowerCase().indexOf(input) !== -1) {
                        NRS.assetSearch.push(asset.asset);
                    }
                });
            }

            NRS.loadAssetExchangeSidebar();
            $("#asset_exchange_clear_search").show();
            $("#asset_exchange_show_type").hide();
        }
    });

    $("#asset_exchange_clear_search").on("click", function () {
        var assetExchangeSearch = $("#asset_exchange_search");
        assetExchangeSearch.find("input[name=q]").val("");
        assetExchangeSearch.trigger("submit");
    });

    $("#buy_asset_box .box-header, #sell_asset_box .box-header").click(function (e) {
        e.preventDefault();
        //Find the box parent
        var box = $(this).parents(".box").first();
        //Find the body and the footer
        var bf = box.find(".box-body, .box-footer");
        if (!box.hasClass("collapsed-box")) {
            box.addClass("collapsed-box");
            $(this).find(".btn i.fa").removeClass("fa-minus").addClass("fa-plus");
            bf.slideUp();
        } else {
            box.removeClass("collapsed-box");
            bf.slideDown();
            $(this).find(".btn i.fa").removeClass("fa-plus").addClass("fa-minus");
        }
    });

    $("#asset_exchange_bid_orders_table tbody, #asset_exchange_ask_orders_table tbody").on("click", "td", function (e) {
        var $target = $(e.target);
        var targetClass = $target.prop("class");
        if ($target.prop("tagName").toLowerCase() == "a" || (targetClass && targetClass.startsWith("fa"))) {
            return;
        }

        var type = ($target.closest("table").attr("id") == "asset_exchange_bid_orders_table" ? "sell" : "buy");
        var $tr = $target.closest("tr");
        try {
            var priceNQT = new BigInteger(String($tr.data("price")));
            var quantityQNT = new BigInteger(String($tr.data("quantity")));
            var totalNQT = new BigInteger(NRS.calculateOrderTotalNQT(quantityQNT, priceNQT));

            $("#" + type + "_asset_price").val(NRS.calculateOrderPricePerWholeQNT(priceNQT, NRS.currentAsset.decimals));
            $("#" + type + "_asset_quantity").val(NRS.convertToQNTf(quantityQNT, NRS.currentAsset.decimals));
            $("#" + type + "_asset_total").val(NRS.convertToNXT(totalNQT));
        } catch (err) {
            return;
        }

        if (type == "buy") {
            try {
                var balanceNQT = new BigInteger(NRS.accountInfo.unconfirmedBalanceNQT);
            } catch (err) {
                return;
            }

            if (totalNQT.compareTo(balanceNQT) > 0) {
                $("#" + type + "_asset_total").css({
                    "background": "#ED4348",
                    "color": "white"
                });
            } else {
                $("#" + type + "_asset_total").css({
                    "background": "",
                    "color": ""
                });
            }
        }

        var box = $("#" + type + "_asset_box");
        if (box.hasClass("collapsed-box")) {
            box.removeClass("collapsed-box");
            box.find(".box-body").slideDown();
            $("#" + type + "_asset_box .box-header").find(".btn i.fa").removeClass("fa-plus").addClass("fa-minus");
        }
    });

    $("#sell_automatic_price, #buy_automatic_price").on("click", function () {
        try {
            var type = ($(this).attr("id") == "sell_automatic_price" ? "sell" : "buy");

            var assetPrice = $("#" + type + "_asset_price");
            var price = new Big(NRS.convertToNQT(String(assetPrice.val())));
            var balanceNQT = new Big(NRS.accountInfo.unconfirmedBalanceNQT);
            var maxQuantity = new Big(NRS.convertToQNTf(NRS.currentAsset.quantityQNT, NRS.currentAsset.decimals));

            if (balanceNQT.cmp(new Big("0")) <= 0) {
                return;
            }

            if (price.cmp(new Big("0")) <= 0) {
                //get minimum price if no offers exist, based on asset decimals..
                price = new Big("" + Math.pow(10, NRS.currentAsset.decimals));
                assetPrice.val(NRS.convertToNXT(price.toString()));
            }

            var quantity;
            if (type == "sell") {
                quantity = new Big(NRS.currentAsset.yourBalanceQNT ? NRS.convertToQNTf(NRS.currentAsset.yourBalanceQNT, NRS.currentAsset.decimals) : "0");
            } else {
                quantity = new Big(NRS.amountToPrecision(balanceNQT.div(price).toString(), NRS.currentAsset.decimals));
            }

            var total = quantity.times(price);

            //proposed quantity is bigger than available quantity
            if (type == "buy" && quantity.cmp(maxQuantity) == 1) {
                quantity = maxQuantity;
                total = quantity.times(price);
            }

            $("#" + type + "_asset_quantity").val(quantity.toString());
            var assetTotal = $("#" + type + "_asset_total");
            assetTotal.val(NRS.convertToNXT(total.toString()));
            assetTotal.css({
                "background": "",
                "color": ""
            });
        } catch (err) {
        }
    });

    $("#buy_asset_quantity, #buy_asset_price, #sell_asset_quantity, #sell_asset_price, #buy_asset_fee, #sell_asset_fee").keydown(function (e) {
        var charCode = !e.charCode ? e.which : e.charCode;

        if (NRS.isControlKey(charCode) || e.ctrlKey || e.metaKey) {
            return;
        }
        var isQuantityField = /_quantity/i.test($(this).attr("id"));
        var decimals = NRS.currentAsset.decimals;
        var maxFractionLength = (isQuantityField ? decimals : 8 - decimals);
        NRS.validateDecimals(maxFractionLength, charCode, $(this).val(), e);
    });

    //calculate preview price (calculated on every keypress)
    $("#sell_asset_quantity, #sell_asset_price, #buy_asset_quantity, #buy_asset_price").keyup(function () {
        var orderType = $(this).data("type").toLowerCase();

        try {
            var quantityQNT = new BigInteger(NRS.convertToQNT(String($("#" + orderType + "_asset_quantity").val()), NRS.currentAsset.decimals));
            var priceNQT = new BigInteger(NRS.calculatePricePerWholeQNT(NRS.convertToNQT(String($("#" + orderType + "_asset_price").val())), NRS.currentAsset.decimals));

            if (priceNQT.toString() == "0" || quantityQNT.toString() == "0") {
                $("#" + orderType + "_asset_total").val("0");
            } else {
                var total = NRS.calculateOrderTotal(quantityQNT, priceNQT, NRS.currentAsset.decimals);
                $("#" + orderType + "_asset_total").val(total.toString());
            }
        } catch (err) {
            $("#" + orderType + "_asset_total").val("0");
        }
    });

    $("#asset_order_modal").on("show.bs.modal", function (e) {
        var $invoker = $(e.relatedTarget);

        var orderType = $invoker.data("type");
        var assetId = $invoker.data("asset");

        $("#asset_order_modal_button").html(orderType + " Asset").data("resetText", orderType + " Asset");
        $(".asset_order_modal_type").html(orderType);

        orderType = orderType.toLowerCase();

        try {
            //TODO
            var quantity = String($("#" + orderType + "_asset_quantity").val());
            var quantityQNT = new BigInteger(NRS.convertToQNT(quantity, NRS.currentAsset.decimals));
            var priceNQT = new BigInteger(NRS.calculatePricePerWholeQNT(NRS.convertToNQT(String($("#" + orderType + "_asset_price").val())), NRS.currentAsset.decimals));
            var feeNQT = new BigInteger(NRS.convertToNQT(String($("#" + orderType + "_asset_fee").val())));
            var totalNXT = NRS.formatAmount(NRS.calculateOrderTotalNQT(quantityQNT, priceNQT, NRS.currentAsset.decimals), false, true);
        } catch (err) {
            $.growl($.t("error_invalid_input"), {
                "type": "danger"
            });
            return e.preventDefault();
        }

        if (priceNQT.toString() == "0" || quantityQNT.toString() == "0") {
            $.growl($.t("error_amount_price_required"), {
                "type": "danger"
            });
            return e.preventDefault();
        }

        if (feeNQT.toString() == "0") {
            feeNQT = new BigInteger("100000000");
        }

        var priceNQTPerWholeQNT = priceNQT.multiply(new BigInteger("" + Math.pow(10, NRS.currentAsset.decimals)));
        var description;
        var tooltipTitle;
        if (orderType == "buy") {
            description = $.t("buy_order_description", {
                "quantity": NRS.formatQuantity(quantityQNT, NRS.currentAsset.decimals, true),
                "asset_name": $("#asset_name").html().escapeHTML(),
                "nxt": NRS.formatAmount(priceNQTPerWholeQNT)
            });
            tooltipTitle = $.t("buy_order_description_help", {
                "nxt": NRS.formatAmount(priceNQTPerWholeQNT, false, true),
                "total_nxt": totalNXT
            });
        } else {
            description = $.t("sell_order_description", {
                "quantity": NRS.formatQuantity(quantityQNT, NRS.currentAsset.decimals, true),
                "asset_name": $("#asset_name").html().escapeHTML(),
                "nxt": NRS.formatAmount(priceNQTPerWholeQNT)
            });
            tooltipTitle = $.t("sell_order_description_help", {
                "nxt": NRS.formatAmount(priceNQTPerWholeQNT, false, true),
                "total_nxt": totalNXT
            });
        }

        $("#asset_order_description").html(description);
        $("#asset_order_total").html(totalNXT + " HZ");
        $("#asset_order_fee_paid").html(NRS.formatAmount(feeNQT) + " HZ");

        var assetOrderTotalTooltip = $("#asset_order_total_tooltip");
        if (quantity != "1") {
            assetOrderTotalTooltip.show();
            assetOrderTotalTooltip.popover("destroy");
            assetOrderTotalTooltip.data("content", tooltipTitle);
            assetOrderTotalTooltip.popover({
                "content": tooltipTitle,
                "trigger": "hover"
            });
        } else {
            assetOrderTotalTooltip.hide();
        }

        $("#asset_order_type").val((orderType == "buy" ? "placeBidOrder" : "placeAskOrder"));
        $("#asset_order_asset").val(assetId);
        $("#asset_order_quantity").val(quantityQNT.toString());
        $("#asset_order_price").val(priceNQT.toString());
        $("#asset_order_fee").val(feeNQT.toString());
    });

    NRS.forms.orderAsset = function () {
        var orderType = $("#asset_order_type").val();

        return {
            "requestType": orderType,
            "successMessage": (orderType == "placeBidOrder" ? $.t("success_buy_order_asset") : $.t("success_sell_order_asset")),
            "errorMessage": $.t("error_order_asset")
        };
    };

    NRS.forms.issueAsset = function ($modal) {
        var data = NRS.getFormData($modal.find("form:first"));

        data.description = $.trim(data.description);

        if (!data.description) {
            return {
                "error": $.t("error_description_required")
            };
        } else if (!/^\d+$/.test(data.quantity)) {
            return {
                "error": $.t("error_whole_quantity")
            };
        } else {
            data.quantityQNT = String(data.quantity);
            if (data.decimals == "") {
                data.decimals = "0";
            }
            if (data.decimals > 0) {
                for (var i = 0; i < data.decimals; i++) {
                    data.quantityQNT += "0";
                }
            }

            delete data.quantity;

            return {
                "data": data
            };
        }
    };

    NRS.getAssetAccounts = function (assetId, height, success, error) {
        NRS.sendRequest("getAssetAccounts", {"asset": assetId, "height": height},
            function (response) {
                if (response.errorCode) {
                    error(response);
                } else {
                    success(response);
                }
            },
            false);
    };

    $("#asset_exchange_sidebar_group_context").on("click", "a", function (e) {
        e.preventDefault();

        var groupName = NRS.selectedContext.data("groupname");
        var option = $(this).data("option");

        if (option == "change_group_name") {
            $("#asset_exchange_change_group_name_old_display").html(groupName.escapeHTML());
            $("#asset_exchange_change_group_name_old").val(groupName);
            $("#asset_exchange_change_group_name_new").val("");
            $("#asset_exchange_change_group_name_modal").modal("show");
        }
    });

    NRS.forms.assetExchangeChangeGroupName = function () {
        var oldGroupName = $("#asset_exchange_change_group_name_old").val();
        var newGroupName = $("#asset_exchange_change_group_name_new").val();

        if (!newGroupName.match(/^[a-z0-9 ]+$/i)) {
            return {
                "error": $.t("error_group_name")
            };
        }

        NRS.database.update("assets", {
            "groupName": newGroupName
        }, [{
            "groupName": oldGroupName
        }], function () {
            setTimeout(function () {
                NRS.loadPage("asset_exchange");
                $.growl($.t("success_group_name_update"), {
                    "type": "success"
                });
            }, 50);
        });

        return {
            "stop": true
        };
    };

    $("#asset_exchange_sidebar_context").on("click", "a", function (e) {
        e.preventDefault();

        var assetId = NRS.selectedContext.data("asset");
        var option = $(this).data("option");

        NRS.closeContextMenu();

        if (option == "add_to_group") {
            $("#asset_exchange_group_asset").val(assetId);

            NRS.database.select("assets", [{
                "asset": assetId
            }], function (error, asset) {
                asset = asset[0];

                $("#asset_exchange_group_title").html(String(asset.name).escapeHTML());

                NRS.database.select("assets", [], function (error, assets) {
                    //NRS.database.execute("SELECT DISTINCT groupName FROM assets", [], function(groupNames) {
                    var groupNames = [];

                    $.each(assets, function (index, asset) {
                        if (asset.groupName && $.inArray(asset.groupName, groupNames) == -1) {
                            groupNames.push(asset.groupName);
                        }
                    });

                    groupNames.sort(function (a, b) {
                        if (a.toLowerCase() > b.toLowerCase()) {
                            return 1;
                        } else if (a.toLowerCase() < b.toLowerCase()) {
                            return -1;
                        } else {
                            return 0;
                        }
                    });

                    var groupSelect = $("#asset_exchange_group_group");

                    groupSelect.empty();

                    $.each(groupNames, function (index, groupName) {
                        groupSelect.append("<option value='" + groupName.escapeHTML() + "'" + (asset.groupName && asset.groupName.toLowerCase() == groupName.toLowerCase() ? " selected='selected'" : "") + ">" + groupName.escapeHTML() + "</option>");
                    });

                    groupSelect.append("<option value='0'" + (!asset.groupName ? " selected='selected'" : "") + ">None</option>");
                    groupSelect.append("<option value='-1'>New group</option>");

                    $("#asset_exchange_group_modal").modal("show");
                });
            });
        } else if (option == "remove_from_group") {
            NRS.database.update("assets", {
                "groupName": ""
            }, [{
                "asset": assetId
            }], function () {
                setTimeout(function () {
                    NRS.loadPage("asset_exchange");
                    $.growl($.t("success_asset_group_removal"), {
                        "type": "success"
                    });
                }, 50);
            });
        } else if (option == "remove_from_bookmarks") {
            var ownsAsset = false;

            if (NRS.accountInfo.unconfirmedAssetBalances) {
                $.each(NRS.accountInfo.unconfirmedAssetBalances, function (key, assetBalance) {
                    if (assetBalance.asset == assetId) {
                        ownsAsset = true;
                        return false;
                    }
                });
            }

            if (ownsAsset) {
                $.growl($.t("error_owned_asset_no_removal"), {
                    "type": "danger"
                });
            } else {
                //todo save delteed asset ids from accountissuers
                NRS.database.delete("assets", [{
                    "asset": assetId
                }], function () {
                    setTimeout(function () {
                        NRS.loadPage("asset_exchange");
                        $.growl($.t("success_asset_bookmark_removal"), {
                            "type": "success"
                        });
                    }, 50);
                });
            }
        }
    });

    $("#asset_exchange_group_group").on("change", function () {
        var value = $(this).val();

        if (value == -1) {
            $("#asset_exchange_group_new_group_div").show();
        } else {
            $("#asset_exchange_group_new_group_div").hide();
        }
    });

    NRS.forms.assetExchangeGroup = function () {
        var assetId = $("#asset_exchange_group_asset").val();
        var groupName = $("#asset_exchange_group_group").val();

        if (groupName == 0) {
            groupName = "";
        } else if (groupName == -1) {
            groupName = $("#asset_exchange_group_new_group").val();
        }

        NRS.database.update("assets", {
            "groupName": groupName
        }, [{
            "asset": assetId
        }], function () {
            setTimeout(function () {
                NRS.loadPage("asset_exchange");
                if (!groupName) {
                    $.growl($.t("success_asset_group_removal"), {
                        "type": "success"
                    });
                } else {
                    $.growl($.t("sucess_asset_group_add"), {
                        "type": "success"
                    });
                }
            }, 50);
        });

        return {
            "stop": true
        };
    };

    $("#asset_exchange_group_modal").on("hidden.bs.modal", function () {
        $("#asset_exchange_group_new_group_div").val("").hide();
    });

    /* TRADE HISTORY PAGE */
    NRS.pages.trade_history = function () {
        NRS.sendRequest("getTrades+", {
            "account": NRS.accountRS,
            "firstIndex": NRS.pageNumber * NRS.itemsPerPage - NRS.itemsPerPage,
            "lastIndex": NRS.pageNumber * NRS.itemsPerPage
        }, function (response) {
            if (response.trades && response.trades.length) {
                if (response.trades.length > NRS.itemsPerPage) {
                    NRS.hasMorePages = true;
                    response.trades.pop();
                }

                var trades = response.trades;

                var rows = "";

                for (var i = 0; i < trades.length; i++) {
                    trades[i].priceNQT = new BigInteger(trades[i].priceNQT);
                    trades[i].quantityQNT = new BigInteger(trades[i].quantityQNT);
                    trades[i].totalNQT = new BigInteger(NRS.calculateOrderTotalNQT(trades[i].priceNQT, trades[i].quantityQNT));

                    var type = (trades[i].buyerRS == NRS.accountRS ? "buy" : "sell");

                    rows += "<tr><td><a href='#' data-goto-asset='" + String(trades[i].asset).escapeHTML() + "'>" + String(trades[i].name).escapeHTML() + "</a></td><td>" + NRS.formatTimestamp(trades[i].timestamp) + "</td><td>" + $.t(trades[i].tradeType) + "</td><td>" + NRS.formatQuantity(trades[i].quantityQNT, trades[i].decimals) + "</td><td class='asset_price'>" + NRS.formatOrderPricePerWholeQNT(trades[i].priceNQT, trades[i].decimals) + "</td><td style='color:" + (type == "buy" ? "red" : "green") + "'>" + NRS.formatAmount(trades[i].totalNQT) + "</td>" +
                    "<td><a href='#' data-user='" + NRS.getAccountFormatted(trades[i], "buyer") + "' class='show_account_modal_action user_info'>" + NRS.getAccountTitle(trades[i], "buyer") + "</a></td>" +
                    "<td><a href='#' data-user='" + NRS.getAccountFormatted(trades[i], "seller") + "' class='show_account_modal_action user_info'>" + NRS.getAccountTitle(trades[i], "seller") + "</a></td>" +
                    "</tr>";
                }

                NRS.dataLoaded(rows);
            } else {
                NRS.dataLoaded();
            }
        });
    };

    /* TRANSFER HISTORY PAGE */
    NRS.pages.transfer_history = function () {
        NRS.sendRequest("getAssetTransfers+", {
            "account": NRS.accountRS,
            "firstIndex": NRS.pageNumber * NRS.itemsPerPage - NRS.itemsPerPage,
            "lastIndex": NRS.pageNumber * NRS.itemsPerPage
        }, function (response) {
            if (response.transfers && response.transfers.length) {
                if (response.transfers.length > NRS.itemsPerPage) {
                    NRS.hasMorePages = true;
                    response.transfers.pop();
                }

                var transfers = response.transfers;

                var rows = "";

                for (var i = 0; i < transfers.length; i++) {
                    transfers[i].quantityQNT = new BigInteger(transfers[i].quantityQNT);

                    var type = (transfers[i].recipientRS == NRS.accountRS ? "receive" : "send");

                    rows += "<tr><td><a href='#' class='show_transaction_modal_action' data-transaction='" + String(transfers[i].assetTransfer).escapeHTML() + "'>" + String(transfers[i].assetTransfer).escapeHTML() + "</a></td><td><a href='#' data-goto-asset='" + String(transfers[i].asset).escapeHTML() + "'>" + String(transfers[i].name).escapeHTML() + "</a></td><td>" + NRS.formatTimestamp(transfers[i].timestamp) + "</td><td style='color:" + (type == "receive" ? "green" : "red") + "'>" + NRS.formatQuantity(transfers[i].quantityQNT, transfers[i].decimals) + "</td>" +
                    "<td><a href='#' data-user='" + NRS.getAccountFormatted(transfers[i], "recipient") + "' class='show_account_modal_action user_info'>" + NRS.getAccountTitle(transfers[i], "recipient") + "</a></td>" +
                    "<td><a href='#' data-user='" + NRS.getAccountFormatted(transfers[i], "sender") + "' class='show_account_modal_action user_info'>" + NRS.getAccountTitle(transfers[i], "sender") + "</a></td>" +
                    "</tr>";
                }

                NRS.dataLoaded(rows);
            } else {
                NRS.dataLoaded();
            }
        });
    };

    /* MY ASSETS PAGE */
    NRS.pages.my_assets = function () {
        if (NRS.accountInfo.assetBalances && NRS.accountInfo.assetBalances.length) {
            var result = {
                "assets": [],
                "bid_orders": {},
                "ask_orders": {}
            };
            var count = {
                "total_assets": NRS.accountInfo.assetBalances.length,
                "assets": 0,
                "ignored_assets": 0,
                "ask_orders": 0,
                "bid_orders": 0
            };

            for (var i = 0; i < NRS.accountInfo.assetBalances.length; i++) {
                if (NRS.accountInfo.assetBalances[i].balanceQNT == "0") {
                    count.ignored_assets++;
                    if (NRS.checkMyAssetsPageLoaded(count)) {
                        NRS.myAssetsPageLoaded(result);
                    }
                    continue;
                }

                NRS.sendRequest("getAskOrders+", {
                    "asset": NRS.accountInfo.assetBalances[i].asset,
                    "firstIndex": 0,
                    "lastIndex": 1
                }, function (response, input) {
                    if (NRS.currentPage != "my_assets") {
                        return;
                    }

                    if (response.askOrders && response.askOrders.length) {
                        result.ask_orders[input.asset] = new BigInteger(response.askOrders[0].priceNQT);
                    } else {
                        result.ask_orders[input.asset] = -1;
                    }

                    count.ask_orders++;
                    if (NRS.checkMyAssetsPageLoaded(count)) {
                        NRS.myAssetsPageLoaded(result);
                    }
                });

                NRS.sendRequest("getBidOrders+", {
                    "asset": NRS.accountInfo.assetBalances[i].asset,
                    "firstIndex": 0,
                    "lastIndex": 1
                }, function (response, input) {
                    if (NRS.currentPage != "my_assets") {
                        return;
                    }

                    if (response.bidOrders && response.bidOrders.length) {
                        result.bid_orders[input.asset] = new BigInteger(response.bidOrders[0].priceNQT);
                    } else {
                        result.bid_orders[input.asset] = -1;
                    }

                    count.bid_orders++;

                    if (NRS.checkMyAssetsPageLoaded(count)) {
                        NRS.myAssetsPageLoaded(result);
                    }
                });

                NRS.sendRequest("getAsset+", {
                    "asset": NRS.accountInfo.assetBalances[i].asset,
                    "_extra": {
                        "balanceQNT": NRS.accountInfo.assetBalances[i].balanceQNT
                    }
                }, function (asset, input) {
                    if (NRS.currentPage != "my_assets") {
                        return;
                    }

                    asset.asset = input.asset;
                    asset.balanceQNT = new BigInteger(input["_extra"].balanceQNT);
                    asset.quantityQNT = new BigInteger(asset.quantityQNT);

                    result.assets[count.assets] = asset;
                    count.assets++;

                    if (NRS.checkMyAssetsPageLoaded(count)) {
                        NRS.myAssetsPageLoaded(result);
                    }
                });
            }
        } else {
            NRS.dataLoaded();
        }
    };

    NRS.checkMyAssetsPageLoaded = function (count) {
        return count.assets + count.ignored_assets == count.total_assets && count.assets == count.ask_orders && count.assets == count.bid_orders;
    };

    NRS.myAssetsPageLoaded = function (result) {
        var rows = "";

        result.assets.sort(function (a, b) {
            if (a.name.toLowerCase() > b.name.toLowerCase()) {
                return 1;
            } else if (a.name.toLowerCase() < b.name.toLowerCase()) {
                return -1;
            } else {
                return 0;
            }
        });

        for (var i = 0; i < result.assets.length; i++) {
            var asset = result.assets[i];
            var lowestAskOrder = result.ask_orders[asset.asset];
            var highestBidOrder = result.bid_orders[asset.asset];
            var percentageAsset = NRS.calculatePercentage(asset.balanceQNT, asset.quantityQNT);
            var total;
            if (highestBidOrder != -1) {
                total = new BigInteger(NRS.calculateOrderTotalNQT(asset.balanceQNT, highestBidOrder, asset.decimals));
            } else {
                total = 0;
            }
            if (highestBidOrder != -1) {
                var totalNQT = new BigInteger(NRS.calculateOrderTotalNQT(asset.balanceQNT, highestBidOrder));
            }
            rows += "<tr data-asset='" + String(asset.asset).escapeHTML() + "'><td><a href='#' data-goto-asset='" + String(asset.asset).escapeHTML() + "'>" + String(asset.name).escapeHTML() + "</a></td><td class='quantity'>" + NRS.formatQuantity(asset.balanceQNT, asset.decimals) + "</td><td>" + NRS.formatQuantity(asset.quantityQNT, asset.decimals) + "</td><td>" + percentageAsset + "%</td><td>" + (lowestAskOrder != -1 ? NRS.formatOrderPricePerWholeQNT(lowestAskOrder, asset.decimals) : "/") + "</td><td>" + (highestBidOrder != -1 ? NRS.formatOrderPricePerWholeQNT(highestBidOrder, asset.decimals) : "/") + "</td><td>" + (highestBidOrder != -1 ? NRS.formatAmount(totalNQT) : "/") + "</td><td><a href='#' data-toggle='modal' data-target='#transfer_asset_modal' data-asset='" + String(asset.asset).escapeHTML() + "' data-name='" + String(asset.name).escapeHTML() + "' data-decimals='" + String(asset.decimals).escapeHTML() + "'>" + $.t("transfer") + "</a></td></tr>";
        }
        NRS.dataLoaded(rows);
    };

    NRS.incoming.my_assets = function () {
        NRS.loadPage("my_assets");
    };

    var assetDistributionModal = $("#asset_distribution_modal");
    assetDistributionModal.on("show.bs.modal", function (e) {
        var $invoker = $(e.relatedTarget);

        var assetId = $invoker.data("asset");

        NRS.sendRequest("getAssetAccounts", {
            "asset": assetId
        }, function (response) {
            var rows = "";

            if (response.accountAssets) {
                response.accountAssets.sort(function (a, b) {
                    return new BigInteger(b.quantityQNT).compareTo(new BigInteger(a.quantityQNT));
                });

                for (var i = 0; i < response.accountAssets.length; i++) {
                    var account = response.accountAssets[i];
                    var percentageAsset = NRS.calculatePercentage(account.quantityQNT, NRS.currentAsset.quantityQNT);

                    rows += "<tr><td><a href='#' data-user='" + NRS.getAccountFormatted(account, "account") + "' class='show_account_modal_action user_info'>" + (account.accountRS == NRS.currentAsset.accountRS ? "Asset Issuer" : NRS.getAccountTitle(account, "account")) + "</a></td><td>" + NRS.formatQuantity(account.quantityQNT, NRS.currentAsset.decimals) + "</td><td>" + percentageAsset + "%</td></tr>";
                }
            }

            var assetDistributionTable = $("#asset_distribution_table");
            assetDistributionTable.find("tbody").empty().append(rows);
            NRS.dataLoadFinished(assetDistributionTable);
        });
    });

    assetDistributionModal.on("hidden.bs.modal", function () {
        var assetDistributionTable = $("#asset_distribution_table");
        assetDistributionTable.find("tbody").empty();
        assetDistributionTable.parent().addClass("data-loading");
    });

    $("#transfer_asset_modal").on("show.bs.modal", function (e) {
        var $invoker = $(e.relatedTarget);

        var assetId = $invoker.data("asset");
        var assetName = $invoker.data("name");
        var decimals = $invoker.data("decimals");

        $("#transfer_asset_asset").val(assetId);
        $("#transfer_asset_decimals").val(decimals);
        $("#transfer_asset_name, #transfer_asset_quantity_name").html(String(assetName).escapeHTML());
        $("#transer_asset_available").html("");

        var confirmedBalance = 0;
        var unconfirmedBalance = 0;

        if (NRS.accountInfo.assetBalances) {
            $.each(NRS.accountInfo.assetBalances, function (key, assetBalance) {
                if (assetBalance.asset == assetId) {
                    confirmedBalance = assetBalance.balanceQNT;
                    return false;
                }
            });
        }

        if (NRS.accountInfo.unconfirmedAssetBalances) {
            $.each(NRS.accountInfo.unconfirmedAssetBalances, function (key, assetBalance) {
                if (assetBalance.asset == assetId) {
                    unconfirmedBalance = assetBalance.unconfirmedBalanceQNT;
                    return false;
                }
            });
        }

        var availableAssetsMessage = "";

        if (confirmedBalance == unconfirmedBalance) {
            availableAssetsMessage = " - " + $.t("available_for_transfer", {
                "qty": NRS.formatQuantity(confirmedBalance, decimals)
            });
        } else {
            availableAssetsMessage = " - " + $.t("available_for_transfer", {
                "qty": NRS.formatQuantity(unconfirmedBalance, decimals)
            }) + " (" + NRS.formatQuantity(confirmedBalance, decimals) + " " + $.t("total_lowercase") + ")";
        }

        $("#transfer_asset_available").html(availableAssetsMessage);
    });

    NRS.forms.transferAsset = function ($modal) {
        var data = NRS.getFormData($modal.find("form:first"));

        if (!data.quantity) {
            return {
                "error": $.t("error_not_specified", {
                    "name": NRS.getTranslatedFieldName("quantity").toLowerCase()
                }).capitalize()
            };
        }

        if (!NRS.showedFormWarning) {
            if (NRS.settings["asset_transfer_warning"] && NRS.settings["asset_transfer_warning"] != 0) {
                if (new Big(data.quantity).cmp(new Big(NRS.settings["asset_transfer_warning"])) > 0) {
                    NRS.showedFormWarning = true;
                    return {
                        "error": $.t("error_max_asset_transfer_warning", {
                            "qty": String(NRS.settings["asset_transfer_warning"]).escapeHTML()
                        })
                    };
                }
            }
        }

        try {
            data.quantityQNT = NRS.convertToQNT(data.quantity, data.decimals);
        } catch (e) {
            return {
                "error": $.t("error_incorrect_quantity_plus", {
                    "err": e.escapeHTML()
                })
            };
        }

        delete data.quantity;
        delete data.decimals;

        if (!data.add_message) {
            delete data.add_message;
            delete data.message;
            delete data.encrypt_message;
            delete data.permanent_message;
        }

        return {
            "data": data
        };
    };

    NRS.forms.transferAssetComplete = function () {
        NRS.loadPage("my_assets");
    };

    $("body").on("click", "a[data-goto-asset]", function (e) {
        e.preventDefault();

        var $visible_modal = $(".modal.in");

        if ($visible_modal.length) {
            $visible_modal.modal("hide");
        }

        NRS.goToAsset($(this).data("goto-asset"));
    });

    NRS.goToAsset = function (asset) {
        NRS.assetSearch = false;
        $("#asset_exchange_sidebar_search").find("input[name=q]").val("");
        $("#asset_exchange_clear_search").hide();

        $("#asset_exchange_sidebar").find("a.list-group-item.active").removeClass("active");
        $("#no_asset_selected, #asset_details, #no_assets_available, #no_asset_search_results").hide();
        $("#loading_asset_data").show();

        $("ul.sidebar-menu a[data-page=asset_exchange]").last().trigger("click", [{
            callback: function () {
                var assetLink = $("#asset_exchange_sidebar").find("a[data-asset=" + asset + "]");

                if (assetLink.length) {
                    assetLink.click();
                } else {
                    NRS.sendRequest("getAsset", {
                        "asset": asset
                    }, function (response) {
                        if (!response.errorCode) {
                            NRS.loadAssetExchangeSidebar(function () {
                                response.groupName = "";
                                response.viewingAsset = true;
                                NRS.loadAsset(response);
                            });
                        } else {
                            $.growl($.t("error_asset_not_found"), {
                                "type": "danger"
                            });
                        }
                    });
                }
            }
        }]);
    };

    /* OPEN ORDERS PAGE */
    NRS.pages.open_orders = function () {
        var loaded = 0;

        NRS.getOpenOrders("ask", function () {
            loaded++;
            if (loaded == 2) {
                NRS.pageLoaded();
            }
        });

        NRS.getOpenOrders("bid", function () {
            loaded++;
            if (loaded == 2) {
                NRS.pageLoaded();
            }
        });
    };

    NRS.getOpenOrders = function (type, callback) {
        var uppercase = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
        var lowercase = type.toLowerCase();

        var getAccountCurrentOrders = "getAccountCurrent" + uppercase + "Orders+";
        var accountOrders = lowercase + "Orders";

        NRS.sendRequest(getAccountCurrentOrders, {
            "account": NRS.account,
            "firstIndex": 0,
            "lastIndex": 100
        }, function (response) {
            if (response[accountOrders] && response[accountOrders].length) {
                var nrOrders = 0;

                for (var i = 0; i < response[accountOrders].length; i++) {
                    NRS.sendRequest("getAsset+", {
                        "asset": response[accountOrders][i].asset,
                        "_extra": {
                            "id": i
                        }
                    }, function (asset, input) {
                        if (NRS.currentPage != "open_orders") {
                            return;
                        }

                        response[accountOrders][input["_extra"].id].assetName = asset.name;
                        response[accountOrders][input["_extra"].id].decimals = asset.decimals;

                        nrOrders++;

                        if (nrOrders == response[accountOrders].length) {
                            NRS.openOrdersLoaded(response[accountOrders], lowercase, callback);
                        }
                    });
                }
            } else {
                NRS.openOrdersLoaded([], lowercase, callback);
            }
        });
    };

    NRS.openOrdersLoaded = function (orders, type, callback) {
        var openOrdersTable = $("#open_" + type + "_orders_table");
        if (!orders.length) {
            $("#open_" + type + "_orders_table tbody").empty();
            NRS.dataLoadFinished(openOrdersTable);
            callback();
            return;
        }

        orders.sort(function (a, b) {
            if (a.assetName.toLowerCase() > b.assetName.toLowerCase()) {
                return 1;
            } else if (a.assetName.toLowerCase() < b.assetName.toLowerCase()) {
                return -1;
            } else {
                if (a.quantity * a.price > b.quantity * b.price) {
                    return 1;
                } else if (a.quantity * a.price < b.quantity * b.price) {
                    return -1;
                } else {
                    return 0;
                }
            }
        });

        var rows = "";
        for (var i = 0; i < orders.length; i++) {
            var completeOrder = orders[i];
            completeOrder.priceNQT = new BigInteger(completeOrder.priceNQT);
            completeOrder.quantityQNT = new BigInteger(completeOrder.quantityQNT);
            completeOrder.totalNQT = new BigInteger(NRS.calculateOrderTotalNQT(completeOrder.quantityQNT, completeOrder.priceNQT));
            rows += "<tr data-order='" + String(completeOrder.order).escapeHTML() + "'><td><a href='#' data-goto-asset='" + String(completeOrder.asset).escapeHTML() + "'>" + completeOrder.assetName.escapeHTML() + "</a></td><td>" + NRS.formatQuantity(completeOrder.quantityQNT, completeOrder.decimals) + "</td><td>" + NRS.formatOrderPricePerWholeQNT(completeOrder.priceNQT, completeOrder.decimals) + "</td><td>" + NRS.formatAmount(completeOrder.totalNQT) + "</td><td class='cancel'><a href='#' data-toggle='modal' data-target='#cancel_order_modal' data-order='" + String(completeOrder.order).escapeHTML() + "' data-type='" + type + "'>" + $.t("cancel") + "</a></td></tr>";
        }
        openOrdersTable.find("tbody").empty().append(rows);
        NRS.dataLoadFinished(openOrdersTable);
        callback();
    };

    NRS.incoming.open_orders = function (transactions) {
        if (NRS.hasTransactionUpdates(transactions)) {
            NRS.loadPage("open_orders");
        }
    };

    $("#cancel_order_modal").on("show.bs.modal", function (e) {
        var $invoker = $(e.relatedTarget);

        var orderType = $invoker.data("type");
        var orderId = $invoker.data("order");

        if (orderType == "bid") {
            $("#cancel_order_type").val("cancelBidOrder");
        } else {
            $("#cancel_order_type").val("cancelAskOrder");
        }

        $("#cancel_order_order").val(orderId);
    });

    NRS.forms.cancelOrder = function ($modal) {
        var data = NRS.getFormData($modal.find("form:first"));

        var requestType = data.cancel_order_type;

        delete data.cancel_order_type;

        return {
            "data": data,
            "requestType": requestType
        };
    };

    NRS.forms.cancelOrderComplete = function (response, data) {
        if (data.requestType == "cancelAskOrder") {
            $.growl($.t("success_cancel_sell_order"), {
                "type": "success"
            });
        } else {
            $.growl($.t("success_cancel_buy_order"), {
                "type": "success"
            });
        }

        if (response.alreadyProcessed) {
            return;
        }
    };

    var _selectedApprovalAsset = "";

    NRS.buildApprovalRequestAssetNavi = function () {
        var $select = $('#approve_asset_select');
        $select.empty();

        var assetSelected = false;
        var $noneOption = $('<option value=""></option>');

        NRS.sendRequest("getAccountAssets", {
            "account": NRS.accountRS
        }, function (response) {
            if (response.accountAssets) {
                if (response.accountAssets.length > 0) {
                    $noneOption.html($.t('no_asset_selected_for_approval', 'No Asset Selected'));
                    $.each(response.accountAssets, function (key, asset) {
                        var idString = String(asset.asset);
                        var $option = $('<option value="' + idString + '">' + String(asset.name).escapeHTML() + '</option>');
                        if (idString == _selectedApprovalAsset) {
                            $option.attr('selected', true);
                            assetSelected = true;
                        }
                        $option.appendTo($select);
                    });
                } else {
                    $noneOption.html($.t('account_has_no_assets', 'Account has no assets'));
                }
            } else {
                $noneOption.html($.t('no_connection'));
            }
            if (!_selectedApprovalAsset || !assetSelected) {
                $noneOption.attr('selected', true);
            }
            $noneOption.prependTo($select);
        });
    };

    NRS.pages.approval_requests_asset = function () {
        NRS.buildApprovalRequestAssetNavi();

        if (_selectedApprovalAsset != "") {
            var params = {
                "asset": _selectedApprovalAsset,
                "withoutWhitelist": true,
                "firstIndex": NRS.pageNumber * NRS.itemsPerPage - NRS.itemsPerPage,
                "lastIndex": NRS.pageNumber * NRS.itemsPerPage
            };
            NRS.sendRequest("getAssetPhasedTransactions", params, function (response) {
                var rows = "";

                if (response.transactions && response.transactions.length > 0) {
                    if (response.transactions.length > NRS.itemsPerPage) {
                        NRS.hasMorePages = true;
                        response.transactions.pop();
                    }
                    for (var i = 0; i < response.transactions.length; i++) {
                        var t = response.transactions[i];
                        t.confirmed = true;
                        rows += NRS.getTransactionRowHTML(t, ['approve']);
                    }
                } else {
                    $('#ar_asset_no_entries').html($.t('no_current_approval_requests', 'No current approval requests'));
                }
                NRS.dataLoaded(rows);
                NRS.addPhasingInfoToTransactionRows(response.transactions);
            });
        } else {
            $('#ar_asset_no_entries').html($.t('please_select_asset_for_approval', 'Please select an asset'));
            NRS.dataLoaded();
        }
    };

    $('#approve_asset_select').on('change', function () {
        _selectedApprovalAsset = $(this).find('option:selected').val();
        NRS.loadPage("approval_requests_asset");
    });

    NRS.setup.asset_exchange = function () {
        var sidebarId = 'sidebar_asset_exchange';
        var options = {
            "id": sidebarId,
            "titleHTML": '<i class="fa fa-signal"></i><span data-i18n="asset_exchange">Asset Exchange</span>',
            "page": 'asset_exchange',
            "desiredPosition": 30
        };
        NRS.addTreeviewSidebarMenuItem(options);
        options = {
            "titleHTML": '<span data-i18n="asset_exchange">Asset Exchange</span>',
            "type": 'PAGE',
            "page": 'asset_exchange'
        };
        NRS.appendMenuItemToTSMenuItem(sidebarId, options);
        options = {
            "titleHTML": '<span data-i18n="trade_history">Trade History</span></a>',
            "type": 'PAGE',
            "page": 'trade_history'
        };
        NRS.appendMenuItemToTSMenuItem(sidebarId, options);
        options = {
            "titleHTML": '<span data-i18n="transfer_history">Transfer History</span>',
            "type": 'PAGE',
            "page": 'transfer_history'
        };
        NRS.appendMenuItemToTSMenuItem(sidebarId, options);
        options = {
            "titleHTML": '<span data-i18n="my_assets">My Assets</span></a>',
            "type": 'PAGE',
            "page": 'my_assets'
        };
        NRS.appendMenuItemToTSMenuItem(sidebarId, options);
        options = {
            "titleHTML": '<span data-i18n="open_orders">Open Orders</span>',
            "type": 'PAGE',
            "page": 'open_orders'
        };
        NRS.appendMenuItemToTSMenuItem(sidebarId, options);
        options = {
            "titleHTML": '<span data-i18n="approval_requests">Approval Requests</span>',
            "type": 'PAGE',
            "page": 'approval_requests_asset'
        };
        NRS.appendMenuItemToTSMenuItem(sidebarId, options);
        options = {
            "titleHTML": '<span data-i18n="issue_asset">Issue Asset</span>',
            "type": 'MODAL',
            "modalId": 'issue_asset_modal'
        };
        NRS.appendMenuItemToTSMenuItem(sidebarId, options);
    };

	var assetsidebar = true;
	$("#toggle_asset_exchange_sidebar").click(function(e){
		e.preventDefault();
		$("#content-spliter-sidebar_asset_exchange").toggle();
		if(assetsidebar === true) {
			$("#content-spliter-right_asset_exchange").css('left','0px');
			assetsidebar = false;
		} else if(assetsidebar === false) {
			$("#content-spliter-right_asset_exchange").css('left','200px');
			assetsidebar = true;
		}
	});

    return NRS;
}(NRS || {}, jQuery));