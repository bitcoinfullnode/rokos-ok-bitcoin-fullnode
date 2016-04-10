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

import nxt.Account;
import nxt.Currency;
import nxt.PhasingPoll;
import nxt.Transaction;
import nxt.VoteWeighting;
import nxt.db.DbIterator;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONStreamAware;

import javax.servlet.http.HttpServletRequest;

public class GetCurrencyPhasedTransactions extends APIServlet.APIRequestHandler {
    static final GetCurrencyPhasedTransactions instance = new GetCurrencyPhasedTransactions();

    private GetCurrencyPhasedTransactions() {
        super(new APITag[]{APITag.MS, APITag.PHASING}, "currency", "account", "withoutWhitelist", "firstIndex", "lastIndex");
    }

    @Override
    JSONStreamAware processRequest(HttpServletRequest req) throws ParameterException {
        Currency currency = ParameterParser.getCurrency(req);
        Account account = ParameterParser.getAccount(req, false);
        int firstIndex = ParameterParser.getFirstIndex(req);
        int lastIndex = ParameterParser.getLastIndex(req);
        boolean withoutWhitelist = "true".equalsIgnoreCase(req.getParameter("withoutWhitelist"));

        long currencyId = currency.getId();

        JSONArray transactions = new JSONArray();
        try (DbIterator<? extends Transaction> iterator = PhasingPoll.getHoldingPhasedTransactions(currencyId, VoteWeighting.VotingModel.CURRENCY,
                account, withoutWhitelist, firstIndex, lastIndex)) {
            while (iterator.hasNext()) {
                Transaction transaction = iterator.next();
                transactions.add(JSONData.transaction(transaction));
            }
        }
        JSONObject response = new JSONObject();
        response.put("transactions", transactions);
        return response;
    }

}
