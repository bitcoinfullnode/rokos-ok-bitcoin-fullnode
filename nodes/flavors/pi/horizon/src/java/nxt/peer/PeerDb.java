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

package nxt.peer;

import nxt.Db;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

final class PeerDb {

    static class Entry {
        private final String address;
        private final int lastUpdated;

        Entry(String address, int lastUpdated) {
            this.address = address;
            this.lastUpdated = lastUpdated;
        }

        public String getAddress() {
            return address;
        }

        public int getLastUpdated() {
            return lastUpdated;
        }

        @Override
        public int hashCode() {
            return address.hashCode();
        }

        @Override
        public boolean equals(Object obj) {
            return (obj!=null && (obj instanceof Entry) && address.equals(((Entry)obj).address));
        }
    }

    static List<Entry> loadPeers() {
        List<Entry> peers = new ArrayList<>();
        try (Connection con = Db.db.getConnection();
             PreparedStatement pstmt = con.prepareStatement("SELECT * FROM peer");
             ResultSet rs = pstmt.executeQuery()) {
            while (rs.next()) {
                peers.add(new Entry(rs.getString("address"), rs.getInt("last_updated")));
            }
        } catch (SQLException e) {
            throw new RuntimeException(e.toString(), e);
        }
        return peers;
    }

    static void deletePeers(Collection<Entry> peers) {
        try (Connection con = Db.db.getConnection();
             PreparedStatement pstmt = con.prepareStatement("DELETE FROM peer WHERE address = ?")) {
            for (Entry peer : peers) {
                pstmt.setString(1, peer.getAddress());
                pstmt.executeUpdate();
            }
        } catch (SQLException e) {
            throw new RuntimeException(e.toString(), e);
        }
    }

    static void addPeers(Collection<Entry> peers) {
        try (Connection con = Db.db.getConnection();
                PreparedStatement pstmt = con.prepareStatement("INSERT INTO peer (address,last_updated) values (?,?)")) {
            for (Entry peer : peers) {
                pstmt.setString(1, peer.getAddress());
                pstmt.setInt(2, peer.getLastUpdated());
                pstmt.executeUpdate();
            }
        } catch (SQLException e) {
            throw new RuntimeException(e.toString(), e);
        }
    }

    static void updatePeers(Collection<Entry> peers) {
        try (Connection con = Db.db.getConnection();
                PreparedStatement pstmt = con.prepareStatement("UPDATE peer SET last_updated=? WHERE address=?")) {
            for (Entry peer : peers) {
                pstmt.setInt(1, peer.getLastUpdated());
                pstmt.setString(2, peer.getAddress());
                pstmt.executeUpdate();
            }
        } catch (SQLException e) {
            throw new RuntimeException(e.toString(), e);
        }
    }
}
