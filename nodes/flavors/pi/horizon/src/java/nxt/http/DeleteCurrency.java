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
import nxt.Currency;
import nxt.NxtException;
import org.json.simple.JSONStreamAware;

import javax.servlet.http.HttpServletRequest;

public final class DeleteCurrency extends CreateTransaction {

    static final DeleteCurrency instance = new DeleteCurrency();

    private DeleteCurrency() {
        super(new APITag[] {APITag.MS, APITag.CREATE_TRANSACTION}, "currency");
    }

    @Override
    JSONStreamAware processRequest(HttpServletRequest req) throws NxtException {
        Currency currency = ParameterParser.getCurrency(req);
        Account account = ParameterParser.getSenderAccount(req);
        if (!currency.canBeDeletedBy(account.getId())) {
            return JSONResponses.CANNOT_DELETE_CURRENCY;
        }
        Attachment attachment = new Attachment.MonetarySystemCurrencyDeletion(currency.getId());
        return createTransaction(req, account, attachment);
    }
}
