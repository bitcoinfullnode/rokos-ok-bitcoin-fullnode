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

import nxt.NxtException;
import org.json.simple.JSONStreamAware;

import javax.servlet.http.HttpServletRequest;

public final class GetDGSGood extends APIServlet.APIRequestHandler {

    static final GetDGSGood instance = new GetDGSGood();

    private GetDGSGood() {
        super(new APITag[] {APITag.DGS}, "goods", "includeCounts");
    }

    @Override
    JSONStreamAware processRequest(HttpServletRequest req) throws NxtException {
        boolean includeCounts = !"false".equalsIgnoreCase(req.getParameter("includeCounts"));
        return JSONData.goods(ParameterParser.getGoods(req), includeCounts);
    }

}
