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

import nxt.Constants;
import nxt.CurrencyMinting;
import nxt.CurrencyType;
import nxt.Genesis;
import nxt.PhasingPoll;
import nxt.TransactionType;
import nxt.VoteWeighting;
import nxt.crypto.HashFunction;
import nxt.peer.Peer;
import nxt.util.JSON;
import nxt.util.Logger;
import org.json.simple.JSONObject;
import org.json.simple.JSONStreamAware;

import javax.servlet.http.HttpServletRequest;

public final class GetConstants extends APIServlet.APIRequestHandler {

    static final GetConstants instance = new GetConstants();

    private static final JSONStreamAware CONSTANTS;

    static {
        try {
            JSONObject response = new JSONObject();
            response.put("genesisBlockId", Long.toUnsignedString(Genesis.GENESIS_BLOCK_ID));
            response.put("genesisAccountId", Long.toUnsignedString(Genesis.CREATOR_ID));
            response.put("epochBeginning", Constants.EPOCH_BEGINNING);
            response.put("maxBlockPayloadLength", Constants.MAX_PAYLOAD_LENGTH);
            response.put("maxArbitraryMessageLength", Constants.MAX_ARBITRARY_MESSAGE_LENGTH);

            JSONObject transactionJSON = new JSONObject();
            JSONObject transactionSubTypesJSON = new JSONObject();
            outer:
            for (int type = 0; ; type++) {
                JSONObject typeJSON = new JSONObject();
                JSONObject subtypesJSON = new JSONObject();
                for (int subtype = 0; ; subtype++) {
                    TransactionType transactionType = TransactionType.findTransactionType((byte) type, (byte) subtype);
                    if (transactionType == null) {
                        if (subtype == 0) {
                            break outer;
                        } else {
                            break;
                        }
                    }
                    JSONObject subtypeJSON = new JSONObject();
                    subtypeJSON.put("name", transactionType.getName());
                    subtypeJSON.put("canHaveRecipient", transactionType.canHaveRecipient());
                    subtypeJSON.put("mustHaveRecipient", transactionType.mustHaveRecipient());
                    subtypeJSON.put("isPhasingSafe", transactionType.isPhasingSafe());
                    subtypeJSON.put("isPhasable", transactionType.isPhasable());
                    subtypeJSON.put("type", type);
                    subtypeJSON.put("subtype", subtype);
                    subtypesJSON.put(subtype, subtypeJSON);
                    transactionSubTypesJSON.put(transactionType.getName(), subtypeJSON);
                }
                typeJSON.put("subtypes", subtypesJSON);
                transactionJSON.put(type, typeJSON);
            }
            response.put("transactionTypes", transactionJSON);
            response.put("transactionSubTypes", transactionSubTypesJSON);

            JSONObject currencyTypes = new JSONObject();
            for (CurrencyType currencyType : CurrencyType.values()) {
                currencyTypes.put(currencyType.toString(), currencyType.getCode());
            }
            response.put("currencyTypes", currencyTypes);

            JSONObject votingModels = new JSONObject();
            for (VoteWeighting.VotingModel votingModel : VoteWeighting.VotingModel.values()) {
                votingModels.put(votingModel.toString(), votingModel.getCode());
            }
            response.put("votingModels", votingModels);

            JSONObject minBalanceModels = new JSONObject();
            for (VoteWeighting.MinBalanceModel minBalanceModel : VoteWeighting.MinBalanceModel.values()) {
                minBalanceModels.put(minBalanceModel.toString(), minBalanceModel.getCode());
            }
            response.put("minBalanceModels", minBalanceModels);

            JSONObject hashFunctions = new JSONObject();
            for (HashFunction hashFunction : HashFunction.values()) {
                hashFunctions.put(hashFunction.toString(), hashFunction.getId());
            }
            response.put("hashAlgorithms", hashFunctions);

            JSONObject phasingHashFunctions = new JSONObject();
            for (HashFunction hashFunction : PhasingPoll.acceptedHashFunctions) {
                phasingHashFunctions.put(hashFunction.toString(), hashFunction.getId());
            }
            response.put("phasingHashAlgorithms", phasingHashFunctions);

            JSONObject mintingHashFunctions = new JSONObject();
            for (HashFunction hashFunction : CurrencyMinting.acceptedHashFunctions) {
                mintingHashFunctions.put(hashFunction.toString(), hashFunction.getId());
            }
            response.put("mintingHashAlgorithms", mintingHashFunctions);

            JSONObject peerStates = new JSONObject();
            for (Peer.State peerState : Peer.State.values()) {
                peerStates.put(peerState.toString(), peerState.ordinal());
            }
            response.put("peerStates", peerStates);
            response.put("maxTaggedDataDataLength", Constants.MAX_TAGGED_DATA_DATA_LENGTH);

            CONSTANTS = JSON.prepare(response);
        } catch (Exception e) {
            Logger.logErrorMessage(e.toString(), e);
            throw e;
        }
    }

    private GetConstants() {
        super(new APITag[] {APITag.INFO});
    }

    @Override
    JSONStreamAware processRequest(HttpServletRequest req) {
        return CONSTANTS;
    }

    @Override
    boolean allowRequiredBlockParameters() {
        return false;
    }

}
