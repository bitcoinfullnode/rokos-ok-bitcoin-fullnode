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

import nxt.Exchange;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONStreamAware;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

public final class GetLastExchanges extends APIServlet.APIRequestHandler {

    static final GetLastExchanges instance = new GetLastExchanges();

    private GetLastExchanges() {
        super(new APITag[] {APITag.MS}, "currencies", "currencies", "currencies"); // limit to 3 for testing
    }

    @Override
    JSONStreamAware processRequest(HttpServletRequest req) throws ParameterException {
        long[] currencyIds = ParameterParser.getUnsignedLongs(req, "currencies");
        JSONArray exchangesJSON = new JSONArray();
        List<Exchange> exchanges = Exchange.getLastExchanges(currencyIds);
        exchanges.forEach(exchange -> exchangesJSON.add(JSONData.exchange(exchange, false)));
        JSONObject response = new JSONObject();
        response.put("exchanges", exchangesJSON);
        return response;
    }

}
