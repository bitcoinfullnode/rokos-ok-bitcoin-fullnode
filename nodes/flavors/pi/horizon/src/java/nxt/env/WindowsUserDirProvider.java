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

package nxt.env;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Properties;

public class WindowsUserDirProvider implements DirProvider {

    public static final String NXT_USER_HOME = Paths.get(System.getProperty("user.home"), "AppData", "Roaming", "Horizon").toString();
    public static final String LOG_FILE_PATTERN = "java.util.logging.FileHandler.pattern";
    protected File logFileDir;

    @Override
    public boolean isLoadPropertyFileFromUserDir() {
        return true;
    }

    @Override
    public void updateLogFileHandler(Properties loggingProperties) {
        if (loggingProperties.getProperty(LOG_FILE_PATTERN) == null) {
            return;
        }
        Path logFilePattern = Paths.get(NXT_USER_HOME, loggingProperties.getProperty(LOG_FILE_PATTERN));
        loggingProperties.setProperty(LOG_FILE_PATTERN, logFilePattern.toString());

        Path logDirPath = logFilePattern.getParent();
        this.logFileDir = new File(logDirPath.toString());
        if (!Files.isReadable(logDirPath)) {
            System.out.printf("Creating dir %s\n", logDirPath);
            try {
                Files.createDirectory(logDirPath);
            } catch (IOException e) {
                throw new IllegalArgumentException("Cannot create " + logDirPath, e);
            }
        }
    }

    @Override
    public String getDbDir(String dbDir) {
        return Paths.get(NXT_USER_HOME, dbDir).toString();
    }

    @Override
    public File getLogFileDir() {
        return logFileDir;
    }

    @Override
    public String getUserHomeDir() {
        return NXT_USER_HOME;
    }
}
