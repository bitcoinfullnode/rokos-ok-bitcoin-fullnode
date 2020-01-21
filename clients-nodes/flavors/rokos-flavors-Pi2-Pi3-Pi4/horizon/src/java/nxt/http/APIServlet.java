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

package nxt.http;

import nxt.Db;
import nxt.Nxt;
import nxt.NxtException;
import nxt.util.JSON;
import nxt.util.Logger;
import org.json.simple.JSONObject;
import org.json.simple.JSONStreamAware;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static nxt.http.JSONResponses.ERROR_INCORRECT_REQUEST;
import static nxt.http.JSONResponses.ERROR_NOT_ALLOWED;
import static nxt.http.JSONResponses.POST_REQUIRED;
import static nxt.http.JSONResponses.REQUIRED_BLOCK_NOT_FOUND;
import static nxt.http.JSONResponses.REQUIRED_LAST_BLOCK_NOT_FOUND;

public final class APIServlet extends HttpServlet {

    abstract static class APIRequestHandler {

        private final List<String> parameters;
        private final String fileParameter;
        private final Set<APITag> apiTags;

        APIRequestHandler(APITag[] apiTags, String... parameters) {
            this(null, apiTags, parameters);
        }

        APIRequestHandler(String fileParameter, APITag[] apiTags, String... origParameters) {
            List<String> parameters = new ArrayList<>();
            Collections.addAll(parameters, origParameters);
            if ((requirePassword() || parameters.contains("lastIndex")) && ! API.disableAdminPassword) {
                parameters.add("adminPassword");
            }
            if (allowRequiredBlockParameters()) {
                parameters.add("requireBlock");
                parameters.add("requireLastBlock");
            }
            this.parameters = Collections.unmodifiableList(parameters);
            this.apiTags = Collections.unmodifiableSet(new HashSet<>(Arrays.asList(apiTags)));
            this.fileParameter = fileParameter;
        }

        final List<String> getParameters() {
            return parameters;
        }

        final Set<APITag> getAPITags() {
            return apiTags;
        }

        final String getFileParameter() {
            return fileParameter;
        }

        abstract JSONStreamAware processRequest(HttpServletRequest request) throws NxtException;

        JSONStreamAware processRequest(HttpServletRequest request, HttpServletResponse response) throws NxtException {
            return processRequest(request);
        }

        boolean requirePost() {
            return false;
        }

        boolean startDbTransaction() {
            return false;
        }

        boolean requirePassword() {
        	return false;
        }

        boolean allowRequiredBlockParameters() {
            return true;
        }

    }

    private static final boolean enforcePost = Nxt.getBooleanProperty("nxt.apiServerEnforcePOST");
    static final Map<String,APIRequestHandler> apiRequestHandlers;

    static {

        Map<String,APIRequestHandler> map = new HashMap<>();

        map.put("approveTransaction", ApproveTransaction.instance);
        map.put("broadcastTransaction", BroadcastTransaction.instance);
        map.put("calculateFullHash", CalculateFullHash.instance);
        map.put("cancelAskOrder", CancelAskOrder.instance);
        map.put("cancelBidOrder", CancelBidOrder.instance);
        map.put("castVote", CastVote.instance);
        map.put("createPoll", CreatePoll.instance);
        map.put("currencyBuy", CurrencyBuy.instance);
        map.put("currencySell", CurrencySell.instance);
        map.put("currencyReserveIncrease", CurrencyReserveIncrease.instance);
        map.put("currencyReserveClaim", CurrencyReserveClaim.instance);
        map.put("currencyMint", CurrencyMint.instance);
        map.put("decryptFrom", DecryptFrom.instance);
        map.put("dgsListing", DGSListing.instance);
        map.put("dgsDelisting", DGSDelisting.instance);
        map.put("dgsDelivery", DGSDelivery.instance);
        map.put("dgsFeedback", DGSFeedback.instance);
        map.put("dgsPriceChange", DGSPriceChange.instance);
        map.put("dgsPurchase", DGSPurchase.instance);
        map.put("dgsQuantityChange", DGSQuantityChange.instance);
        map.put("dgsRefund", DGSRefund.instance);
        map.put("decodeHallmark", DecodeHallmark.instance);
        map.put("decodeToken", DecodeToken.instance);
        map.put("decodeFileToken", DecodeFileToken.instance);
        map.put("encryptTo", EncryptTo.instance);
        map.put("eventRegister", EventRegister.instance);
        map.put("eventWait", EventWait.instance);
        map.put("generateToken", GenerateToken.instance);
        map.put("generateFileToken", GenerateFileToken.instance);
        map.put("getAccount", GetAccount.instance);
        map.put("getAccountBlockCount", GetAccountBlockCount.instance);
        map.put("getAccountBlockIds", GetAccountBlockIds.instance);
        map.put("getAccountBlocks", GetAccountBlocks.instance);
        map.put("getAccountId", GetAccountId.instance);
        map.put("getVoterPhasedTransactions", GetVoterPhasedTransactions.instance);
        map.put("getPolls", GetPolls.instance);
        map.put("getAccountPhasedTransactions", GetAccountPhasedTransactions.instance);
        map.put("getAccountPhasedTransactionCount", GetAccountPhasedTransactionCount.instance);
        map.put("getAccountPublicKey", GetAccountPublicKey.instance);
        map.put("getAccountTransactionIds", GetAccountTransactionIds.instance);
        map.put("getAccountTransactions", GetAccountTransactions.instance);
        map.put("getAccountLessors", GetAccountLessors.instance);
        map.put("getAccountAssets", GetAccountAssets.instance);
        map.put("getAccountCurrencies", GetAccountCurrencies.instance);
        map.put("getAccountCurrencyCount", GetAccountCurrencyCount.instance);
        map.put("getAccountAssetCount", GetAccountAssetCount.instance);
        map.put("sellAlias", SellAlias.instance);
        map.put("buyAlias", BuyAlias.instance);
        map.put("getAlias", GetAlias.instance);
        map.put("getAliasCount", GetAliasCount.instance);
        map.put("getAliases", GetAliases.instance);
        map.put("getAliasesLike", GetAliasesLike.instance);
        map.put("getAllAssets", GetAllAssets.instance);
        map.put("getAllCurrencies", GetAllCurrencies.instance);
        map.put("getAsset", GetAsset.instance);
        map.put("getAssets", GetAssets.instance);
        map.put("getAssetIds", GetAssetIds.instance);
        map.put("getAssetsByIssuer", GetAssetsByIssuer.instance);
        map.put("getAssetAccounts", GetAssetAccounts.instance);
        map.put("getAssetAccountCount", GetAssetAccountCount.instance);
        map.put("getAssetPhasedTransactions", GetAssetPhasedTransactions.instance);
        map.put("getBalance", GetBalance.instance);
        map.put("getBlock", GetBlock.instance);
        map.put("getBlockId", GetBlockId.instance);
        map.put("getBlockIds", GetBlockIds.instance);
        map.put("getBlocks", GetBlocks.instance);
        map.put("getBlockchainStatus", GetBlockchainStatus.instance);
        map.put("getBlockchainTransactions", GetBlockchainTransactions.instance);
        map.put("getConstants", GetConstants.instance);
        map.put("getCurrency", GetCurrency.instance);
        map.put("getCurrencies", GetCurrencies.instance);
        map.put("getCurrencyFounders", GetCurrencyFounders.instance);
        map.put("getCurrencyIds", GetCurrencyIds.instance);
        map.put("getCurrenciesByIssuer", GetCurrenciesByIssuer.instance);
        map.put("getCurrencyAccounts", GetCurrencyAccounts.instance);
        map.put("getCurrencyAccountCount", GetCurrencyAccountCount.instance);
        map.put("getCurrencyPhasedTransactions", GetCurrencyPhasedTransactions.instance);
        map.put("getDGSGoods", GetDGSGoods.instance);
        map.put("getDGSGoodsCount", GetDGSGoodsCount.instance);
        map.put("getDGSGood", GetDGSGood.instance);
        map.put("getDGSGoodsPurchases", GetDGSGoodsPurchases.instance);
        map.put("getDGSGoodsPurchaseCount", GetDGSGoodsPurchaseCount.instance);
        map.put("getDGSPurchases", GetDGSPurchases.instance);
        map.put("getDGSPurchase", GetDGSPurchase.instance);
        map.put("getDGSPurchaseCount", GetDGSPurchaseCount.instance);
        map.put("getDGSPendingPurchases", GetDGSPendingPurchases.instance);
        map.put("getDGSExpiredPurchases", GetDGSExpiredPurchases.instance);
        map.put("getDGSTags", GetDGSTags.instance);
        map.put("getDGSTagCount", GetDGSTagCount.instance);
        map.put("getDGSTagsLike", GetDGSTagsLike.instance);
        map.put("getGuaranteedBalance", GetGuaranteedBalance.instance);
        map.put("getECBlock", GetECBlock.instance);
        map.put("getInboundPeers", GetInboundPeers.instance);
        map.put("getPlugins", GetPlugins.instance);
        map.put("getMyInfo", GetMyInfo.instance);
        //map.put("getNextBlockGenerators", GetNextBlockGenerators.instance);
        map.put("getPeer", GetPeer.instance);
        map.put("getPeers", GetPeers.instance);
        map.put("getPhasingPoll", GetPhasingPoll.instance);
        map.put("getPhasingPolls", GetPhasingPolls.instance);
        map.put("getPhasingPollVotes", GetPhasingPollVotes.instance);
        map.put("getPhasingPollVote", GetPhasingPollVote.instance);
        map.put("getPoll", GetPoll.instance);
        map.put("getPollResult", GetPollResult.instance);
        map.put("getPollVotes", GetPollVotes.instance);
        map.put("getPollVote", GetPollVote.instance);
        map.put("getRichList", GetRichList.instance);
        map.put("getState", GetState.instance);
        map.put("getTime", GetTime.instance);
        map.put("getTrades", GetTrades.instance);
        map.put("getLastTrades", GetLastTrades.instance);
        map.put("getExchanges", GetExchanges.instance);
        map.put("getExchangesByExchangeRequest", GetExchangesByExchangeRequest.instance);
        map.put("getExchangesByOffer", GetExchangesByOffer.instance);
        map.put("getLastExchanges", GetLastExchanges.instance);
        map.put("getAllTrades", GetAllTrades.instance);
        map.put("getAllExchanges", GetAllExchanges.instance);
        map.put("getAssetTransfers", GetAssetTransfers.instance);
        map.put("getExpectedAssetTransfers", GetExpectedAssetTransfers.instance);
        map.put("getCurrencyTransfers", GetCurrencyTransfers.instance);
        map.put("getExpectedCurrencyTransfers", GetExpectedCurrencyTransfers.instance);
        map.put("getTransaction", GetTransaction.instance);
        map.put("getTransactionBytes", GetTransactionBytes.instance);
        map.put("getUnconfirmedTransactionIds", GetUnconfirmedTransactionIds.instance);
        map.put("getUnconfirmedTransactions", GetUnconfirmedTransactions.instance);
        map.put("getAccountCurrentAskOrderIds", GetAccountCurrentAskOrderIds.instance);
        map.put("getAccountCurrentBidOrderIds", GetAccountCurrentBidOrderIds.instance);
        map.put("getAccountCurrentAskOrders", GetAccountCurrentAskOrders.instance);
        map.put("getAccountCurrentBidOrders", GetAccountCurrentBidOrders.instance);
        map.put("getAllOpenAskOrders", GetAllOpenAskOrders.instance);
        map.put("getAllOpenBidOrders", GetAllOpenBidOrders.instance);
        map.put("getBuyOffers", GetBuyOffers.instance);
        map.put("getExpectedBuyOffers", GetExpectedBuyOffers.instance);
        map.put("getSellOffers", GetSellOffers.instance);
        map.put("getExpectedSellOffers", GetExpectedSellOffers.instance);
        map.put("getOffer", GetOffer.instance);
        map.put("getAskOrder", GetAskOrder.instance);
        map.put("getAskOrderIds", GetAskOrderIds.instance);
        map.put("getAskOrders", GetAskOrders.instance);
        map.put("getBidOrder", GetBidOrder.instance);
        map.put("getBidOrderIds", GetBidOrderIds.instance);
        map.put("getBidOrders", GetBidOrders.instance);
        map.put("getExpectedAskOrders", GetExpectedAskOrders.instance);
        map.put("getExpectedBidOrders", GetExpectedBidOrders.instance);
        map.put("getExpectedOrderCancellations", GetExpectedOrderCancellations.instance);
        map.put("getOrderTrades", GetOrderTrades.instance);
        map.put("getAccountExchangeRequests", GetAccountExchangeRequests.instance);
        map.put("getExpectedExchangeRequests", GetExpectedExchangeRequests.instance);
        map.put("getMintingTarget", GetMintingTarget.instance);
        map.put("getPrunableMessage", GetPrunableMessage.instance);
        map.put("getPrunableMessages", GetPrunableMessages.instance);
        map.put("getAllPrunableMessages", GetAllPrunableMessages.instance);
        map.put("verifyPrunableMessage", VerifyPrunableMessage.instance);
        map.put("issueAsset", IssueAsset.instance);
        map.put("issueCurrency", IssueCurrency.instance);
        map.put("leaseBalance", LeaseBalance.instance);
        map.put("longConvert", LongConvert.instance);
        map.put("hexConvert", HexConvert.instance);
        map.put("markHost", MarkHost.instance);
        map.put("parseTransaction", ParseTransaction.instance);
        map.put("placeAskOrder", PlaceAskOrder.instance);
        map.put("placeBidOrder", PlaceBidOrder.instance);
        map.put("publishExchangeOffer", PublishExchangeOffer.instance);
        map.put("rsConvert", RSConvert.instance);
        map.put("readMessage", ReadMessage.instance);
        map.put("sendMessage", SendMessage.instance);
        map.put("sendMoney", SendMoney.instance);
        map.put("setAccountInfo", SetAccountInfo.instance);
        map.put("setAlias", SetAlias.instance);
        map.put("deleteAlias", DeleteAlias.instance);
        map.put("signTransaction", SignTransaction.instance);
        map.put("startForging", StartForging.instance);
        map.put("stopForging", StopForging.instance);
        map.put("getForging", GetForging.instance);
        map.put("transferAsset", TransferAsset.instance);
        map.put("transferCurrency", TransferCurrency.instance);
        map.put("canDeleteCurrency", CanDeleteCurrency.instance);
        map.put("deleteCurrency", DeleteCurrency.instance);
        map.put("dividendPayment", DividendPayment.instance);
        map.put("searchDGSGoods", SearchDGSGoods.instance);
        map.put("searchAssets", SearchAssets.instance);
        map.put("searchCurrencies", SearchCurrencies.instance);
        map.put("searchPolls", SearchPolls.instance);
        map.put("searchAccounts", SearchAccounts.instance);
        map.put("searchTaggedData", SearchTaggedData.instance);
        map.put("uploadTaggedData", UploadTaggedData.instance);
        map.put("extendTaggedData", ExtendTaggedData.instance);
        map.put("getAccountTaggedData", GetAccountTaggedData.instance);
        map.put("getAllTaggedData", GetAllTaggedData.instance);
        map.put("getChannelTaggedData", GetChannelTaggedData.instance);
        map.put("getTaggedData", GetTaggedData.instance);
        map.put("downloadTaggedData", DownloadTaggedData.instance);
        map.put("getDataTags", GetDataTags.instance);
        map.put("getDataTagCount", GetDataTagCount.instance);
        map.put("getDataTagsLike", GetDataTagsLike.instance);
        map.put("verifyTaggedData", VerifyTaggedData.instance);
        map.put("clearUnconfirmedTransactions", ClearUnconfirmedTransactions.instance);
        map.put("requeueUnconfirmedTransactions", RequeueUnconfirmedTransactions.instance);
        map.put("rebroadcastUnconfirmedTransactions", RebroadcastUnconfirmedTransactions.instance);
        map.put("getAllWaitingTransactions", GetAllWaitingTransactions.instance);
        map.put("getAllBroadcastedTransactions", GetAllBroadcastedTransactions.instance);
        map.put("fullReset", FullReset.instance);
        map.put("popOff", PopOff.instance);
        map.put("scan", Scan.instance);
        map.put("luceneReindex", LuceneReindex.instance);
        map.put("addPeer", AddPeer.instance);
        map.put("blacklistPeer", BlacklistPeer.instance);
        map.put("dumpPeers", DumpPeers.instance);
        map.put("getLog", GetLog.instance);
        map.put("getStackTraces", GetStackTraces.instance);
        map.put("setLogging", SetLogging.instance);
        map.put("shutdown", Shutdown.instance);
        map.put("trimDerivedTables", TrimDerivedTables.instance);
        map.put("hash", Hash.instance);
        map.put("fullHashToId", FullHashToId.instance);

        apiRequestHandlers = Collections.unmodifiableMap(map);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        process(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        process(req, resp);
    }

    private void process(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // Set response values now in case we create an asynchronous context
        resp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, private");
        resp.setHeader("Pragma", "no-cache");
        resp.setDateHeader("Expires", 0);
        resp.setContentType("text/plain; charset=UTF-8");

        JSONStreamAware response = JSON.emptyJSON;

        try {

            long startTime = System.currentTimeMillis();

			if (! API.isAllowed(req.getRemoteHost())) {
                response = ERROR_NOT_ALLOWED;
                return;
            }

            String requestType = req.getParameter("requestType");
            if (requestType == null) {
                response = ERROR_INCORRECT_REQUEST;
                return;
            }

            APIRequestHandler apiRequestHandler = apiRequestHandlers.get(requestType);
            if (apiRequestHandler == null) {
                response = ERROR_INCORRECT_REQUEST;
                return;
            }

            if (enforcePost && apiRequestHandler.requirePost() && ! "POST".equals(req.getMethod())) {
                response = POST_REQUIRED;
                return;
            }

            try {
                if (apiRequestHandler.requirePassword()) {
                    API.verifyPassword(req);
                }
                final long requireBlockId = apiRequestHandler.allowRequiredBlockParameters() ?
                        ParameterParser.getUnsignedLong(req, "requireBlock", false) : 0;
                final long requireLastBlockId = apiRequestHandler.allowRequiredBlockParameters() ?
                        ParameterParser.getUnsignedLong(req, "requireLastBlock", false) : 0;
                if (requireBlockId != 0 || requireLastBlockId != 0) {
                    Nxt.getBlockchain().readLock();
                }
                try {
                    try {
                        if (apiRequestHandler.startDbTransaction()) {
                            Db.db.beginTransaction();
                        }
                        if (requireBlockId != 0 && !Nxt.getBlockchain().hasBlock(requireBlockId)) {
                            response = REQUIRED_BLOCK_NOT_FOUND;
                            return;
                        }
                        if (requireLastBlockId != 0 && requireLastBlockId != Nxt.getBlockchain().getLastBlock().getId()) {
                            response = REQUIRED_LAST_BLOCK_NOT_FOUND;
                            return;
                        }
                        response = apiRequestHandler.processRequest(req, resp);
                        if (requireLastBlockId == 0 && requireBlockId != 0 && response instanceof JSONObject) {
                            ((JSONObject) response).put("lastBlock", Nxt.getBlockchain().getLastBlock().getStringId());
                        }
                    } finally {
                        if (apiRequestHandler.startDbTransaction()) {
                            Db.db.endTransaction();
                        }
                    }
                } finally {
                    if (requireBlockId != 0 || requireLastBlockId != 0) {
                        Nxt.getBlockchain().readUnlock();
                    }
                }
            } catch (ParameterException e) {
                response = e.getErrorResponse();
            } catch (NxtException |RuntimeException e) {
                Logger.logDebugMessage("Error processing API request", e);
                JSONObject json = new JSONObject();
                JSONData.putException(json, e);
                response = JSON.prepare(json);
            } catch (ExceptionInInitializerError err) {
                Logger.logErrorMessage("Initialization Error", err.getCause());
                response = ERROR_INCORRECT_REQUEST;
            }
            if (response != null && (response instanceof JSONObject)) {
                ((JSONObject)response).put("requestProcessingTime", System.currentTimeMillis() - startTime);
            }
        } catch (Exception e) {
            Logger.logErrorMessage("Error processing request", e);
            response = ERROR_INCORRECT_REQUEST;
        } finally {
            // The response will be null if we created an asynchronous context
            if (response != null) {
                try (Writer writer = resp.getWriter()) {
                    JSON.writeJSONString(response, writer);
                }
            }
        }

    }

}
