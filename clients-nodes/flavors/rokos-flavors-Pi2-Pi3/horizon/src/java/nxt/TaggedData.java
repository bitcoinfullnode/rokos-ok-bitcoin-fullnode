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

import nxt.db.DbClause;
import nxt.db.DbIterator;
import nxt.db.DbKey;
import nxt.db.VersionedEntityDbTable;
import nxt.db.VersionedPersistentDbTable;
import nxt.db.VersionedPrunableDbTable;
import nxt.util.Logger;
import nxt.util.Search;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public class TaggedData {

    private static final DbKey.LongKeyFactory<TaggedData> taggedDataKeyFactory = new DbKey.LongKeyFactory<TaggedData>("id") {

        @Override
        public DbKey newKey(TaggedData taggedData) {
            return taggedData.dbKey;
        }

    };

    private static final VersionedPrunableDbTable<TaggedData> taggedDataTable = new VersionedPrunableDbTable<TaggedData>(
            "tagged_data", taggedDataKeyFactory, "name,description,tags") {

        @Override
        protected TaggedData load(Connection con, ResultSet rs) throws SQLException {
            return new TaggedData(rs);
        }

        @Override
        protected void save(Connection con, TaggedData taggedData) throws SQLException {
            taggedData.save(con);
        }

        @Override
        protected String defaultSort() {
            return " ORDER BY block_timestamp DESC, height DESC, db_id DESC ";
        }

        @Override
        protected void prune() {
            if (Constants.ENABLE_PRUNING) {
                try (Connection con = db.getConnection();
                     PreparedStatement pstmtSelect = con.prepareStatement("SELECT parsed_tags "
                             + "FROM tagged_data WHERE transaction_timestamp < ? AND latest = TRUE ")) {
                    int expiration = Nxt.getEpochTime() - Constants.MAX_PRUNABLE_LIFETIME;
                    pstmtSelect.setInt(1, expiration);
                    Map<String,Integer> expiredTags = new HashMap<>();
                    try (ResultSet rs = pstmtSelect.executeQuery()) {
                        while (rs.next()) {
                            Object[] array = (Object[])rs.getArray("parsed_tags").getArray();
                            for (Object tag : array) {
                                Integer count = expiredTags.get(tag);
                                expiredTags.put((String)tag, count != null ? count + 1 : 1);
                            }
                        }
                    }
                    Tag.delete(expiredTags);
                } catch (SQLException e) {
                    throw new RuntimeException(e.toString(), e);
                }
            }
            super.prune();
        }

    };

    private static final class Timestamp {

        private final long id;
        private final DbKey dbKey;
        private int timestamp;

        private Timestamp(long id, int timestamp) {
            this.id = id;
            this.dbKey = timestampKeyFactory.newKey(this.id);
            this.timestamp = timestamp;
        }

        private Timestamp(ResultSet rs) throws SQLException {
            this.id = rs.getLong("id");
            this.dbKey = timestampKeyFactory.newKey(this.id);
            this.timestamp = rs.getInt("timestamp");
        }

        private void save(Connection con) throws SQLException {
            try (PreparedStatement pstmt = con.prepareStatement("MERGE INTO tagged_data_timestamp (id, timestamp, height, latest) "
                    + "KEY (id, height) VALUES (?, ?, ?, TRUE)")) {
                int i = 0;
                pstmt.setLong(++i, this.id);
                pstmt.setInt(++i, this.timestamp);
                pstmt.setInt(++i, Nxt.getBlockchain().getHeight());
                pstmt.executeUpdate();
            }
        }

    }


    private static final DbKey.LongKeyFactory<Timestamp> timestampKeyFactory = new DbKey.LongKeyFactory<Timestamp>("id") {

        @Override
        public DbKey newKey(Timestamp timestamp) {
            return timestamp.dbKey;
        }

    };

    private static final VersionedEntityDbTable<Timestamp> timestampTable = new VersionedEntityDbTable<Timestamp>(
            "tagged_data_timestamp", timestampKeyFactory) {

        @Override
        protected Timestamp load(Connection con, ResultSet rs) throws SQLException {
            return new Timestamp(rs);
        }

        @Override
        protected void save(Connection con, Timestamp timestamp) throws SQLException {
            timestamp.save(con);
        }

    };

    public static final class Tag {

        private static final DbKey.StringKeyFactory<Tag> tagDbKeyFactory = new DbKey.StringKeyFactory<Tag>("tag") {
            @Override
            public DbKey newKey(Tag tag) {
                return tag.dbKey;
            }
        };

        private static final VersionedPersistentDbTable<Tag> tagTable = new VersionedPersistentDbTable<Tag>("data_tag", tagDbKeyFactory) {

            @Override
            protected Tag load(Connection con, ResultSet rs) throws SQLException {
                return new Tag(rs);
            }

            @Override
            protected void save(Connection con, Tag tag) throws SQLException {
                tag.save(con);
            }

            @Override
            public String defaultSort() {
                return " ORDER BY tag_count DESC, tag ASC ";
            }

        };

        public static int getTagCount() {
            return tagTable.getCount();
        }

        public static DbIterator<Tag> getAllTags(int from, int to) {
            return tagTable.getAll(from, to);
        }

        public static DbIterator<Tag> getTagsLike(String prefix, int from, int to) {
            DbClause dbClause = new DbClause.LikeClause("tag", prefix);
            return tagTable.getManyBy(dbClause, from, to, " ORDER BY tag ");
        }

        private static void init() {}

        private static void add(TaggedData taggedData) {
            for (String tagValue : taggedData.getParsedTags()) {
                Tag tag = tagTable.get(tagDbKeyFactory.newKey(tagValue));
                if (tag == null) {
                    tag = new Tag(tagValue);
                }
                tag.count += 1;
                tagTable.insert(tag);
            }
        }

        private static void delete(Map<String,Integer> expiredTags) {
            try (Connection con = Db.db.getConnection();
                 PreparedStatement pstmt = con.prepareStatement("UPDATE data_tag SET tag_count = tag_count - ? WHERE tag = ?");
                 PreparedStatement pstmtDelete = con.prepareStatement("DELETE FROM data_tag WHERE tag_count <= 0")) {
                for (Map.Entry<String,Integer> entry : expiredTags.entrySet()) {
                    pstmt.setInt(1, entry.getValue());
                    pstmt.setString(2, entry.getKey());
                    pstmt.executeUpdate();
                    Logger.logDebugMessage("Reduced tag count for " + entry.getKey() + " by " + entry.getValue());
                }
                int deleted = pstmtDelete.executeUpdate();
                if (deleted > 0) {
                    Logger.logDebugMessage("Deleted " + deleted + " tags");
                }
            } catch (SQLException e) {
                throw new RuntimeException(e.toString(), e);
            }
        }

        private final String tag;
        private final DbKey dbKey;
        private int count;

        private Tag(String tag) {
            this.tag = tag;
            this.dbKey = tagDbKeyFactory.newKey(this.tag);
        }

        private Tag(ResultSet rs) throws SQLException {
            this.tag = rs.getString("tag");
            this.dbKey = tagDbKeyFactory.newKey(this.tag);
            this.count = rs.getInt("tag_count");
        }

        private void save(Connection con) throws SQLException {
            try (PreparedStatement pstmt = con.prepareStatement("MERGE INTO data_tag (tag, tag_count, height, latest) "
                    + "KEY (tag, height) VALUES (?, ?, ?, TRUE)")) {
                int i = 0;
                pstmt.setString(++i, this.tag);
                pstmt.setInt(++i, this.count);
                pstmt.setInt(++i, Nxt.getBlockchain().getHeight());
                pstmt.executeUpdate();
            }
        }

        public String getTag() {
            return tag;
        }

        public int getCount() {
            return count;
        }

    }


    public static int getCount() {
        return taggedDataTable.getCount();
    }

    public static DbIterator<TaggedData> getAll(int from, int to) {
        return taggedDataTable.getAll(from, to);
    }

    public static TaggedData getData(long transactionId) {
        return taggedDataTable.get(taggedDataKeyFactory.newKey(transactionId));
    }

    public static DbIterator<TaggedData> getData(String channel, long accountId, int from, int to) {
        if (channel == null && accountId == 0) {
            throw new IllegalArgumentException("Either channel, or accountId, or both, must be specified");
        }
        return taggedDataTable.getManyBy(getDbClause(channel, accountId), from, to);
    }

    public static DbIterator<TaggedData> searchData(String query, String channel, long accountId, int from, int to) {
        return taggedDataTable.search(query, getDbClause(channel, accountId), from, to,
                " ORDER BY ft.score DESC, tagged_data.block_timestamp DESC, tagged_data.db_id DESC ");
    }

    private static DbClause getDbClause(String channel, long accountId) {
        DbClause dbClause = DbClause.EMPTY_CLAUSE;
        if (channel != null) {
            dbClause = new DbClause.StringClause("channel", channel);
        }
        if (accountId != 0) {
            DbClause accountClause = new DbClause.LongClause("account_id", accountId);
            dbClause = dbClause != DbClause.EMPTY_CLAUSE ? dbClause.and(accountClause) : accountClause;
        }
        return dbClause;
    }

    static void init() {
        Tag.init();
    }

    private final long id;
    private final DbKey dbKey;
    private final long accountId;
    private final String name;
    private final String description;
    private final String tags;
    private final String[] parsedTags;
    private final byte[] data;
    private final String type;
    private final String channel;
    private final boolean isText;
    private final String filename;
    private int transactionTimestamp;
    private int blockTimestamp;

    public TaggedData(Transaction transaction, Attachment.TaggedDataAttachment attachment) {
        this.id = transaction.getId();
        this.dbKey = taggedDataKeyFactory.newKey(this.id);
        this.accountId = transaction.getSenderId();
        this.name = attachment.getName();
        this.description = attachment.getDescription();
        this.tags = attachment.getTags();
        this.parsedTags = Search.parseTags(tags, 3, 20, 5);
        this.data = attachment.getData();
        this.type = attachment.getType();
        this.channel = attachment.getChannel();
        this.isText = attachment.isText();
        this.filename = attachment.getFilename();
        this.blockTimestamp = Nxt.getBlockchain().getLastBlockTimestamp();
        this.transactionTimestamp = transaction.getTimestamp();
    }

    private TaggedData(ResultSet rs) throws SQLException {
        this.id = rs.getLong("id");
        this.dbKey = taggedDataKeyFactory.newKey(this.id);
        this.accountId = rs.getLong("account_id");
        this.name = rs.getString("name");
        this.description = rs.getString("description");
        this.tags = rs.getString("tags");
        Object[] array = (Object[])rs.getArray("parsed_tags").getArray();
        this.parsedTags = Arrays.copyOf(array, array.length, String[].class);
        this.data = rs.getBytes("data");
        this.type = rs.getString("type");
        this.channel = rs.getString("channel");
        this.isText = rs.getBoolean("is_text");
        this.filename = rs.getString("filename");
        this.blockTimestamp = rs.getInt("block_timestamp");
        this.transactionTimestamp = rs.getInt("transaction_timestamp");
    }

    private void save(Connection con) throws SQLException {
        try (PreparedStatement pstmt = con.prepareStatement("MERGE INTO tagged_data (id, account_id, name, description, tags, parsed_tags, "
                + "type, channel, data, is_text, filename, block_timestamp, transaction_timestamp, height, latest) "
                + "KEY (id, height) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)")) {
            int i = 0;
            pstmt.setLong(++i, this.id);
            pstmt.setLong(++i, this.accountId);
            pstmt.setString(++i, this.name);
            pstmt.setString(++i, this.description);
            pstmt.setString(++i, this.tags);
            pstmt.setObject(++i, this.parsedTags);
            pstmt.setString(++i, this.type);
            pstmt.setString(++i, this.channel);
            pstmt.setBytes(++i, this.data);
            pstmt.setBoolean(++i, this.isText);
            pstmt.setString(++i, this.filename);
            pstmt.setInt(++i, this.blockTimestamp);
            pstmt.setInt(++i, this.transactionTimestamp);
            pstmt.setInt(++i, Nxt.getBlockchain().getHeight());
            pstmt.executeUpdate();
        }
    }

    public long getId() {
        return id;
    }

    public long getAccountId() {
        return accountId;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getTags() {
        return tags;
    }

    public String[] getParsedTags() {
        return parsedTags;
    }

    public byte[] getData() {
        return data;
    }

    public String getType() {
        return type;
    }

    public String getChannel() {
        return channel;
    }

    public boolean isText() {
        return isText;
    }

    public String getFilename() {
        return filename;
    }

    public int getTransactionTimestamp() {
        return transactionTimestamp;
    }

    public int getBlockTimestamp() {
        return blockTimestamp;
    }

    static void add(Transaction transaction, Attachment.TaggedDataUpload attachment) {
        if (Nxt.getEpochTime() - transaction.getTimestamp() < Constants.MAX_PRUNABLE_LIFETIME) {
            TaggedData taggedData = taggedDataTable.get(taggedDataKeyFactory.newKey(transaction.getId()));
            if (taggedData == null && attachment.getData() != null) {
                taggedData = new TaggedData(transaction, attachment);
                taggedDataTable.insert(taggedData);
                Tag.add(taggedData);
            }
        }
        Timestamp timestamp = new Timestamp(transaction.getId(), transaction.getTimestamp());
        timestampTable.insert(timestamp);
    }

    static void extend(Transaction transaction, Attachment.TaggedDataExtend attachment) {
        Timestamp timestamp = timestampTable.get(timestampKeyFactory.newKey(attachment.getTaggedDataId()));
        timestamp.timestamp += Math.max(Constants.MIN_PRUNABLE_LIFETIME, transaction.getTimestamp() - timestamp.timestamp);
        timestampTable.insert(timestamp);
        if (Nxt.getEpochTime() - transaction.getTimestamp() < Constants.MAX_PRUNABLE_LIFETIME) {
            TaggedData taggedData = taggedDataTable.get(taggedDataKeyFactory.newKey(attachment.getTaggedDataId()));
            if (taggedData == null && attachment.getData() != null) {
                TransactionImpl uploadTransaction = TransactionDb.findTransaction(attachment.getTaggedDataId());
                taggedData = new TaggedData(uploadTransaction, attachment);
                Tag.add(taggedData);
            }
            if (taggedData != null) {
                taggedData.transactionTimestamp = timestamp.timestamp;
                taggedData.blockTimestamp = Nxt.getBlockchain().getLastBlockTimestamp();
                taggedDataTable.insert(taggedData);
            }
        }
    }

}
