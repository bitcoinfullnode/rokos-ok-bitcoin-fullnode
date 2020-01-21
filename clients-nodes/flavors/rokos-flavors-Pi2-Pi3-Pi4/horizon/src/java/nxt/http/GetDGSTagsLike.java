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
import nxt.db.DbIterator;
import nxt.util.Convert;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONStreamAware;

import javax.servlet.http.HttpServletRequest;

public final class GetDGSTagsLike extends APIServlet.APIRequestHandler {

    static final GetDGSTagsLike instance = new GetDGSTagsLike();

    private GetDGSTagsLike() {
        super(new APITag[] {APITag.DGS, APITag.SEARCH}, "tagPrefix", "inStockOnly", "firstIndex", "lastIndex");
    }

    @Override
    JSONStreamAware processRequest(HttpServletRequest req) throws NxtException {
        int firstIndex = ParameterParser.getFirstIndex(req);
        int lastIndex = ParameterParser.getLastIndex(req);
        final boolean inStockOnly = "true".equalsIgnoreCase(req.getParameter("inStockOnly"));
        String prefix = Convert.emptyToNull(req.getParameter("tagPrefix"));
        if (prefix == null) {
            return JSONResponses.missing("tagPrefix");
        }
        if (prefix.length() < 2) {
            return JSONResponses.incorrect("tagPrefix", "tagPrefix must be at least 2 characters long");
        }

        JSONObject response = new JSONObject();
        JSONArray tagsJSON = new JSONArray();
        response.put("tags", tagsJSON);
        try (DbIterator<DigitalGoodsStore.Tag> tags = DigitalGoodsStore.Tag.getTagsLike(prefix, inStockOnly, firstIndex, lastIndex)) {
            while (tags.hasNext()) {
                tagsJSON.add(JSONData.tag(tags.next()));
            }
        }
        return response;
    }

}
