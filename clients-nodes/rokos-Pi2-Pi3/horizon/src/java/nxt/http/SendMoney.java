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
import org.json.simple.JSONStreamAware;

import javax.servlet.http.HttpServletRequest;

/**
 * <pre>
 * This class processes HTTP HZ API requests of type sendMoney.
 * 
 * Send HZ to an account.
 * 
 * <b>requestType</b> is sendMoney
 * <b>amountNQT</b> is the amount (in NQT) in the transaction
 * <b>recipient</b> is the account ID of the recipient
 * <b>recipientPublicKey</b> is the public key of the receiving account (optional, enhances security of a new account)
 * See <b><a href="CreateTransaction.html">CreateTransaction</a></b> for additional parameters
 * 
 * <b>Example request:</b>
 * <a href="http://localhost:7776/nhz?requestType=sendMoney&amp;secretPhrase=IWontTellYou&amp;recipient=NHZ-4VNQ-RWZC-4WWQ-GVM8S&amp;amountNQT=100000000&amp;feeNQT=100000000&amp;deadline=60">http://localhost:7776/nhz?requestType=sendMoney&amp;secretPhrase=IWontTellYou&amp;recipient=NHZ-4VNQ-RWZC-4WWQ-GVM8S&amp;amountNQT=100000000&amp;feeNQT=100000000&amp;deadline=60</a>
 * 
 * <b>Example response:</b>
 * </pre>
 * <blockquote><pre>
 * {
 * 	"signatureHash":"91aaa27ac9b960d736e9cd7ecba602a1a2e026ba0d93b6b51936cd1bfcd66e51",
 * 	"unsignedTransactionBytes":"0010baf21d023c00847cb0368575f90ff2b6a9e10a20b3231a6249eba04a70ff601acce5ffc64652966ea13ebf7b1aec00e1f5050000000000e1f505000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000028700100a3af453228d0c838",
 * 	"transactionJSON":{
 * 		"senderPublicKey":"847cb0368575f90ff2b6a9e10a20b3231a6249eba04a70ff601acce5ffc64652",
 * 		"signature":"73b70f5c57e491d14363c5129ff275178ebebd2a46766d00cea0b70c995ef8095d05935fcac7d91190a9f864c3defd6306a3029bbe055d35ae5d06d393cbd189",
 * 		"feeNQT":"100000000",
 * 		"type":0,
 * 		"fullHash":"5108cdcb63cd60bab0e3a00e30de9ecc95d8d9d4a09c667b3d451f1d905a3352",
 * 		"version":1,
 * 		"ecBlockId":"4091749132526792611",
 * 		"signatureHash":"91aaa27ac9b960d736e9cd7ecba602a1a2e026ba0d93b6b51936cd1bfcd66e51",
 * 		"senderRS":"NHZ-C7Z7-RWVF-9MAG-DDMNL",
 * 		"subtype":0,
 * 		"amountNQT":"100000000",
 * 		"sender":"13353854314109802469",
 * 		"recipientRS":"NHZ-4VNQ-RWZC-4WWQ-GVM8S",
 * 		"recipient":"17013046603665206934",
 * 		"ecBlockHeight":94248,
 * 		"deadline":60,
 * 		"transaction":
 * 		"13429959917323487313",
 * 		"timestamp":35517114,
 * 		"height":2147483647
 * 		},
 * 	"broadcasted":true,
 * 	"requestProcessingTime":18,
 * 	"transactionBytes":"0010baf21d023c00847cb0368575f90ff2b6a9e10a20b3231a6249eba04a70ff601acce5ffc64652966ea13ebf7b1aec00e1f5050000000000e1f50500000000000000000000000000000000000000000000000000000000000000000000000073b70f5c57e491d14363c5129ff275178ebebd2a46766d00cea0b70c995ef8095d05935fcac7d91190a9f864c3defd6306a3029bbe055d35ae5d06d393cbd1890000000028700100a3af453228d0c838",
 * 	"fullHash":"5108cdcb63cd60bab0e3a00e30de9ecc95d8d9d4a09c667b3d451f1d905a3352",
 * 	"transaction":"13429959917323487313"
 * }
 * </pre></blockquote>
 */

public final class SendMoney extends CreateTransaction {

    static final SendMoney instance = new SendMoney();

    private SendMoney() {
        super(new APITag[] {APITag.ACCOUNTS, APITag.CREATE_TRANSACTION}, "recipient", "amountNQT");
    }

    @Override
    JSONStreamAware processRequest(HttpServletRequest req) throws NxtException {
        long recipient = ParameterParser.getAccountId(req, "recipient", true);
        long amountNQT = ParameterParser.getAmountNQT(req);
        Account account = ParameterParser.getSenderAccount(req);
        return createTransaction(req, account, recipient, amountNQT);
    }

}
