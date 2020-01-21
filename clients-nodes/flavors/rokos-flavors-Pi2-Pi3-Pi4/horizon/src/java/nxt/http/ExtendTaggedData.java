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
import nxt.Nxt;
import nxt.NxtException;
import nxt.TaggedData;
import nxt.Transaction;
import nxt.TransactionType;
import org.json.simple.JSONStreamAware;

import javax.servlet.http.HttpServletRequest;

import static nxt.http.JSONResponses.UNKNOWN_TRANSACTION;

public final class ExtendTaggedData extends CreateTransaction {

    static final ExtendTaggedData instance = new ExtendTaggedData();

    private ExtendTaggedData() {
        super("file", new APITag[] {APITag.DATA, APITag.CREATE_TRANSACTION}, "transaction",
                "name", "description", "tags", "type", "channel", "isText", "filename", "data");
    }

    @Override
    JSONStreamAware processRequest(HttpServletRequest req) throws NxtException {

        Account account = ParameterParser.getSenderAccount(req);
        long transactionId = ParameterParser.getUnsignedLong(req, "transaction", true);
        TaggedData taggedData = TaggedData.getData(transactionId);
        if (taggedData == null) {
            Transaction transaction = Nxt.getBlockchain().getTransaction(transactionId);
            if (transaction == null || transaction.getType() != TransactionType.Data.TAGGED_DATA_UPLOAD) {
                return UNKNOWN_TRANSACTION;
            }
            Attachment.TaggedDataUpload taggedDataUpload = ParameterParser.getTaggedData(req);
            taggedData = new TaggedData(transaction, taggedDataUpload);
        }
        Attachment.TaggedDataExtend taggedDataExtend = new Attachment.TaggedDataExtend(taggedData);
        return createTransaction(req, account, taggedDataExtend);

    }

}
