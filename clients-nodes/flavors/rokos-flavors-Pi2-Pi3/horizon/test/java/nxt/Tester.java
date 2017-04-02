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

package nxt;

import nxt.crypto.Crypto;
import nxt.db.DbIterator;
import nxt.util.Convert;

import java.util.HashMap;
import java.util.Map;

@SuppressWarnings("unused")
public class Tester {
    private final String secretPhrase;
    private final byte[] privateKey;
    private final byte[] publicKey;
    private final String publicKeyStr;
    private final long id;
    private final String strId;
    private final String rsAccount;
    private final long initialBalance;
    private final long initialUnconfirmedBalance;
    private final long initialEffectiveBalance;
    private final Map<Long, Long> initialAssetQuantity = new HashMap<>();
    private final Map<Long, Long> initialUnconfirmedAssetQuantity = new HashMap<>();
    private final Map<Long, Long> initialCurrencyUnits = new HashMap<>();
    private final Map<Long, Long> initialUnconfirmedCurrencyUnits = new HashMap<>();

    Tester(String secretPhrase) {
        this.secretPhrase = secretPhrase;
        this.privateKey = Crypto.getPrivateKey(secretPhrase);
        this.publicKey = Crypto.getPublicKey(secretPhrase);
        this.publicKeyStr = Convert.toHexString(publicKey);
        this.id = Account.getId(publicKey);
        this.strId = Long.toUnsignedString(id);
        this.rsAccount = Convert.rsAccount(id);
        Account account = Account.getAccount(publicKey);
        if (account != null) {
            this.initialBalance = account.getBalanceNQT();
            this.initialUnconfirmedBalance = account.getUnconfirmedBalanceNQT();
            this.initialEffectiveBalance = account.getEffectiveBalanceNXT();
            DbIterator<Account.AccountAsset> assets = account.getAssets(0, -1);
            for (Account.AccountAsset accountAsset : assets) {
                initialAssetQuantity.put(accountAsset.getAssetId(), accountAsset.getQuantityQNT());
                initialUnconfirmedAssetQuantity.put(accountAsset.getAssetId(), accountAsset.getUnconfirmedQuantityQNT());
            }
            DbIterator<Account.AccountCurrency> currencies = account.getCurrencies(0, -1);
            for (Account.AccountCurrency accountCurrency : currencies) {
                initialCurrencyUnits.put(accountCurrency.getCurrencyId(), accountCurrency.getUnits());
                initialUnconfirmedCurrencyUnits.put(accountCurrency.getCurrencyId(), accountCurrency.getUnconfirmedUnits());
            }
        } else {
            initialBalance = 0;
            initialUnconfirmedBalance = 0;
            initialEffectiveBalance = 0;
        }
    }

    public String getSecretPhrase() {
        return secretPhrase;
    }

    public byte[] getPrivateKey() {
        return privateKey;
    }

    public byte[] getPublicKey() {
        return publicKey;
    }

    public String getPublicKeyStr() {
        return publicKeyStr;
    }

    public Account getAccount() {
        return Account.getAccount(publicKey);
    }

    public long getId() {
        return id;
    }

    public String getStrId() {
        return strId;
    }

    public String getRsAccount() {
        return rsAccount;
    }

    public long getBalanceDiff() {
        return Account.getAccount(id).getBalanceNQT() - initialBalance;
    }

    public long getUnconfirmedBalanceDiff() {
        return Account.getAccount(id).getUnconfirmedBalanceNQT() - initialUnconfirmedBalance;
    }

    public long getInitialBalance() {
        return initialBalance;
    }

    public long getBalance() {
        return getAccount().getBalanceNQT();
    }

    public long getInitialUnconfirmedBalance() {
        return initialUnconfirmedBalance;
    }

    public long getInitialEffectiveBalance() {
        return initialEffectiveBalance;
    }

    public long getInitialAssetQuantity(long assetId) {
        return initialAssetQuantity.get(assetId);
    }

    public long getInitialUnconfirmedAssetQuantity(long assetId) {
        return initialUnconfirmedAssetQuantity.get(assetId);
    }

    public long getInitialCurrencyUnits(long currencyId) {
        return initialCurrencyUnits.get(currencyId);
    }

    public long getCurrencyUnits(long currencyId) {
        return getAccount().getCurrencyUnits(currencyId);
    }

    public long getInitialUnconfirmedCurrencyUnits(long currencyId) {
        return initialUnconfirmedCurrencyUnits.get(currencyId);
    }
}