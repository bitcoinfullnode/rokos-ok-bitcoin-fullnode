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
import nxt.CurrencyFounder;
import nxt.NxtException;
import nxt.db.DbIterator;
import nxt.db.DbUtils;
import nxt.util.Convert;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONStreamAware;

import javax.servlet.http.HttpServletRequest;

public final class GetCurrencyFounders extends APIServlet.APIRequestHandler {

    static final GetCurrencyFounders instance = new GetCurrencyFounders();

    private GetCurrencyFounders() {
        super(new APITag[] {APITag.MS}, "currency", "account", "firstIndex", "lastIndex");
    }

    @Override
    JSONStreamAware processRequest(HttpServletRequest req) throws NxtException {
        String currencyId = Convert.emptyToNull(req.getParameter("currency"));
        String accountId = Convert.emptyToNull(req.getParameter("account"));
        if (currencyId == null && accountId == null) {
            return JSONResponses.MISSING_CURRENCY_ACCOUNT;
        }
        int firstIndex = ParameterParser.getFirstIndex(req);
        int lastIndex = ParameterParser.getLastIndex(req);

        JSONObject response = new JSONObject();
        JSONArray foundersJSONArray = new JSONArray();
        response.put("founders", foundersJSONArray);

        if (currencyId != null && accountId != null) {
            CurrencyFounder currencyFounder = CurrencyFounder.getFounder(ParameterParser.getCurrency(req).getId(), ParameterParser.getAccount(req).getId());
            if (currencyFounder != null) {
                foundersJSONArray.add(JSONData.currencyFounder(currencyFounder));
            }
            return response;
        }

        DbIterator<CurrencyFounder> founders = null;
        try {
            if (accountId == null) {
                Currency currency = ParameterParser.getCurrency(req);
                founders = CurrencyFounder.getCurrencyFounders(currency.getId(), firstIndex, lastIndex);
            } else if (currencyId == null) {
                Account account = ParameterParser.getAccount(req);
                founders = CurrencyFounder.getFounderCurrencies(account.getId(), firstIndex, lastIndex);
            }
            for (CurrencyFounder founder : founders) {
                foundersJSONArray.add(JSONData.currencyFounder(founder));
            }
        } finally {
            DbUtils.close(founders);
        }
        return response;
    }
}
