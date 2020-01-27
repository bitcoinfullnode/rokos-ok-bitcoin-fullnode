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

package nxt.db;

import java.sql.PreparedStatement;
import java.sql.SQLException;

public abstract class DbClause {

    public enum Op {

        LT("<"), LTE("<="), GT(">"), GTE(">="), NE("<>");

        private final String operator;

        Op(String operator) {
            this.operator = operator;
        }

        public String operator() {
            return operator;
        }
    }

    private final String clause;

    protected DbClause(String clause) {
        this.clause = clause;
    }

    final String getClause() {
        return clause;
    }

    protected abstract int set(PreparedStatement pstmt, int index) throws SQLException;

    public DbClause and(final DbClause other) {
        return new DbClause(this.clause + " AND " + other.clause) {
            @Override
            protected int set(PreparedStatement pstmt, int index) throws SQLException {
                index = DbClause.this.set(pstmt, index);
                index = other.set(pstmt, index);
                return index;
            }
        };
    }

    public static final DbClause EMPTY_CLAUSE = new FixedClause(" TRUE ");

    public static final class FixedClause extends DbClause {

        public FixedClause(String clause) {
            super(clause);
        }

        @Override
        protected int set(PreparedStatement pstmt, int index) throws SQLException {
            return index;
        }

    }

    public static final class StringClause extends DbClause {

        private final String value;

        public StringClause(String columnName, String value) {
            super(" " + columnName + " = ? ");
            this.value = value;
        }

        @Override
        protected int set(PreparedStatement pstmt, int index) throws SQLException {
            pstmt.setString(index, value);
            return index + 1;
        }

    }

    public static final class LikeClause extends DbClause {

        private final String prefix;

        public LikeClause(String columnName, String prefix) {
            super(" " + columnName + " LIKE ? ");
            this.prefix = prefix.replace("%", "\\%").replace("_", "\\_") + '%';
        }

        @Override
        protected int set(PreparedStatement pstmt, int index) throws SQLException {
            pstmt.setString(index, prefix);
            return index + 1;
        }
    }

    public static final class LongClause extends DbClause {

        private final long value;

        public LongClause(String columnName, long value) {
            super(" " + columnName + " = ? ");
            this.value = value;
        }

        public LongClause(String columnName, Op operator, long value) {
            super(" " + columnName + operator.operator() + "? ");
            this.value = value;
        }

        @Override
        protected int set(PreparedStatement pstmt, int index) throws SQLException {
            pstmt.setLong(index, value);
            return index + 1;
        }
    }

    public static final class IntClause extends DbClause {

        private final int value;

        public IntClause(String columnName, int value) {
            super(" " + columnName + " = ? ");
            this.value = value;
        }

        public IntClause(String columnName, Op operator, int value) {
            super(" " + columnName + operator.operator() + "? ");
            this.value = value;
        }

        @Override
        protected int set(PreparedStatement pstmt, int index) throws SQLException {
            pstmt.setInt(index, value);
            return index + 1;
        }

    }

}
