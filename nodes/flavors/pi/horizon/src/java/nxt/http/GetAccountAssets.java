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
import nxt.Asset;
import nxt.NxtException;
import nxt.db.DbIterator;
import nxt.util.Convert;
import nxt.util.JSON;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONStreamAware;

import javax.servlet.http.HttpServletRequest;

public final class GetAccountAssets extends APIServlet.APIRequestHandler {

    static final GetAccountAssets instance = new GetAccountAssets();

    private GetAccountAssets() {
        super(new APITag[] {APITag.ACCOUNTS, APITag.AE}, "account", "asset", "height");
    }

    @Override
    JSONStreamAware processRequest(HttpServletRequest req) throws NxtException {

        Account account = ParameterParser.getAccount(req);
        int height = ParameterParser.getHeight(req);
        String assetValue = Convert.emptyToNull(req.getParameter("asset"));

        if (assetValue == null) {
            JSONObject response = new JSONObject();
            try (DbIterator<Account.AccountAsset> accountAssets = account.getAssets(height, 0, -1)) {
                JSONArray assetJSON = new JSONArray();
                while (accountAssets.hasNext()) {
                    assetJSON.add(JSONData.accountAsset(accountAssets.next(), false, true));
                }
                response.put("accountAssets", assetJSON);
                return response;
            }
        } else {
            Asset asset = ParameterParser.getAsset(req);
            Account.AccountAsset accountAsset = account.getAsset(asset.getId(), height);
            if (accountAsset != null) {
                return JSONData.accountAsset(accountAsset, false, true);
            }
            return JSON.emptyJSON;
        }
    }

}
