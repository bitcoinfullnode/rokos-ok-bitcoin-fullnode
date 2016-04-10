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
import nxt.NxtException;
import nxt.PrunableMessage;
import nxt.crypto.Crypto;
import nxt.db.DbIterator;
import nxt.db.DbUtils;
import nxt.util.Convert;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONStreamAware;

import javax.servlet.http.HttpServletRequest;

public final class GetPrunableMessages extends APIServlet.APIRequestHandler {

    static final GetPrunableMessages instance = new GetPrunableMessages();

    private GetPrunableMessages() {
        super(new APITag[] {APITag.MESSAGES}, "account", "otherAccount", "secretPhrase", "firstIndex", "lastIndex", "timestamp");
    }

    @Override
    JSONStreamAware processRequest(HttpServletRequest req) throws NxtException {
        Account account = ParameterParser.getAccount(req);
        String secretPhrase = Convert.emptyToNull(req.getParameter("secretPhrase"));
        int firstIndex = ParameterParser.getFirstIndex(req);
        int lastIndex = ParameterParser.getLastIndex(req);
        final int timestamp = ParameterParser.getTimestamp(req);
        long readerAccountId = secretPhrase == null ? 0 : Account.getId(Crypto.getPublicKey(secretPhrase));
        long otherAccountId = ParameterParser.getAccountId(req, "otherAccount", false);

        DbIterator<PrunableMessage> messages = otherAccountId == 0 ? PrunableMessage.getPrunableMessages(account.getId(), firstIndex, lastIndex)
                : PrunableMessage.getPrunableMessages(account.getId(), otherAccountId, firstIndex, lastIndex);

        JSONObject response = new JSONObject();
        JSONArray jsonArray = new JSONArray();
        response.put("prunableMessages", jsonArray);

        try {
            while (messages.hasNext()) {
                PrunableMessage prunableMessage = messages.next();
                if (prunableMessage.getBlockTimestamp() < timestamp) {
                    break;
                }
                jsonArray.add(JSONData.prunableMessage(prunableMessage, readerAccountId, secretPhrase));
            }
        } finally {
            DbUtils.close(messages);
        }
        return response;
    }

}
