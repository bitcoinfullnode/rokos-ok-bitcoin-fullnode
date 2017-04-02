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
import nxt.Nxt;
import nxt.NxtException;
import nxt.Poll;
import nxt.Vote;
import nxt.VoteWeighting;
import nxt.util.JSON;
import org.json.simple.JSONStreamAware;

import javax.servlet.http.HttpServletRequest;

public class GetPollVote extends APIServlet.APIRequestHandler  {
    static final GetPollVote instance = new GetPollVote();

    private GetPollVote() {
        super(new APITag[] {APITag.VS}, "poll", "account", "includeWeights");
    }

    @Override
    JSONStreamAware processRequest(HttpServletRequest req) throws NxtException {
        Poll poll = ParameterParser.getPoll(req);
        Account account = ParameterParser.getAccount(req);
        boolean includeWeights = "true".equalsIgnoreCase(req.getParameter("includeWeights"));
        Vote vote = Vote.getVote(poll.getId(), account.getId());
        if (vote != null) {
            int countHeight;
            JSONData.VoteWeighter weighter = null;
            if (includeWeights && (countHeight = Math.min(poll.getFinishHeight(), Nxt.getBlockchain().getHeight()))
                    >= Nxt.getBlockchainProcessor().getMinRollbackHeight()) {
                VoteWeighting voteWeighting = poll.getVoteWeighting();
                VoteWeighting.VotingModel votingModel = voteWeighting.getVotingModel();
                weighter = voterId -> votingModel.calcWeight(voteWeighting, voterId, countHeight);
            }
            return JSONData.vote(vote, weighter);
        }
        return JSON.emptyJSON;
    }
}
