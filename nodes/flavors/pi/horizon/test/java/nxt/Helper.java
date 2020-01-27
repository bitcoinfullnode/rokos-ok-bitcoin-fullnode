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


import nxt.util.Listener;
import nxt.util.Logger;
import org.h2.tools.Shell;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class Helper {

    public static String executeQuery(String line) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PrintStream out = new PrintStream(baos);
        out.println(line);
        try {
            Shell shell = new Shell();
            shell.setErr(out);
            shell.setOut(out);
            shell.runTool(Db.db.getConnection(), "-sql", line);
        } catch (SQLException e) {
            out.println(e.toString());
        }
        return new String(baos.toByteArray());
    }

    public static int getCount(String table) {
        try (Connection con = Db.db.getConnection();
             Statement statement = con.createStatement();
             ResultSet rs = statement.executeQuery("select count(*) as c from " + table)) {
            rs.next();
            return rs.getInt("c");
        } catch (SQLException e) {
            throw new RuntimeException(e.toString(), e);
        }
    }

    public static class BlockListener implements Listener<Block> {
        @Override
        public void notify(Block block) {
            Logger.logDebugMessage("Block Generated at height %d with %d transactions\n", block.getHeight(), block.getTransactions().size());
        }
    }
}
