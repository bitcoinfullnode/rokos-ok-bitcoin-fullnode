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

import nxt.Order;
import nxt.db.DbIterator;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONStreamAware;

import javax.servlet.http.HttpServletRequest;

public final class GetAllOpenBidOrders extends APIServlet.APIRequestHandler {

    static final GetAllOpenBidOrders instance = new GetAllOpenBidOrders();

    private GetAllOpenBidOrders() {
        super(new APITag[] {APITag.AE}, "firstIndex", "lastIndex");
    }

    @Override
    JSONStreamAware processRequest(HttpServletRequest req) {

        JSONObject response = new JSONObject();
        JSONArray ordersData = new JSONArray();

        int firstIndex = ParameterParser.getFirstIndex(req);
        int lastIndex = ParameterParser.getLastIndex(req);

        try (DbIterator<Order.Bid> bidOrders = Order.Bid.getAll(firstIndex, lastIndex)) {
            while (bidOrders.hasNext()) {
                ordersData.add(JSONData.bidOrder(bidOrders.next()));
            }
        }

        response.put("openOrders", ordersData);
        return response;
    }

}
