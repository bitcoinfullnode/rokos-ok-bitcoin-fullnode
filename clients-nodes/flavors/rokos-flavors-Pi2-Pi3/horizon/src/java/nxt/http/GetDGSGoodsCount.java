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

public final class GetDGSGoodsCount extends APIServlet.APIRequestHandler {

    static final GetDGSGoodsCount instance = new GetDGSGoodsCount();

    private GetDGSGoodsCount() {
        super(new APITag[] {APITag.DGS}, "seller", "inStockOnly");
    }

    @Override
    JSONStreamAware processRequest(HttpServletRequest req) throws NxtException {
        long sellerId = ParameterParser.getAccountId(req, "seller", false);
        boolean inStockOnly = !"false".equalsIgnoreCase(req.getParameter("inStockOnly"));

        JSONObject response = new JSONObject();
        response.put("numberOfGoods", sellerId != 0
                ? DigitalGoodsStore.Goods.getSellerGoodsCount(sellerId, inStockOnly)
                : inStockOnly ? DigitalGoodsStore.Goods.getCountInStock() : DigitalGoodsStore.Goods.getCount());
        return response;
    }

}
