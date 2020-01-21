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

package nxt.http.twophased;

import nxt.BlockchainTest;
import nxt.Constants;
import nxt.http.APICall;
import nxt.http.twophased.TestCreateTwoPhased.TwoPhasedMoneyTransferBuilder;
import nxt.util.Logger;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.junit.Assert;
import org.junit.Test;

public class TestGetVoterPhasedTransactions extends BlockchainTest {

    static APICall getVoterPhasedTransactions() {
        return new APICall.Builder("getVoterPhasedTransactions")
                .param("account", Long.toUnsignedString(CHUCK.getId()))
                .param("firstIndex", 0)
                .param("lastIndex", 10)
                .build();
    }

    @Test
    public void simpleTransactionLookup() {
        APICall apiCall = new TwoPhasedMoneyTransferBuilder().build();
        JSONObject transactionJSON = TestCreateTwoPhased.issueCreateTwoPhased(apiCall, false);
        String transactionId = (String) transactionJSON.get("transaction");

        generateBlock();

        JSONObject response = getVoterPhasedTransactions().invoke();
        Logger.logMessage("getVoterPhasedTransactionsResponse:" + response.toJSONString());
        JSONArray transactionsJson = (JSONArray) response.get("transactions");
        Assert.assertTrue(TwoPhasedSuite.searchForTransactionId(transactionsJson, transactionId));
    }

    @Test
    public void transactionLookupAfterVote() {

        APICall apiCall = new TwoPhasedMoneyTransferBuilder()
                .build();
        JSONObject transactionJSON = TestCreateTwoPhased.issueCreateTwoPhased(apiCall, false);
        String transactionFullHash = (String) transactionJSON.get("fullHash");

        generateBlock();

        long fee = Constants.ONE_NXT;
        apiCall = new APICall.Builder("approveTransaction")
                .param("secretPhrase", CHUCK.getSecretPhrase())
                .param("transactionFullHash", transactionFullHash)
                .param("feeNQT", fee)
                .build();
        JSONObject response = apiCall.invoke();
        Logger.logMessage("approvePhasedTransactionResponse:" + response.toJSONString());

        generateBlock();

        response = getVoterPhasedTransactions().invoke();
        Logger.logMessage("getVoterPhasedTransactionsResponse:" + response.toJSONString());
        JSONArray transactionsJson = (JSONArray) response.get("transactions");
        Assert.assertFalse(TwoPhasedSuite.searchForTransactionId(transactionsJson, transactionFullHash));
    }

    @Test
    public void sorting() {
        for (int i = 0; i < 15; i++) {
            APICall apiCall = new TestCreateTwoPhased.TwoPhasedMoneyTransferBuilder().build();
            TestCreateTwoPhased.issueCreateTwoPhased(apiCall, false);
        }

        JSONObject response = getVoterPhasedTransactions().invoke();
        Logger.logMessage("getVoterPhasedTransactionsResponse:" + response.toJSONString());
        JSONArray transactionsJson = (JSONArray) response.get("transactions");

        //sorting check
        int prevHeight = Integer.MAX_VALUE;
        for (Object transactionsJsonObj : transactionsJson) {
            JSONObject transactionObject = (JSONObject) transactionsJsonObj;
            int height = ((Long) transactionObject.get("height")).intValue();
            Assert.assertTrue(height <= prevHeight);
            prevHeight = height;
        }
    }
}
