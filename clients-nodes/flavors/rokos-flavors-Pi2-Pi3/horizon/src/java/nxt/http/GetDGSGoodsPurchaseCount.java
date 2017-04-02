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

import nxt.DigitalGoodsStore;
import nxt.NxtException;
import org.json.simple.JSONObject;
import org.json.simple.JSONStreamAware;

import javax.servlet.http.HttpServletRequest;

public final class GetDGSGoodsPurchaseCount extends APIServlet.APIRequestHandler {

    static final GetDGSGoodsPurchaseCount instance = new GetDGSGoodsPurchaseCount();

    private GetDGSGoodsPurchaseCount() {
        super(new APITag[] {APITag.DGS}, "goods", "withPublicFeedbacksOnly", "completed");
    }

    @Override
    JSONStreamAware processRequest(HttpServletRequest req) throws NxtException {

        DigitalGoodsStore.Goods goods = ParameterParser.getGoods(req);
        final boolean withPublicFeedbacksOnly = "true".equalsIgnoreCase(req.getParameter("withPublicFeedbacksOnly"));
        final boolean completed = "true".equalsIgnoreCase(req.getParameter("completed"));

        JSONObject response = new JSONObject();
        response.put("numberOfPurchases", DigitalGoodsStore.Purchase.getGoodsPurchaseCount(goods.getId(), withPublicFeedbacksOnly, completed));
        return response;

    }

}
