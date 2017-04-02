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

import nxt.db.DbVersion;

class NxtDbVersion extends DbVersion {

    protected void update(int nextUpdate) {
        switch (nextUpdate) {
            case 1:
                apply("CREATE TABLE IF NOT EXISTS block (db_id IDENTITY, id BIGINT NOT NULL, version INT NOT NULL, "
                        + "timestamp INT NOT NULL, previous_block_id BIGINT, "
                        + "FOREIGN KEY (previous_block_id) REFERENCES block (id) ON DELETE CASCADE, total_amount INT NOT NULL, "
                        + "total_fee INT NOT NULL, payload_length INT NOT NULL, generator_public_key BINARY(32) NOT NULL, "
                        + "previous_block_hash BINARY(32), cumulative_difficulty VARBINARY NOT NULL, base_target BIGINT NOT NULL, "
                        + "next_block_id BIGINT, FOREIGN KEY (next_block_id) REFERENCES block (id) ON DELETE SET NULL, "
                        + "index INT NOT NULL, height INT NOT NULL, generation_signature BINARY(64) NOT NULL, "
                        + "block_signature BINARY(64) NOT NULL, payload_hash BINARY(32) NOT NULL, generator_account_id BIGINT NOT NULL)");
            case 2:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS block_id_idx ON block (id)");
            case 3:
                apply("CREATE TABLE IF NOT EXISTS transaction (db_id IDENTITY, id BIGINT NOT NULL, "
                        + "deadline SMALLINT NOT NULL, sender_public_key BINARY(32) NOT NULL, recipient_id BIGINT NOT NULL, "
                        + "amount INT NOT NULL, fee INT NOT NULL, referenced_transaction_id BIGINT, index INT NOT NULL, "
                        + "height INT NOT NULL, block_id BIGINT NOT NULL, FOREIGN KEY (block_id) REFERENCES block (id) ON DELETE CASCADE, "
                        + "signature BINARY(64) NOT NULL, timestamp INT NOT NULL, type TINYINT NOT NULL, subtype TINYINT NOT NULL, "
                        + "sender_account_id BIGINT NOT NULL, attachment OTHER)");
            case 4:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS transaction_id_idx ON transaction (id)");
            case 5:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS block_height_idx ON block (height)");
            case 6:
                apply("CREATE INDEX IF NOT EXISTS transaction_timestamp_idx ON transaction (timestamp)");
            case 7:
                apply("CREATE INDEX IF NOT EXISTS block_generator_account_id_idx ON block (generator_account_id)");
            case 8:
                apply("CREATE INDEX IF NOT EXISTS transaction_sender_account_id_idx ON transaction (sender_account_id)");
            case 9:
                apply("CREATE INDEX IF NOT EXISTS transaction_recipient_id_idx ON transaction (recipient_id)");
            case 10:
                apply("ALTER TABLE block ALTER COLUMN generator_account_id RENAME TO generator_id");
            case 11:
                apply("ALTER TABLE transaction ALTER COLUMN sender_account_id RENAME TO sender_id");
            case 12:
                apply("ALTER INDEX block_generator_account_id_idx RENAME TO block_generator_id_idx");
            case 13:
                apply("ALTER INDEX transaction_sender_account_id_idx RENAME TO transaction_sender_id_idx");
            case 14:
                apply("ALTER TABLE block DROP COLUMN IF EXISTS index");
            case 15:
                apply("ALTER TABLE transaction DROP COLUMN IF EXISTS index");
            case 16:
                apply("ALTER TABLE transaction ADD COLUMN IF NOT EXISTS block_timestamp INT");
            case 17:
                apply(null);
            case 18:
                apply("ALTER TABLE transaction ALTER COLUMN block_timestamp SET NOT NULL");
            case 19:
                apply("ALTER TABLE transaction ADD COLUMN IF NOT EXISTS hash BINARY(32)");
            case 20:
                apply(null);
            case 21:
                apply(null);
            case 22:
                apply("CREATE INDEX IF NOT EXISTS transaction_hash_idx ON transaction (hash)");
            case 23:
                apply(null);
            case 24:
                apply("ALTER TABLE block ALTER COLUMN total_amount BIGINT");
            case 25:
                apply("ALTER TABLE block ALTER COLUMN total_fee BIGINT");
            case 26:
                apply("ALTER TABLE transaction ALTER COLUMN amount BIGINT");
            case 27:
                apply("ALTER TABLE transaction ALTER COLUMN fee BIGINT");
            case 28:
                apply(null);
            case 29:
                apply(null);
            case 30:
                apply(null);
            case 31:
                apply(null);
            case 32:
                apply(null);
            case 33:
                apply(null);
            case 34:
                apply(null);
            case 35:
                apply(null);
            case 36:
                apply("CREATE TABLE IF NOT EXISTS peer (address VARCHAR PRIMARY KEY)");
            case 37:
                apply(null);
            case 38:
                apply("ALTER TABLE transaction ADD COLUMN IF NOT EXISTS full_hash BINARY(32)");
            case 39:
                apply("ALTER TABLE transaction ADD COLUMN IF NOT EXISTS referenced_transaction_full_hash BINARY(32)");
            case 40:
                apply(null);
            case 41:
                apply("ALTER TABLE transaction ALTER COLUMN full_hash SET NOT NULL");
            case 42:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS transaction_full_hash_idx ON transaction (full_hash)");
            case 43:
                apply(null);
            case 44:
                apply(null);
            case 45:
                apply(null);
            case 46:
                apply("ALTER TABLE transaction ADD COLUMN IF NOT EXISTS attachment_bytes VARBINARY");
            case 47:
                apply(null);
            case 48:
                apply("ALTER TABLE transaction DROP COLUMN attachment");
            case 49:
                apply(null);
            case 50:
                apply("ALTER TABLE transaction DROP COLUMN referenced_transaction_id");
            case 51:
                apply("ALTER TABLE transaction DROP COLUMN hash");
            case 52:
                BlockDb.deleteAll(); //3.2 forks
            case 53:
                apply("DROP INDEX transaction_recipient_id_idx");
            case 54:
                apply("ALTER TABLE transaction ALTER COLUMN recipient_id SET NULL");
            case 55: 	
            	apply(null);
            case 56:
                apply("CREATE INDEX IF NOT EXISTS transaction_recipient_id_idx ON transaction (recipient_id)");
            case 57:
                apply(null);
            case 58:
                apply(null);
            case 59:
                apply("ALTER TABLE transaction ADD COLUMN IF NOT EXISTS version TINYINT");
            case 60:
                apply("UPDATE transaction SET version = 0");
            case 61:
                apply("ALTER TABLE transaction ALTER COLUMN version SET NOT NULL");
            case 62:
                apply("ALTER TABLE transaction ADD COLUMN IF NOT EXISTS has_message BOOLEAN NOT NULL DEFAULT FALSE");
            case 63:
                apply("ALTER TABLE transaction ADD COLUMN IF NOT EXISTS has_encrypted_message BOOLEAN NOT NULL DEFAULT FALSE");
            case 64:
                apply("UPDATE transaction SET has_message = TRUE WHERE type = 1 AND subtype = 0");
            case 65:
                apply("ALTER TABLE transaction ADD COLUMN IF NOT EXISTS has_public_key_announcement BOOLEAN NOT NULL DEFAULT FALSE");
            case 66:
                apply("ALTER TABLE transaction ADD COLUMN IF NOT EXISTS ec_block_height INT DEFAULT NULL");
            case 67:
                apply("ALTER TABLE transaction ADD COLUMN IF NOT EXISTS ec_block_id BIGINT DEFAULT NULL");
            case 68:
                apply("ALTER TABLE transaction ADD COLUMN IF NOT EXISTS has_encrypttoself_message BOOLEAN NOT NULL DEFAULT FALSE");
            case 69:
                apply("CREATE INDEX IF NOT EXISTS transaction_block_timestamp_idx ON transaction (block_timestamp DESC)");
            case 70:
                apply("DROP INDEX transaction_timestamp_idx");
            case 71:
            	apply(null);
            case 72:
            	BlockDb.deleteAll(); // 3.9 forks
            	applyWithoutVersionUpdate("CREATE TABLE IF NOT EXISTS alias (db_id IDENTITY, id BIGINT NOT NULL, "
                        		+ "account_id BIGINT NOT NULL, alias_name VARCHAR NOT NULL, "
                        		+ "alias_name_lower VARCHAR AS LOWER (alias_name) NOT NULL, "
                        		+ "alias_uri VARCHAR NOT NULL, timestamp INT NOT NULL, "
                        		+ "height INT NOT NULL, latest BOOLEAN NOT NULL DEFAULT TRUE)");            	
                apply("CREATE UNIQUE INDEX IF NOT EXISTS alias_id_height_idx ON alias (id, height DESC)");
            case 73:
                apply("CREATE INDEX IF NOT EXISTS alias_account_id_idx ON alias (account_id, height DESC)");
            case 74:
                apply("CREATE INDEX IF NOT EXISTS alias_name_lower_idx ON alias (alias_name_lower)");
            case 75:
                apply("CREATE TABLE IF NOT EXISTS alias_offer (db_id IDENTITY, id BIGINT NOT NULL, "
                        + "price BIGINT NOT NULL, buyer_id BIGINT, "
                        + "height INT NOT NULL, latest BOOLEAN DEFAULT TRUE NOT NULL)");
            case 76:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS alias_offer_id_height_idx ON alias_offer (id, height DESC)");
            case 77:
                apply("CREATE TABLE IF NOT EXISTS asset (db_id IDENTITY, id BIGINT NOT NULL, account_id BIGINT NOT NULL, "
                        + "name VARCHAR NOT NULL, description VARCHAR, quantity BIGINT NOT NULL, decimals TINYINT NOT NULL, "
                        + "height INT NOT NULL)");
            case 78:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS asset_id_idx ON asset (id)");
            case 79:
                apply("CREATE INDEX IF NOT EXISTS asset_account_id_idx ON asset (account_id)");
            case 80:
                apply("CREATE TABLE IF NOT EXISTS trade (db_id IDENTITY, asset_id BIGINT NOT NULL, block_id BIGINT NOT NULL, "
                        + "ask_order_id BIGINT NOT NULL, bid_order_id BIGINT NOT NULL, ask_order_height INT NOT NULL, "
                        + "bid_order_height INT NOT NULL, seller_id BIGINT NOT NULL, buyer_id BIGINT NOT NULL, "
                        + "quantity BIGINT NOT NULL, price BIGINT NOT NULL, timestamp INT NOT NULL, height INT NOT NULL)");
            case 81:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS trade_ask_bid_idx ON trade (ask_order_id, bid_order_id)");
            case 82:
                apply("CREATE INDEX IF NOT EXISTS trade_asset_id_idx ON trade (asset_id, height DESC)");
            case 83:
                apply("CREATE INDEX IF NOT EXISTS trade_seller_id_idx ON trade (seller_id, height DESC)");
            case 84:
                apply("CREATE INDEX IF NOT EXISTS trade_buyer_id_idx ON trade (buyer_id, height DESC)");
            case 85:
                apply("CREATE TABLE IF NOT EXISTS ask_order (db_id IDENTITY, id BIGINT NOT NULL, account_id BIGINT NOT NULL, "
                        + "asset_id BIGINT NOT NULL, price BIGINT NOT NULL, "
                        + "quantity BIGINT NOT NULL, creation_height INT NOT NULL, height INT NOT NULL, "
                        + "latest BOOLEAN NOT NULL DEFAULT TRUE)");
            case 86:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS ask_order_id_height_idx ON ask_order (id, height DESC)");
            case 87:
                apply("CREATE INDEX IF NOT EXISTS ask_order_account_id_idx ON ask_order (account_id, height DESC)");
            case 88:
                apply("CREATE INDEX IF NOT EXISTS ask_order_asset_id_price_idx ON ask_order (asset_id, price)");
            case 89:
                apply("CREATE TABLE IF NOT EXISTS bid_order (db_id IDENTITY, id BIGINT NOT NULL, account_id BIGINT NOT NULL, "
                        + "asset_id BIGINT NOT NULL, price BIGINT NOT NULL, "
                        + "quantity BIGINT NOT NULL, creation_height INT NOT NULL, height INT NOT NULL, "
                        + "latest BOOLEAN NOT NULL DEFAULT TRUE)");
            case 90:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS bid_order_id_height_idx ON bid_order (id, height DESC)");
            case 91:
                apply("CREATE INDEX IF NOT EXISTS bid_order_account_id_idx ON bid_order (account_id, height DESC)");
            case 92:
                apply("CREATE INDEX IF NOT EXISTS bid_order_asset_id_price_idx ON bid_order (asset_id, price DESC)");
            case 93:
                apply("CREATE TABLE IF NOT EXISTS goods (db_id IDENTITY, id BIGINT NOT NULL, seller_id BIGINT NOT NULL, "
                        + "name VARCHAR NOT NULL, description VARCHAR, "
                        + "tags VARCHAR, timestamp INT NOT NULL, quantity INT NOT NULL, price BIGINT NOT NULL, "
                        + "delisted BOOLEAN NOT NULL, height INT NOT NULL, latest BOOLEAN NOT NULL DEFAULT TRUE)");
            case 94:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS goods_id_height_idx ON goods (id, height DESC)");
            case 95:
                apply("CREATE INDEX IF NOT EXISTS goods_seller_id_name_idx ON goods (seller_id, name)");
            case 96:
                apply("CREATE INDEX IF NOT EXISTS goods_timestamp_idx ON goods (timestamp DESC, height DESC)");
            case 97:
                apply("CREATE TABLE IF NOT EXISTS purchase (db_id IDENTITY, id BIGINT NOT NULL, buyer_id BIGINT NOT NULL, "
                        + "goods_id BIGINT NOT NULL, "
                        + "seller_id BIGINT NOT NULL, quantity INT NOT NULL, "
                        + "price BIGINT NOT NULL, deadline INT NOT NULL, note VARBINARY, nonce BINARY(32), "
                        + "timestamp INT NOT NULL, pending BOOLEAN NOT NULL, goods VARBINARY, goods_nonce BINARY(32), "
                        + "refund_note VARBINARY, refund_nonce BINARY(32), has_feedback_notes BOOLEAN NOT NULL DEFAULT FALSE, "
                        + "has_public_feedbacks BOOLEAN NOT NULL DEFAULT FALSE, discount BIGINT NOT NULL, refund BIGINT NOT NULL, "
                        + "height INT NOT NULL, latest BOOLEAN NOT NULL DEFAULT TRUE)");
            case 98:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS purchase_id_height_idx ON purchase (id, height DESC)");
            case 99:
                apply("CREATE INDEX IF NOT EXISTS purchase_buyer_id_height_idx ON purchase (buyer_id, height DESC)");
            case 100:
                apply("CREATE INDEX IF NOT EXISTS purchase_seller_id_height_idx ON purchase (seller_id, height DESC)");
            case 101:
                apply("CREATE INDEX IF NOT EXISTS purchase_deadline_idx ON purchase (deadline DESC, height DESC)");
            case 102:
                apply("CREATE TABLE IF NOT EXISTS account (db_id IDENTITY, id BIGINT NOT NULL, creation_height INT NOT NULL, "
                        + "public_key BINARY(32), key_height INT, balance BIGINT NOT NULL, unconfirmed_balance BIGINT NOT NULL, "
                        + "forged_balance BIGINT NOT NULL, name VARCHAR, description VARCHAR, current_leasing_height_from INT, "
                        + "current_leasing_height_to INT, current_lessee_id BIGINT NULL, next_leasing_height_from INT, "
                        + "next_leasing_height_to INT, next_lessee_id BIGINT NULL, height INT NOT NULL, "
                        + "latest BOOLEAN NOT NULL DEFAULT TRUE)");
            case 103:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS account_id_height_idx ON account (id, height DESC)");
            case 104:
                apply("CREATE INDEX IF NOT EXISTS account_current_lessee_id_leasing_height_idx ON account (current_lessee_id, "
                        + "current_leasing_height_to DESC)");
            case 105:
                apply("CREATE TABLE IF NOT EXISTS account_asset (db_id IDENTITY, account_id BIGINT NOT NULL, "
                        + "asset_id BIGINT NOT NULL, quantity BIGINT NOT NULL, unconfirmed_quantity BIGINT NOT NULL, height INT NOT NULL, "
                        + "latest BOOLEAN NOT NULL DEFAULT TRUE)");
            case 106:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS account_asset_id_height_idx ON account_asset (account_id, asset_id, height DESC)");
            case 107:
                apply("CREATE TABLE IF NOT EXISTS account_guaranteed_balance (db_id IDENTITY, account_id BIGINT NOT NULL, "
                        + "additions BIGINT NOT NULL, height INT NOT NULL)");
            case 108:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS account_guaranteed_balance_id_height_idx ON account_guaranteed_balance "
                        + "(account_id, height DESC)");
            case 109:
                apply("CREATE TABLE IF NOT EXISTS purchase_feedback (db_id IDENTITY, id BIGINT NOT NULL, feedback_data VARBINARY NOT NULL, "
                        + "feedback_nonce BINARY(32) NOT NULL, height INT NOT NULL, latest BOOLEAN NOT NULL DEFAULT TRUE)");
            case 110:
                apply("CREATE INDEX IF NOT EXISTS purchase_feedback_id_height_idx ON purchase_feedback (id, height DESC)");
            case 111:
                apply("CREATE TABLE IF NOT EXISTS purchase_public_feedback (db_id IDENTITY, id BIGINT NOT NULL, public_feedback "
                        + "VARCHAR NOT NULL, height INT NOT NULL, latest BOOLEAN NOT NULL DEFAULT TRUE)");
            case 112:
                apply("CREATE INDEX IF NOT EXISTS purchase_public_feedback_id_height_idx ON purchase_public_feedback (id, height DESC)");
            case 113:
                apply("CREATE TABLE IF NOT EXISTS unconfirmed_transaction (db_id IDENTITY, id BIGINT NOT NULL, expiration INT NOT NULL, "
                        + "transaction_height INT NOT NULL, fee_per_byte BIGINT NOT NULL, timestamp INT NOT NULL, "
                        + "transaction_bytes VARBINARY NOT NULL, height INT NOT NULL)");
            case 114:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS unconfirmed_transaction_id_idx ON unconfirmed_transaction (id)");
            case 115:
                apply("CREATE INDEX IF NOT EXISTS unconfirmed_transaction_height_fee_timestamp_idx ON unconfirmed_transaction "
                        + "(transaction_height ASC, fee_per_byte DESC, timestamp ASC)");
            case 116:
                apply("CREATE TABLE IF NOT EXISTS asset_transfer (db_id IDENTITY, id BIGINT NOT NULL, asset_id BIGINT NOT NULL, "
                        + "sender_id BIGINT NOT NULL, recipient_id BIGINT NOT NULL, quantity BIGINT NOT NULL, timestamp INT NOT NULL, "
                        + "height INT NOT NULL)");
            case 117:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS asset_transfer_id_idx ON asset_transfer (id)");
            case 118:
                apply("CREATE INDEX IF NOT EXISTS asset_transfer_asset_id_idx ON asset_transfer (asset_id, height DESC)");
            case 119:
                apply("CREATE INDEX IF NOT EXISTS asset_transfer_sender_id_idx ON asset_transfer (sender_id, height DESC)");
            case 120:
                apply("CREATE INDEX IF NOT EXISTS asset_transfer_recipient_id_idx ON asset_transfer (recipient_id, height DESC)");
            case 121:
                apply(null);
            case 122:
                apply("CREATE INDEX IF NOT EXISTS account_asset_quantity_idx ON account_asset (quantity DESC)");
            case 123:
                apply("CREATE INDEX IF NOT EXISTS purchase_timestamp_idx ON purchase (timestamp DESC, id)");
            case 124:
                apply("CREATE INDEX IF NOT EXISTS ask_order_creation_idx ON ask_order (creation_height DESC)");
            case 125:
                apply("CREATE INDEX IF NOT EXISTS bid_order_creation_idx ON bid_order (creation_height DESC)");
            case 126:
                apply(null);
            case 127:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS block_timestamp_idx ON block (timestamp DESC)");
            case 128:
                apply(null);
            case 129:
                apply("ALTER TABLE goods ADD COLUMN IF NOT EXISTS parsed_tags ARRAY");
            case 130:
                apply("CREATE ALIAS IF NOT EXISTS FTL_INIT FOR \"org.h2.fulltext.FullTextLucene.init\"");
            case 131:
                apply("CALL FTL_INIT()");
            case 132:
                apply(null);
            case 133:
                apply(null);
            case 134:
                apply("CREATE TABLE IF NOT EXISTS tag (db_id IDENTITY, tag VARCHAR NOT NULL, in_stock_count INT NOT NULL, "
                        + "total_count INT NOT NULL, height INT NOT NULL, latest BOOLEAN NOT NULL DEFAULT TRUE)");
            case 135:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS tag_tag_idx ON tag (tag, height DESC)");
            case 136:
                apply("CREATE INDEX IF NOT EXISTS tag_in_stock_count_idx ON tag (in_stock_count DESC, height DESC)");
            case 137:
                apply(null);
            case 138:
                apply("CREATE TABLE IF NOT EXISTS currency (db_id IDENTITY, id BIGINT NOT NULL, account_id BIGINT NOT NULL, "
                        + "name VARCHAR NOT NULL, name_lower VARCHAR AS LOWER (name) NOT NULL, code VARCHAR NOT NULL, "
                        + "description VARCHAR, type INT NOT NULL, initial_supply BIGINT NOT NULL DEFAULT 0, current_supply BIGINT NOT NULL, "
                        + "reserve_supply BIGINT NOT NULL, max_supply BIGINT NOT NULL, creation_height INT NOT NULL, issuance_height INT NOT NULL, "
                        + "min_reserve_per_unit_nqt BIGINT NOT NULL, min_difficulty TINYINT NOT NULL, "
                        + "max_difficulty TINYINT NOT NULL, ruleset TINYINT NOT NULL, algorithm TINYINT NOT NULL, "
                        + "current_reserve_per_unit_nqt BIGINT NOT NULL, decimals TINYINT NOT NULL DEFAULT 0,"
                        + "height INT NOT NULL, latest BOOLEAN NOT NULL DEFAULT TRUE)");
            case 139:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS currency_id_height_idx ON currency (id, height DESC)");
            case 140:
                apply("CREATE INDEX IF NOT EXISTS currency_account_id_idx ON currency (account_id)");
            case 141:
                apply("CREATE TABLE IF NOT EXISTS account_currency (db_id IDENTITY, account_id BIGINT NOT NULL, "
                        + "currency_id BIGINT NOT NULL, units BIGINT NOT NULL, unconfirmed_units BIGINT NOT NULL, height INT NOT NULL, "
                        + "latest BOOLEAN NOT NULL DEFAULT TRUE)");
            case 142:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS account_currency_id_height_idx ON account_currency (account_id, currency_id, height DESC)");
            case 143:
                apply("CREATE TABLE IF NOT EXISTS currency_founder (db_id IDENTITY, currency_id BIGINT NOT NULL, "
                        + "account_id BIGINT NOT NULL, amount BIGINT NOT NULL, "
                        + "height INT NOT NULL, latest BOOLEAN NOT NULL DEFAULT TRUE)");
            case 144:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS currency_founder_currency_id_idx ON currency_founder (currency_id, account_id, height DESC)");
            case 145:
                apply("CREATE TABLE IF NOT EXISTS currency_mint (db_id IDENTITY, currency_id BIGINT NOT NULL, account_id BIGINT NOT NULL, "
                        + "counter BIGINT NOT NULL, height INT NOT NULL, latest BOOLEAN NOT NULL DEFAULT TRUE)");
            case 146:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS currency_mint_currency_id_account_id_idx ON currency_mint (currency_id, account_id, height DESC)");
            case 147:
                apply("CREATE TABLE IF NOT EXISTS buy_offer (db_id IDENTITY, id BIGINT NOT NULL, currency_id BIGINT NOT NULL, account_id BIGINT NOT NULL,"
                        + "rate BIGINT NOT NULL, unit_limit BIGINT NOT NULL, supply BIGINT NOT NULL, expiration_height INT NOT NULL,"
                        + "creation_height INT NOT NULL, transaction_index SMALLINT NOT NULL, height INT NOT NULL, latest BOOLEAN NOT NULL DEFAULT TRUE)");
            case 148:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS buy_offer_id_idx ON buy_offer (id, height DESC)");
            case 149:
                apply("CREATE INDEX IF NOT EXISTS buy_offer_currency_id_account_id_idx ON buy_offer (currency_id, account_id, height DESC)");
            case 150:
                apply("CREATE TABLE IF NOT EXISTS sell_offer (db_id IDENTITY, id BIGINT NOT NULL, currency_id BIGINT NOT NULL, account_id BIGINT NOT NULL, "
                        + "rate BIGINT NOT NULL, unit_limit BIGINT NOT NULL, supply BIGINT NOT NULL, expiration_height INT NOT NULL, "
                        + "creation_height INT NOT NULL, transaction_index SMALLINT NOT NULL, height INT NOT NULL, latest BOOLEAN NOT NULL DEFAULT TRUE)");
            case 151:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS sell_offer_id_idx ON sell_offer (id, height DESC)");
            case 152:
                apply("CREATE INDEX IF NOT EXISTS sell_offer_currency_id_account_id_idx ON sell_offer (currency_id, account_id, height DESC)");
            case 153:
                apply("CREATE TABLE IF NOT EXISTS exchange (db_id IDENTITY, transaction_id BIGINT NOT NULL, currency_id BIGINT NOT NULL, block_id BIGINT NOT NULL, "
                        + "offer_id BIGINT NOT NULL, seller_id BIGINT NOT NULL, "
                        + "buyer_id BIGINT NOT NULL, units BIGINT NOT NULL, "
                        + "rate BIGINT NOT NULL, timestamp INT NOT NULL, height INT NOT NULL)");
            case 154:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS exchange_offer_idx ON exchange (transaction_id, offer_id)");
            case 155:
                apply("CREATE INDEX IF NOT EXISTS exchange_currency_id_idx ON exchange (currency_id, height DESC)");
            case 156:
                apply("CREATE INDEX IF NOT EXISTS exchange_seller_id_idx ON exchange (seller_id, height DESC)");
            case 157:
                apply("CREATE INDEX IF NOT EXISTS exchange_buyer_id_idx ON exchange (buyer_id, height DESC)");
            case 158:
                apply("CREATE TABLE IF NOT EXISTS currency_transfer (db_id IDENTITY, id BIGINT NOT NULL, currency_id BIGINT NOT NULL, "
                        + "sender_id BIGINT NOT NULL, recipient_id BIGINT NOT NULL, units BIGINT NOT NULL, timestamp INT NOT NULL, "
                        + "height INT NOT NULL)");
            case 159:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS currency_transfer_id_idx ON currency_transfer (id)");
            case 160:
                apply("CREATE INDEX IF NOT EXISTS currency_transfer_currency_id_idx ON currency_transfer (currency_id, height DESC)");
            case 161:
                apply("CREATE INDEX IF NOT EXISTS currency_transfer_sender_id_idx ON currency_transfer (sender_id, height DESC)");
            case 162:
                apply("CREATE INDEX IF NOT EXISTS currency_transfer_recipient_id_idx ON currency_transfer (recipient_id, height DESC)");
            case 163:
                apply("CREATE INDEX IF NOT EXISTS account_currency_units_idx ON account_currency (units DESC)");
            case 164:
                apply("CREATE INDEX IF NOT EXISTS currency_name_idx ON currency (name_lower, height DESC)");
            case 165:
                apply("CREATE INDEX IF NOT EXISTS currency_code_idx ON currency (code, height DESC)");
            case 166:
                apply("CREATE INDEX IF NOT EXISTS buy_offer_rate_height_idx ON buy_offer (rate DESC, creation_height ASC)");
            case 167:
                apply("CREATE INDEX IF NOT EXISTS sell_offer_rate_height_idx ON sell_offer (rate ASC, creation_height ASC)");
            case 168:
                apply("ALTER TABLE account ADD COLUMN IF NOT EXISTS message_pattern_regex VARCHAR");
            case 169:
                apply("ALTER TABLE account ADD COLUMN IF NOT EXISTS message_pattern_flags INT");
            case 170:
                apply("DROP INDEX IF EXISTS unconfirmed_transaction_height_fee_timestamp_idx");
            case 171:
                apply("ALTER TABLE unconfirmed_transaction DROP COLUMN IF EXISTS timestamp");
            case 172:
                apply("ALTER TABLE unconfirmed_transaction ADD COLUMN IF NOT EXISTS arrival_timestamp BIGINT NOT NULL DEFAULT 0");
            case 173:
                apply("CREATE INDEX IF NOT EXISTS unconfirmed_transaction_height_fee_timestamp_idx ON unconfirmed_transaction "
                        + "(transaction_height ASC, fee_per_byte DESC, arrival_timestamp ASC)");
            case 174:
                apply(null);
            case 175:
                apply("ALTER TABLE transaction ADD COLUMN IF NOT EXISTS transaction_index SMALLINT NOT NULL");
            case 176:
                apply(null);    
            case 177:
                apply("TRUNCATE TABLE ask_order");
            case 178:
                apply("ALTER TABLE ask_order ADD COLUMN IF NOT EXISTS transaction_index SMALLINT NOT NULL");
            case 179:
                apply(null);
            case 180:
                apply("TRUNCATE TABLE bid_order");
            case 181:
                apply("ALTER TABLE bid_order ADD COLUMN IF NOT EXISTS transaction_index SMALLINT NOT NULL");
            case 182:
                apply(null);
            case 183:
                apply(null);
            case 184:
                apply("CREATE TABLE IF NOT EXISTS scan (rescan BOOLEAN NOT NULL DEFAULT FALSE, height INT NOT NULL DEFAULT 0, "
                        + "validate BOOLEAN NOT NULL DEFAULT FALSE)");
            case 185:
                apply("INSERT INTO scan (rescan, height, validate) VALUES (false, 0, false)");
            case 186:
                apply("CREATE INDEX IF NOT EXISTS currency_creation_height_idx ON currency (creation_height DESC)");
            case 187:
                apply(null);
            case 188:
                apply(null);
            case 189:
                apply(null);
            case 190:
                apply(null);
            case 191:                   
            	apply(null);                
            case 192:
                apply(null);
            case 193:
                apply("CREATE TABLE IF NOT EXISTS currency_supply (db_id IDENTITY, id BIGINT NOT NULL, "
                        + "current_supply BIGINT NOT NULL, current_reserve_per_unit_nqt BIGINT NOT NULL, height INT NOT NULL, "
                        + "latest BOOLEAN NOT NULL DEFAULT TRUE)");
            case 194:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS currency_supply_id_height_idx ON currency_supply (id, height DESC)");
            case 195:
                apply("TRUNCATE TABLE currency");
            case 196:
                apply("ALTER TABLE currency DROP COLUMN IF EXISTS current_supply");
            case 197:
                apply("ALTER TABLE currency DROP COLUMN IF EXISTS current_reserve_per_unit_nqt");
            case 198:
                 apply(null);
            case 199:
                apply(null);
            case 200:
                apply("CREATE TABLE IF NOT EXISTS public_key (db_id IDENTITY, account_id BIGINT NOT NULL, "
                        + "public_key BINARY(32), height INT NOT NULL, FOREIGN KEY (height) REFERENCES block (height) ON DELETE CASCADE)");
            case 201:
                apply("INSERT INTO public_key (account_id, public_key, height) SELECT id, public_key, min(height) "
                        + "FROM account WHERE public_key IS NOT NULL GROUP BY id");
            case 202:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS public_key_account_id_idx ON public_key (account_id)");
            case 203:            	
                apply("ALTER TABLE account DROP COLUMN IF EXISTS public_key");
            case 204:            	
                apply("ALTER TABLE block DROP COLUMN IF EXISTS generator_public_key");
            case 205:            	
                apply("ALTER TABLE transaction DROP COLUMN IF EXISTS sender_public_key");
            case 206:
                apply("CREATE INDEX IF NOT EXISTS account_height_idx ON account(height)");
            case 207:
                apply("CREATE INDEX IF NOT EXISTS account_asset_height_idx ON account_asset(height)");
            case 208:
                apply("CREATE INDEX IF NOT EXISTS account_currency_height_idx ON account_currency(height)");
            case 209:
                apply("CREATE INDEX IF NOT EXISTS account_guaranteed_balance_height_idx ON account_guaranteed_balance(height)");
            case 210:
                apply("CREATE INDEX IF NOT EXISTS alias_height_idx ON alias(height)");
            case 211:
                apply("CREATE INDEX IF NOT EXISTS alias_offer_height_idx ON alias_offer(height)");
            case 212:
                apply("CREATE INDEX IF NOT EXISTS ask_order_height_idx ON ask_order(height)");
            case 213:
                apply("CREATE INDEX IF NOT EXISTS asset_height_idx ON asset(height)");
            case 214:
                apply("CREATE INDEX IF NOT EXISTS asset_transfer_height_idx ON asset_transfer(height)");
            case 215:
                apply("CREATE INDEX IF NOT EXISTS bid_order_height_idx ON bid_order(height)");
            case 216:
                apply("CREATE INDEX IF NOT EXISTS buy_offer_height_idx ON buy_offer(height)");
            case 217:
                apply("CREATE INDEX IF NOT EXISTS currency_height_idx ON currency(height)");
            case 218:
                apply("CREATE INDEX IF NOT EXISTS currency_founder_height_idx ON currency_founder(height)");
            case 219:
                apply("CREATE INDEX IF NOT EXISTS currency_mint_height_idx ON currency_mint(height)");
            case 220:
                apply("CREATE INDEX IF NOT EXISTS currency_supply_height_idx ON currency_supply(height)");
            case 221:
                apply("CREATE INDEX IF NOT EXISTS currency_transfer_height_idx ON currency_transfer(height)");
            case 222:
                apply("CREATE INDEX IF NOT EXISTS exchange_height_idx ON exchange(height)");
            case 223:
                apply("CREATE INDEX IF NOT EXISTS goods_height_idx ON goods(height)");
            case 224:
                apply("CREATE INDEX IF NOT EXISTS public_key_height_idx ON public_key(height)");
            case 225:
                apply("CREATE INDEX IF NOT EXISTS purchase_height_idx ON purchase(height)");
            case 226:
                apply("CREATE INDEX IF NOT EXISTS purchase_feedback_height_idx ON purchase_feedback(height)");
            case 227:
                apply("CREATE INDEX IF NOT EXISTS purchase_public_feedback_height_idx ON purchase_public_feedback(height)");
            case 228:
                apply("CREATE INDEX IF NOT EXISTS sell_offer_height_idx ON sell_offer(height)");
            case 229:
                apply("CREATE INDEX IF NOT EXISTS tag_height_idx ON tag(height)");
            case 230:
                apply("CREATE INDEX IF NOT EXISTS trade_height_idx ON trade(height)");
            case 231:
                apply("DROP TABLE IF EXISTS poll");
            case 232:
                apply("DROP TABLE IF EXISTS vote");
            case 233:
                apply("CREATE TABLE IF NOT EXISTS vote (db_id IDENTITY, id BIGINT NOT NULL, " +
                        "poll_id BIGINT NOT NULL, voter_id BIGINT NOT NULL, vote_bytes VARBINARY NOT NULL, height INT NOT NULL)");
            case 234:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS vote_id_idx ON vote (id)");
            case 235:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS vote_poll_id_idx ON vote (poll_id, voter_id)");
            case 236:
                apply("CREATE TABLE IF NOT EXISTS poll (db_id IDENTITY, id BIGINT NOT NULL, "
                        + "account_id BIGINT NOT NULL, name VARCHAR NOT NULL, "
                        + "description VARCHAR, options ARRAY NOT NULL, min_num_options TINYINT, max_num_options TINYINT, "
                        + "min_range_value TINYINT, max_range_value TINYINT, "
                        + "finish_height INT NOT NULL, voting_model TINYINT NOT NULL, min_balance BIGINT, "
                        + "min_balance_model TINYINT, holding_id BIGINT, height INT NOT NULL)");
            case 237:
                apply("CREATE TABLE IF NOT EXISTS poll_result (db_id IDENTITY, poll_id BIGINT NOT NULL, "
                        + "result BIGINT, weight BIGINT NOT NULL, height INT NOT NULL)");
            case 238:
                apply("ALTER TABLE transaction ADD COLUMN IF NOT EXISTS phased BOOLEAN NOT NULL DEFAULT FALSE");
            case 239:
                apply("CREATE TABLE IF NOT EXISTS phasing_poll (db_id IDENTITY, id BIGINT NOT NULL, "
                        + "account_id BIGINT NOT NULL, whitelist_size TINYINT NOT NULL DEFAULT 0, "
                        + "finish_height INT NOT NULL, voting_model TINYINT NOT NULL, quorum BIGINT, "
                        + "min_balance BIGINT, holding_id BIGINT, min_balance_model TINYINT, "
                        + "linked_full_hashes ARRAY, hashed_secret VARBINARY, algorithm TINYINT, height INT NOT NULL)");
            case 240:
                apply("CREATE TABLE IF NOT EXISTS phasing_vote (db_id IDENTITY, vote_id BIGINT NOT NULL, "
                        + "transaction_id BIGINT NOT NULL, voter_id BIGINT NOT NULL, "
                        + "height INT NOT NULL)");
            case 241:
                apply("CREATE TABLE IF NOT EXISTS phasing_poll_voter (db_id IDENTITY, "
                        + "transaction_id BIGINT NOT NULL, voter_id BIGINT NOT NULL, "
                        + "height INT NOT NULL)");
            case 242:
                apply("CREATE INDEX IF NOT EXISTS vote_height_idx ON vote(height)");
            case 243:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS poll_id_idx ON poll(id)");
            case 244:
                apply("CREATE INDEX IF NOT EXISTS poll_height_idx ON poll(height)");
            case 245:
                apply("CREATE INDEX IF NOT EXISTS poll_account_idx ON poll(account_id)");
            case 246:
                apply("CREATE INDEX IF NOT EXISTS poll_finish_height_idx ON poll(finish_height DESC)");
            case 247:
                apply("CREATE INDEX IF NOT EXISTS poll_result_poll_id_idx ON poll_result(poll_id)");
            case 248:
                apply("CREATE INDEX IF NOT EXISTS poll_result_height_idx ON poll_result(height)");
            case 249:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS phasing_poll_id_idx ON phasing_poll(id)");
            case 250:
                apply("CREATE INDEX IF NOT EXISTS phasing_poll_height_idx ON phasing_poll(height)");
            case 251:
                apply("CREATE INDEX IF NOT EXISTS phasing_poll_account_id_idx ON phasing_poll(account_id, height DESC)");
            case 252:
                apply("CREATE INDEX IF NOT EXISTS phasing_poll_holding_id_idx ON phasing_poll(holding_id, height DESC)");
            case 253:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS phasing_vote_transaction_voter_idx ON phasing_vote(transaction_id, voter_id)");
            case 254:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS phasing_poll_voter_transaction_voter_idx ON phasing_poll_voter(transaction_id, voter_id)");
            case 255:
                apply("CREATE TABLE IF NOT EXISTS phasing_poll_result (db_id IDENTITY, id BIGINT NOT NULL, "
                        + "result BIGINT NOT NULL, approved BOOLEAN NOT NULL, height INT NOT NULL)");
            case 256:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS phasing_poll_result_id_idx ON phasing_poll_result(id)");
            case 257:
                apply("CREATE INDEX IF NOT EXISTS phasing_poll_result_height_idx ON phasing_poll_result(height)");
            case 258:
                apply("CREATE INDEX IF NOT EXISTS currency_founder_account_id_idx ON currency_founder (account_id, height DESC)");
            case 259:
                apply("TRUNCATE TABLE trade");
            case 260:
                apply("ALTER TABLE trade ADD COLUMN IF NOT EXISTS is_buy BOOLEAN NOT NULL");
            case 261:
                apply("CREATE INDEX IF NOT EXISTS phasing_poll_voter_height_idx ON phasing_poll_voter(height)");
            case 262:
                apply("TRUNCATE TABLE ask_order");
            case 263:
                apply("ALTER TABLE ask_order ADD COLUMN IF NOT EXISTS transaction_height INT NOT NULL");
            case 264:
                apply("TRUNCATE TABLE bid_order");
            case 265:
                apply("ALTER TABLE bid_order ADD COLUMN IF NOT EXISTS transaction_height INT NOT NULL");
            case 266:
                apply("TRUNCATE TABLE buy_offer");
            case 267:
                apply("ALTER TABLE buy_offer ADD COLUMN IF NOT EXISTS transaction_height INT NOT NULL");
            case 268:
                apply("TRUNCATE TABLE sell_offer");
            case 269:
                apply("ALTER TABLE sell_offer ADD COLUMN IF NOT EXISTS transaction_height INT NOT NULL");
            case 270:
                apply("CREATE INDEX IF NOT EXISTS phasing_vote_height_idx ON phasing_vote(height)");
            case 271:
                apply("DROP INDEX IF EXISTS transaction_full_hash_idx");
            case 272:
                apply("DROP INDEX IF EXISTS trade_ask_bid_idx");
            case 273:
                apply("CREATE INDEX IF NOT EXISTS trade_ask_idx ON trade (ask_order_id, height DESC)");
            case 274:
                apply("CREATE INDEX IF NOT EXISTS trade_bid_idx ON trade (bid_order_id, height DESC)");
            case 275:
                apply("CREATE TABLE IF NOT EXISTS account_info (db_id IDENTITY, account_id BIGINT NOT NULL, "
                        + "name VARCHAR, description VARCHAR, height INT NOT NULL, latest BOOLEAN NOT NULL DEFAULT TRUE)");
            case 276:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS account_info_id_height_idx ON account_info (account_id, height DESC)");
            case 277:
                apply("CREATE INDEX IF NOT EXISTS account_info_height_idx ON account_info (height)");
            case 278:
                apply("ALTER TABLE account DROP COLUMN IF EXISTS name");
            case 279:
                apply("ALTER TABLE account DROP COLUMN IF EXISTS description");
            case 280:
                apply("ALTER TABLE account DROP COLUMN IF EXISTS message_pattern_regex");
            case 281:
                apply("ALTER TABLE account DROP COLUMN IF EXISTS message_pattern_flags");
            case 282:
                apply(null);
            case 283:
                apply("TRUNCATE TABLE poll");
            case 284:
                apply("ALTER TABLE poll ADD COLUMN IF NOT EXISTS timestamp INT NOT NULL");
            case 285:
                apply(null);
            case 286:
                apply("CREATE TABLE IF NOT EXISTS prunable_message (db_id IDENTITY, id BIGINT NOT NULL, sender_id BIGINT NOT NULL, "
                        + "recipient_id BIGINT, message VARBINARY NOT NULL, is_text BOOLEAN NOT NULL, is_compressed BOOLEAN NOT NULL, "
                        + "is_encrypted BOOLEAN NOT NULL, timestamp INT NOT NULL, expiration INT NOT NULL, height INT NOT NULL, "
                        + "FOREIGN KEY (height) REFERENCES block (height) ON DELETE CASCADE)");
            case 287:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS prunable_message_id_idx ON prunable_message (id)");
            case 288:
                apply("CREATE INDEX IF NOT EXISTS prunable_message_height_idx ON prunable_message (height)");
            case 289:
                apply("CREATE INDEX IF NOT EXISTS prunable_message_expiration_idx ON prunable_message (expiration DESC)");
            case 290:
                apply("ALTER TABLE transaction ADD COLUMN IF NOT EXISTS has_prunable_message BOOLEAN NOT NULL DEFAULT FALSE");
            case 291:
                apply("TRUNCATE TABLE unconfirmed_transaction");
            case 292:
                apply("ALTER TABLE unconfirmed_transaction ADD COLUMN IF NOT EXISTS prunable_json VARCHAR");
            case 293:
                apply("CREATE INDEX IF NOT EXISTS prunable_message_sender_idx ON prunable_message (sender_id)");
            case 294:
                apply("CREATE INDEX IF NOT EXISTS prunable_message_recipient_idx ON prunable_message (recipient_id)");
            case 295:
                apply("CREATE INDEX IF NOT EXISTS prunable_message_timestamp_idx ON prunable_message (timestamp DESC)");
            case 296:
                apply("ALTER TABLE transaction ADD COLUMN IF NOT EXISTS has_prunable_encrypted_message BOOLEAN NOT NULL DEFAULT FALSE");
            case 297:
                BlockchainProcessorImpl.getInstance().scheduleScan(0, false);
                apply(null);
            case 298:
                apply("ALTER TABLE prunable_message ALTER COLUMN expiration RENAME TO transaction_timestamp");
            case 299:
                apply("UPDATE prunable_message SET transaction_timestamp = SELECT timestamp FROM transaction WHERE prunable_message.id = transaction.id");
            case 300:
                apply("ALTER INDEX prunable_message_expiration_idx RENAME TO prunable_message_transaction_timestamp_idx");
            case 301:
                apply("ALTER TABLE prunable_message ALTER COLUMN timestamp RENAME TO block_timestamp");
            case 302:
                apply("DROP INDEX IF EXISTS prunable_message_timestamp_idx");
            case 303:
                apply("CREATE INDEX IF NOT EXISTS prunable_message_block_timestamp_dbid_idx ON prunable_message (block_timestamp DESC, db_id DESC)");
            case 304:
                apply("DROP INDEX IF EXISTS prunable_message_height_idx");
            case 305:
                apply("DROP INDEX IF EXISTS public_key_height_idx");
            case 306:
                apply("CREATE TABLE IF NOT EXISTS tagged_data (db_id IDENTITY, id BIGINT NOT NULL, account_id BIGINT NOT NULL, "
                        + "name VARCHAR NOT NULL, description VARCHAR, tags VARCHAR, parsed_tags ARRAY, type VARCHAR, data VARBINARY NOT NULL, "
                        + "is_text BOOLEAN NOT NULL, filename VARCHAR, block_timestamp INT NOT NULL, transaction_timestamp INT NOT NULL, "
                        + "height INT NOT NULL, FOREIGN KEY (height) REFERENCES block (height) ON DELETE CASCADE, latest BOOLEAN NOT NULL DEFAULT TRUE)");
            case 307:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS tagged_data_id_height_idx ON tagged_data (id, height DESC)");
            case 308:
                apply("CREATE INDEX IF NOT EXISTS tagged_data_expiration_idx ON tagged_data (transaction_timestamp DESC)");
            case 309:
                apply("CREATE INDEX IF NOT EXISTS tagged_data_account__height_idx ON tagged_data (account_id, height DESC)");
            case 310:
                apply("CREATE INDEX IF NOT EXISTS tagged_data_block_timestamp_height_db_id_idx ON tagged_data (block_timestamp DESC, height DESC, db_id DESC)");
            case 311:
                apply("CALL FTL_CREATE_INDEX('PUBLIC', 'TAGGED_DATA', 'NAME,DESCRIPTION,TAGS')");
            case 312:
                apply("CREATE TABLE IF NOT EXISTS data_tag (db_id IDENTITY, tag VARCHAR NOT NULL, tag_count INT NOT NULL, "
                        + "height INT NOT NULL, FOREIGN KEY (height) REFERENCES block (height) ON DELETE CASCADE, latest BOOLEAN NOT NULL DEFAULT TRUE)");
            case 313:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS data_tag_tag_height_idx ON data_tag (tag, height DESC)");
            case 314:
                apply("CREATE INDEX IF NOT EXISTS data_tag_count_height_idx ON data_tag (tag_count DESC, height DESC)");
            case 315:
                apply("CREATE TABLE IF NOT EXISTS tagged_data_timestamp (db_id IDENTITY, id BIGINT NOT NULL, timestamp INT NOT NULL, "
                        + "height INT NOT NULL, latest BOOLEAN NOT NULL DEFAULT TRUE)");
            case 316:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS tagged_data_timestamp_id_height_idx ON tagged_data_timestamp (id, height DESC)");
            case 317:
                apply("CREATE INDEX IF NOT EXISTS tagged_data_timestamp_height_idx ON tagged_data_timestamp (height)");
            case 318:
                apply(null);
            case 319:
                apply(null);
            case 320:
                if (Constants.isTestnet) {
                    BlockchainProcessorImpl.getInstance().scheduleScan(0, true);
                }
                apply(null);
            case 321:
                apply("ALTER TABLE tagged_data ADD COLUMN IF NOT EXISTS channel VARCHAR");
            case 322:
                apply("CREATE INDEX IF NOT EXISTS tagged_data_channel_idx ON tagged_data (channel, height DESC)");
            case 323:
                apply("ALTER TABLE peer ADD COLUMN IF NOT EXISTS last_updated INT");
            case 324:
                apply("DROP INDEX IF EXISTS account_current_lessee_id_leasing_height_idx");
            case 325:
                apply("TRUNCATE TABLE account");
            case 326:
                apply("ALTER TABLE account ADD COLUMN IF NOT EXISTS active_lessee_id BIGINT");
            case 327:
                apply("ALTER TABLE account DROP COLUMN IF EXISTS current_leasing_height_from");
            case 328:
                apply("ALTER TABLE account DROP COLUMN IF EXISTS current_leasing_height_to");
            case 329:
                apply("ALTER TABLE account DROP COLUMN IF EXISTS current_lessee_id");
            case 330:
                apply("ALTER TABLE account DROP COLUMN IF EXISTS next_leasing_height_from");
            case 331:
                apply("ALTER TABLE account DROP COLUMN IF EXISTS next_leasing_height_to");
            case 332:
                apply("ALTER TABLE account DROP COLUMN IF EXISTS next_lessee_id");
            case 333:
                apply("CREATE INDEX IF NOT EXISTS account_active_lessee_id_idx ON account (active_lessee_id)");
            case 334:
                apply("CREATE TABLE IF NOT EXISTS account_lease (db_id IDENTITY, lessor_id BIGINT NOT NULL, "
                        + "current_leasing_height_from INT, current_leasing_height_to INT, current_lessee_id BIGINT, "
                        + "next_leasing_height_from INT, next_leasing_height_to INT, next_lessee_id BIGINT, "
                        + "height INT NOT NULL, latest BOOLEAN NOT NULL DEFAULT TRUE)");
            case 335:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS account_lease_lessor_id_height_idx ON account_lease (lessor_id, height DESC)");
            case 336:
                apply("CREATE INDEX IF NOT EXISTS account_lease_current_leasing_height_from_idx ON account_lease (current_leasing_height_from)");
            case 337:
                apply("CREATE INDEX IF NOT EXISTS account_lease_current_leasing_height_to_idx ON account_lease (current_leasing_height_to)");
            case 338:
                apply("CREATE INDEX IF NOT EXISTS account_lease_height_id_idx ON account_lease (height, lessor_id)");
            case 339:
                apply("CREATE INDEX IF NOT EXISTS account_asset_asset_id_idx ON account_asset (asset_id)");
            case 340:
                apply("CREATE INDEX IF NOT EXISTS account_currency_currency_id_idx ON account_currency (currency_id)");
            case 341:
                apply("CREATE INDEX IF NOT EXISTS currency_issuance_height_idx ON currency (issuance_height)");
            case 342:
                apply("CREATE INDEX IF NOT EXISTS unconfirmed_transaction_expiration_idx ON unconfirmed_transaction (expiration DESC)");
            case 343:
                apply("DROP INDEX IF EXISTS account_height_idx");
            case 344:
                apply("CREATE INDEX IF NOT EXISTS account_height_id_idx ON account (height, id)");
            case 345:
                apply("DROP INDEX IF EXISTS account_asset_height_idx");
            case 346:
                apply("CREATE INDEX IF NOT EXISTS account_asset_height_id_idx ON account_asset (height, account_id, asset_id)");
            case 347:
                apply("DROP INDEX IF EXISTS account_currency_height_idx");
            case 348:
                apply("CREATE INDEX IF NOT EXISTS account_currency_height_id_idx ON account_currency (height, account_id, currency_id)");
            case 349:
                apply("DROP INDEX IF EXISTS alias_height_idx");
            case 350:
                apply("CREATE INDEX IF NOT EXISTS alias_height_id_idx ON alias (height, id)");
            case 351:
                apply("DROP INDEX IF EXISTS alias_offer_height_idx");
            case 352:
                apply("CREATE INDEX IF NOT EXISTS alias_offer_height_id_idx ON alias_offer (height, id)");
            case 353:
                apply("DROP INDEX IF EXISTS ask_order_height_idx");
            case 354:
                apply("CREATE INDEX IF NOT EXISTS ask_order_height_id_idx ON ask_order (height, id)");
            case 355:
                apply("DROP INDEX IF EXISTS bid_order_height_idx");
            case 356:
                apply("CREATE INDEX IF NOT EXISTS bid_order_height_id_idx ON bid_order (height, id)");
            case 357:
                apply("DROP INDEX IF EXISTS buy_offer_height_idx");
            case 358:
                apply("CREATE INDEX IF NOT EXISTS buy_offer_height_id_idx ON buy_offer (height, id)");
            case 359:
                apply("DROP INDEX IF EXISTS currency_height_idx");
            case 360:
                apply("CREATE INDEX IF NOT EXISTS currency_height_id_idx ON currency (height, id)");
            case 361:
                apply("DROP INDEX IF EXISTS currency_founder_height_idx");
            case 362:
                apply("CREATE INDEX IF NOT EXISTS currency_founder_height_id_idx ON currency_founder (height, currency_id, account_id)");
            case 363:
                apply("DROP INDEX IF EXISTS currency_mint_height_idx");
            case 364:
                apply("CREATE INDEX IF NOT EXISTS currency_mint_height_id_idx ON currency_mint (height, currency_id, account_id)");
            case 365:
                apply("DROP INDEX IF EXISTS currency_supply_height_idx");
            case 366:
                apply("CREATE INDEX IF NOT EXISTS currency_supply_height_id_idx ON currency_supply (height, id)");
            case 367:
                apply("DROP INDEX IF EXISTS goods_height_idx");
            case 368:
                apply("CREATE INDEX IF NOT EXISTS goods_height_id_idx ON goods (height, id)");
            case 369:
                apply("DROP INDEX IF EXISTS purchase_height_idx");
            case 370:
                apply("CREATE INDEX IF NOT EXISTS purchase_height_id_idx ON purchase (height, id)");
            case 371:
                apply("DROP INDEX IF EXISTS purchase_feedback_height_idx");
            case 372:
                apply("CREATE INDEX IF NOT EXISTS purchase_feedback_height_id_idx ON purchase_feedback (height, id)");
            case 373:
                apply("DROP INDEX IF EXISTS purchase_public_feedback_height_idx");
            case 374:
                apply("CREATE INDEX IF NOT EXISTS purchase_public_feedback_height_id_idx ON purchase_public_feedback (height, id)");
            case 375:
                apply("DROP INDEX IF EXISTS sell_offer_height_idx");
            case 376:
                apply("CREATE INDEX IF NOT EXISTS sell_offer_height_id_idx ON sell_offer (height, id)");
            case 377:
                apply("DROP INDEX IF EXISTS tag_height_idx");
            case 378:
                apply("CREATE INDEX IF NOT EXISTS tag_height_tag_idx ON tag (height, tag)");
            case 379:
                apply("DROP INDEX IF EXISTS account_info_height_idx");
            case 380:
                apply("CREATE INDEX IF NOT EXISTS account_info_height_id_idx ON account_info (height, account_id)");
            case 381:
                apply("DROP INDEX IF EXISTS tagged_data_timestamp_height_idx");
            case 382:
                apply("CREATE INDEX IF NOT EXISTS tagged_data_timestamp_height_id_idx ON tagged_data_timestamp (height, id)");
            case 383:
                apply("CREATE INDEX IF NOT EXISTS trade_height_db_id_idx ON trade (height DESC, db_id DESC)");
            case 384:
                apply("CREATE INDEX IF NOT EXISTS asset_height_db_id_idx ON asset (height DESC, db_id DESC)");
            case 385:
                apply("CREATE INDEX IF NOT EXISTS exchange_height_db_id_idx ON exchange (height DESC, db_id DESC)");
            case 386:
                apply(null);
            case 387:
                apply("CREATE TABLE IF NOT EXISTS exchange_request (db_id IDENTITY, id BIGINT NOT NULL, account_id BIGINT NOT NULL, "
                        + "currency_id BIGINT NOT NULL, units BIGINT NOT NULL, rate BIGINT NOT NULL, is_buy BOOLEAN NOT NULL, "
                        + "timestamp INT NOT NULL, height INT NOT NULL)");
            case 388:
                apply("CREATE UNIQUE INDEX IF NOT EXISTS exchange_request_id_idx ON exchange_request (id)");
            case 389:
                apply("CREATE INDEX IF NOT EXISTS exchange_request_account_currency_idx ON exchange_request (account_id, currency_id, height DESC)");
            case 390:
                apply("CREATE INDEX IF NOT EXISTS exchange_request_currency_idx ON exchange_request (currency_id, height DESC)");
            case 391:
                apply("CREATE INDEX IF NOT EXISTS exchange_request_height_db_id_idx ON exchange_request (height DESC, db_id DESC)");
            case 392:
                apply("CREATE INDEX IF NOT EXISTS exchange_request_height_idx ON exchange_request (height)");
            case 393:
                BlockchainProcessorImpl.getInstance().scheduleScan(0, false);
                apply(null);
            case 394:
                return;
            default:
                throw new RuntimeException("Blockchain database inconsistent with code, at update " + nextUpdate + ", probably trying to run older code on newer database");
        }
    }
}
