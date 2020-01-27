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

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class RuntimeEnvironment {

    public static boolean isWindowsRuntime() {
        return System.getProperty("os.name").startsWith("Windows");
    }

    private static boolean isWindowsService() {
        return "service".equalsIgnoreCase(System.getProperty(RuntimeMode.RUNTIME_MODE_ARG)) && isWindowsRuntime();
    }

    static boolean isHeadless() {
        boolean isHeadless;
        try {
            // Load by reflection to prevent exception in case java.awt does not exist
            Class graphicsEnvironmentClass = Class.forName("java.awt.GraphicsEnvironment");
            Method isHeadlessMethod = graphicsEnvironmentClass.getMethod("isHeadless");
            isHeadless = (Boolean)isHeadlessMethod.invoke(null);
        } catch (ClassNotFoundException | NoSuchMethodException | InvocationTargetException | IllegalAccessException e) {
            isHeadless = true;
        }
        return isHeadless;
    }

    private static boolean isDesktopEnabled() {
        return "desktop".equalsIgnoreCase(System.getProperty(RuntimeMode.RUNTIME_MODE_ARG)) && !isHeadless();
    }

    public static boolean isWindowsDesktopMode() {
        return isDesktopEnabled() && isWindowsRuntime();
    }

    public static RuntimeMode getRuntimeMode() {
        System.out.println("isHeadless=" + isHeadless());
        if (isDesktopEnabled()) {
            return new DesktopMode();
        } else if (isWindowsService()) {
            return new WindowsServiceMode();
        } else {
            return new CommandLineMode();
        }
    }

    public static DirProvider getDirProvider() {
        if (isWindowsDesktopMode()) {
            return new WindowsUserDirProvider();
        }
        return new DefaultDirProvider();
    }
}
