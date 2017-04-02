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
import nxt.Attachment;
import nxt.Constants;
import nxt.NxtException;
import nxt.Poll;
import nxt.util.Convert;
import org.json.simple.JSONStreamAware;

import javax.servlet.http.HttpServletRequest;

import static nxt.http.JSONResponses.INCORRECT_VOTE;
import static nxt.http.JSONResponses.POLL_FINISHED;


public final class CastVote extends CreateTransaction {

    static final CastVote instance = new CastVote();

    private CastVote() {
        super(new APITag[]{APITag.VS, APITag.CREATE_TRANSACTION}, "poll", "vote00", "vote01", "vote02");
    }

    @Override
    JSONStreamAware processRequest(HttpServletRequest req) throws NxtException {
        Poll poll = ParameterParser.getPoll(req);
        if (poll.isFinished()) {
            return POLL_FINISHED;
        }

        int numberOfOptions = poll.getOptions().length;
        byte[] vote = new byte[numberOfOptions];
        try {
            for (int i = 0; i < numberOfOptions; i++) {
                String voteValue = Convert.emptyToNull(req.getParameter("vote" + (i < 10 ? "0" + i : i)));
                if (voteValue != null) {
                    vote[i] = Byte.parseByte(voteValue);
                    if (vote[i] != Constants.NO_VOTE_VALUE && (vote[i] < poll.getMinRangeValue() || vote[i] > poll.getMaxRangeValue())) {
                        return INCORRECT_VOTE;
                    }
                } else {
                    vote[i] = Constants.NO_VOTE_VALUE;
                }
            }
        } catch (NumberFormatException e) {
            return INCORRECT_VOTE;
        }

        Account account = ParameterParser.getSenderAccount(req);
        Attachment attachment = new Attachment.MessagingVoteCasting(poll.getId(), vote);
        return createTransaction(req, account, attachment);
    }
}
