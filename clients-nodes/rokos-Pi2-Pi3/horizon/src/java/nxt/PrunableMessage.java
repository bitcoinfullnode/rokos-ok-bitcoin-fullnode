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

import nxt.crypto.EncryptedData;
import nxt.db.DbIterator;
import nxt.db.DbKey;
import nxt.db.DbUtils;
import nxt.db.PrunableDbTable;
import nxt.util.Convert;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public final class PrunableMessage {

    private static final DbKey.LongKeyFactory<PrunableMessage> prunableMessageKeyFactory = new DbKey.LongKeyFactory<PrunableMessage>("id") {

        @Override
        public DbKey newKey(PrunableMessage prunableMessage) {
            return prunableMessage.dbKey;
        }

    };

    private static final PrunableDbTable<PrunableMessage> prunableMessageTable = new PrunableDbTable<PrunableMessage>("prunable_message", prunableMessageKeyFactory) {

        @Override
        protected PrunableMessage load(Connection con, ResultSet rs) throws SQLException {
            return new PrunableMessage(rs);
        }

        @Override
        protected void save(Connection con, PrunableMessage prunableMessage) throws SQLException {
            prunableMessage.save(con);
        }

        @Override
        protected String defaultSort() {
            return " ORDER BY block_timestamp DESC, db_id DESC ";
        }

    };

    public static int getCount() {
        return prunableMessageTable.getCount();
    }

    public static DbIterator<PrunableMessage> getAll(int from, int to) {
        return prunableMessageTable.getAll(from, to);
    }

    public static PrunableMessage getPrunableMessage(long transactionId) {
        return prunableMessageTable.get(prunableMessageKeyFactory.newKey(transactionId));
    }

    public static DbIterator<PrunableMessage> getPrunableMessages(long accountId, int from, int to) {
        Connection con = null;
        try {
            con = Db.db.getConnection();
            PreparedStatement pstmt = con.prepareStatement("SELECT * FROM prunable_message WHERE sender_id = ?"
                    + " UNION ALL SELECT * FROM prunable_message WHERE recipient_id = ? AND sender_id <> ? ORDER BY block_timestamp DESC, db_id DESC "
                    + DbUtils.limitsClause(from, to));
            int i = 0;
            pstmt.setLong(++i, accountId);
            pstmt.setLong(++i, accountId);
            pstmt.setLong(++i, accountId);
            DbUtils.setLimits(++i, pstmt, from, to);
            return prunableMessageTable.getManyBy(con, pstmt, false);
        } catch (SQLException e) {
            DbUtils.close(con);
            throw new RuntimeException(e.toString(), e);
        }
    }

    public static DbIterator<PrunableMessage> getPrunableMessages(long accountId, long otherAccountId, int from, int to) {
        Connection con = null;
        try {
            con = Db.db.getConnection();
            PreparedStatement pstmt = con.prepareStatement("SELECT * FROM prunable_message WHERE sender_id = ? AND recipient_id = ? "
                    + "UNION ALL SELECT * FROM prunable_message WHERE sender_id = ? AND recipient_id = ? AND sender_id <> recipient_id "
                    + "ORDER BY block_timestamp DESC, db_id DESC "
                    + DbUtils.limitsClause(from, to));
            int i = 0;
            pstmt.setLong(++i, accountId);
            pstmt.setLong(++i, otherAccountId);
            pstmt.setLong(++i, otherAccountId);
            pstmt.setLong(++i, accountId);
            DbUtils.setLimits(++i, pstmt, from, to);
            return prunableMessageTable.getManyBy(con, pstmt, false);
        } catch (SQLException e) {
            DbUtils.close(con);
            throw new RuntimeException(e.toString(), e);
        }
    }

    static void init() {}

    private final long id;
    private final DbKey dbKey;
    private final long senderId;
    private final long recipientId;
    private final byte[] message;
    private final EncryptedData encryptedData;
    private final boolean isText;
    private final boolean isCompressed;
    private final int transactionTimestamp;
    private final int blockTimestamp;

    private PrunableMessage(Transaction transaction, Appendix.PrunablePlainMessage appendix) {
        this.id = transaction.getId();
        this.dbKey = prunableMessageKeyFactory.newKey(this.id);
        this.senderId = transaction.getSenderId();
        this.recipientId = transaction.getRecipientId();
        this.message = appendix.getMessage();
        this.encryptedData = null;
        this.isText = appendix.isText();
        this.isCompressed = false;
        this.blockTimestamp = Nxt.getBlockchain().getLastBlockTimestamp();
        this.transactionTimestamp = transaction.getTimestamp();
    }

    private PrunableMessage(Transaction transaction, Appendix.PrunableEncryptedMessage appendix) {
        this.id = transaction.getId();
        this.dbKey = prunableMessageKeyFactory.newKey(this.id);
        this.senderId = transaction.getSenderId();
        this.recipientId = transaction.getRecipientId();
        this.message = null;
        this.encryptedData = appendix.getEncryptedData();
        this.isText = appendix.isText();
        this.isCompressed = appendix.isCompressed();
        this.blockTimestamp = Nxt.getBlockchain().getLastBlockTimestamp();
        this.transactionTimestamp = transaction.getTimestamp();
    }

    private PrunableMessage(ResultSet rs) throws SQLException {
        this.id = rs.getLong("id");
        this.dbKey = prunableMessageKeyFactory.newKey(this.id);
        this.senderId = rs.getLong("sender_id");
        this.recipientId = rs.getLong("recipient_id");
        if (rs.getBoolean("is_encrypted")) {
            this.encryptedData = EncryptedData.readEncryptedData(rs.getBytes("message"));
            this.message = null;
        } else {
            this.message = rs.getBytes("message");
            this.encryptedData = null;
        }
        this.isText = rs.getBoolean("is_text");
        this.isCompressed = rs.getBoolean("is_compressed");
        this.blockTimestamp = rs.getInt("block_timestamp");
        this.transactionTimestamp = rs.getInt("transaction_timestamp");
    }

    private void save(Connection con) throws SQLException {
        try (PreparedStatement pstmt = con.prepareStatement("INSERT INTO prunable_message (id, sender_id, recipient_id, "
                + "message, is_encrypted, is_text, is_compressed, block_timestamp, transaction_timestamp, height) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")) {
            int i = 0;
            pstmt.setLong(++i, this.id);
            pstmt.setLong(++i, this.senderId);
            DbUtils.setLongZeroToNull(pstmt, ++i, this.recipientId);
            if (message != null) {
                pstmt.setBytes(++i, message);
                pstmt.setBoolean(++i, false);
            } else {
                pstmt.setBytes(++i, encryptedData.getBytes());
                pstmt.setBoolean(++i, true);
            }
            pstmt.setBoolean(++i, isText);
            pstmt.setBoolean(++i, isCompressed);
            pstmt.setInt(++i, blockTimestamp);
            pstmt.setInt(++i, transactionTimestamp);
            pstmt.setInt(++i, Nxt.getBlockchain().getHeight());
            pstmt.executeUpdate();
        }
    }

    public byte[] getMessage() {
        return message;
    }

    public EncryptedData getEncryptedData() {
        return encryptedData;
    }

    public boolean isText() {
        return isText;
    }

    public boolean isCompressed() {
        return isCompressed;
    }

    public long getId() {
        return id;
    }

    public long getSenderId() {
        return senderId;
    }

    public long getRecipientId() {
        return recipientId;
    }

    public int getTransactionTimestamp() {
        return transactionTimestamp;
    }

    public int getBlockTimestamp() {
        return blockTimestamp;
    }

    @Override
    public String toString() {
        return message != null ? (isText ? Convert.toString(message) : Convert.toHexString(message)) : encryptedData.toString();
    }

    static void add(Transaction transaction, Appendix.PrunablePlainMessage appendix) {
        if (Nxt.getEpochTime() - transaction.getTimestamp() < Constants.MAX_PRUNABLE_LIFETIME
                && prunableMessageTable.get(prunableMessageKeyFactory.newKey(transaction.getId())) == null
                && appendix.getMessage() != null) {
            PrunableMessage prunableMessage = new PrunableMessage(transaction, appendix);
            prunableMessageTable.insert(prunableMessage);
        }
    }

    static void add(Transaction transaction, Appendix.PrunableEncryptedMessage appendix) {
        if (Nxt.getEpochTime() - transaction.getTimestamp() < Constants.MAX_PRUNABLE_LIFETIME
                && prunableMessageTable.get(prunableMessageKeyFactory.newKey(transaction.getId())) == null
                && appendix.getEncryptedData() != null) {
            PrunableMessage prunableMessage = new PrunableMessage(transaction, appendix);
            prunableMessageTable.insert(prunableMessage);
        }
    }
}
