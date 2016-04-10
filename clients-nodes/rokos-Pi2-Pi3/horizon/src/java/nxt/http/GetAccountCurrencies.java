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
import nxt.NxtException;
import nxt.db.DbIterator;
import nxt.util.Convert;
import nxt.util.JSON;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONStreamAware;

import javax.servlet.http.HttpServletRequest;

public final class GetAccountCurrencies extends APIServlet.APIRequestHandler {

    static final GetAccountCurrencies instance = new GetAccountCurrencies();

    private GetAccountCurrencies() {
        super(new APITag[] {APITag.ACCOUNTS, APITag.MS}, "account", "currency", "height");
    }

    @Override
    JSONStreamAware processRequest(HttpServletRequest req) throws NxtException {

        Account account = ParameterParser.getAccount(req);
        int height = ParameterParser.getHeight(req);
        String currencyValue = Convert.emptyToNull(req.getParameter("currency"));

        if (currencyValue == null) {
            JSONObject response = new JSONObject();
            try (DbIterator<Account.AccountCurrency> accountCurrencies = account.getCurrencies(height, 0, -1)) {
                JSONArray currencyJSON = new JSONArray();
                while (accountCurrencies.hasNext()) {
                    currencyJSON.add(JSONData.accountCurrency(accountCurrencies.next(), false, true));
                }
                response.put("accountCurrencies", currencyJSON);
                return response;
            }
        } else {
            Currency currency = ParameterParser.getCurrency(req);
            Account.AccountCurrency accountCurrency = account.getCurrency(currency.getId(), height);
            if (accountCurrency != null) {
                return JSONData.accountCurrency(accountCurrency, false, true);
            }
            return JSON.emptyJSON;
        }
    }

}
