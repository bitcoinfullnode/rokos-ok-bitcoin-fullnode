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

import nxt.Constants;
import nxt.Nxt;
import nxt.util.Logger;
import nxt.util.ThreadPool;
import nxt.util.UPnP;
import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.HttpConfiguration;
import org.eclipse.jetty.server.HttpConnectionFactory;
import org.eclipse.jetty.server.SecureRequestCustomizer;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.server.SslConnectionFactory;
import org.eclipse.jetty.server.handler.ContextHandler;
import org.eclipse.jetty.server.handler.DefaultHandler;
import org.eclipse.jetty.server.handler.HandlerList;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.servlet.DefaultServlet;
import org.eclipse.jetty.servlet.FilterHolder;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.eclipse.jetty.servlets.CrossOriginFilter;
import org.eclipse.jetty.servlets.GzipFilter;
import org.eclipse.jetty.util.ssl.SslContextFactory;

import javax.servlet.MultipartConfigElement;
import javax.servlet.http.HttpServletRequest;
import java.math.BigInteger;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static nxt.http.JSONResponses.INCORRECT_ADMIN_PASSWORD;
import static nxt.http.JSONResponses.NO_PASSWORD_IN_CONFIG;

public final class API {

    public static final int TESTNET_API_PORT = 6976;
    public static final int TESTNET_API_SSLPORT = 6977;

    private static final Set<String> allowedBotHosts;
    private static final List<NetworkAddress> allowedBotNets;
    static final String adminPassword = Nxt.getStringProperty("nxt.adminPassword", "", true);
    static final boolean disableAdminPassword;
    static final int maxRecords = Nxt.getIntProperty("nxt.maxAPIRecords");
    static final boolean enableAPIUPnP = Nxt.getBooleanProperty("nxt.enableAPIUPnP");

    private static final Server apiServer;
    private static URI browserUri;

    static {
        List<String> allowedBotHostsList = Nxt.getStringListProperty("nxt.allowedBotHosts");
        if (! allowedBotHostsList.contains("*")) {
            Set<String> hosts = new HashSet<>();
            List<NetworkAddress> nets = new ArrayList<>();
            for (String host : allowedBotHostsList) {
                if (host.contains("/")) {
                    try {
                        nets.add(new NetworkAddress(host));
                    } catch (UnknownHostException e) {
                        Logger.logErrorMessage("Unknown network " + host, e);
                        throw new RuntimeException(e.toString(), e);
                    }
                } else {
                    hosts.add(host);
                }
            }
            allowedBotHosts = Collections.unmodifiableSet(hosts);
            allowedBotNets = Collections.unmodifiableList(nets);
        } else {
            allowedBotHosts = null;
            allowedBotNets = null;
        }

        boolean enableAPIServer = Nxt.getBooleanProperty("nxt.enableAPIServer");
        if (enableAPIServer) {
            final int port = Constants.isTestnet ? TESTNET_API_PORT : Nxt.getIntProperty("nxt.apiServerPort");
            final int sslPort = Constants.isTestnet ? TESTNET_API_SSLPORT : Nxt.getIntProperty("nxt.apiServerSSLPort");
            final String host = Nxt.getStringProperty("nxt.apiServerHost");
            disableAdminPassword = Nxt.getBooleanProperty("nxt.disableAdminPassword") || ("127.0.0.1".equals(host) && adminPassword.isEmpty());

            apiServer = new Server();
            ServerConnector connector;
            boolean enableSSL = Nxt.getBooleanProperty("nxt.apiSSL");
            //
            // Create the HTTP connector
            //
            if (!enableSSL || port != sslPort) {
                connector = new ServerConnector(apiServer);
                connector.setPort(port);
                connector.setHost(host);
                connector.setIdleTimeout(Nxt.getIntProperty("nxt.apiServerIdleTimeout"));
                connector.setReuseAddress(true);
                apiServer.addConnector(connector);
                Logger.logMessage("API server using HTTP port " + port);
            }
            //
            // Create the HTTPS connector
            //
            if (enableSSL) {
                HttpConfiguration https_config = new HttpConfiguration();
                https_config.setSecureScheme("https");
                https_config.setSecurePort(sslPort);
                https_config.addCustomizer(new SecureRequestCustomizer());
                SslContextFactory sslContextFactory = new SslContextFactory();
                sslContextFactory.setKeyStorePath(Nxt.getStringProperty("nxt.keyStorePath"));
                sslContextFactory.setKeyStorePassword(Nxt.getStringProperty("nxt.keyStorePassword", null, true));
                sslContextFactory.setExcludeCipherSuites("SSL_RSA_WITH_DES_CBC_SHA", "SSL_DHE_RSA_WITH_DES_CBC_SHA",
                        "SSL_DHE_DSS_WITH_DES_CBC_SHA", "SSL_RSA_EXPORT_WITH_RC4_40_MD5", "SSL_RSA_EXPORT_WITH_DES40_CBC_SHA",
                        "SSL_DHE_RSA_EXPORT_WITH_DES40_CBC_SHA", "SSL_DHE_DSS_EXPORT_WITH_DES40_CBC_SHA");
                sslContextFactory.setExcludeProtocols("SSLv3");
                connector = new ServerConnector(apiServer, new SslConnectionFactory(sslContextFactory, "http/1.1"),
                        new HttpConnectionFactory(https_config));
                connector.setPort(sslPort);
                connector.setHost(host);
                connector.setIdleTimeout(Nxt.getIntProperty("nxt.apiServerIdleTimeout"));
                connector.setReuseAddress(true);
                apiServer.addConnector(connector);
                Logger.logMessage("API server using HTTPS port " + sslPort);
            }
            try {
                browserUri = new URI(enableSSL ? "https" : "http", null, "localhost", enableSSL ? sslPort : port, "/index.html", null, null);
            } catch (URISyntaxException e) {
                Logger.logInfoMessage("Cannot resolve browser URI", e);
            }

            HandlerList apiHandlers = new HandlerList();

            ServletContextHandler apiHandler = new ServletContextHandler();
            String apiResourceBase = Nxt.getStringProperty("nxt.apiResourceBase");
            if (apiResourceBase != null) {
                ServletHolder defaultServletHolder = new ServletHolder(new DefaultServlet());
                defaultServletHolder.setInitParameter("dirAllowed", "false");
                defaultServletHolder.setInitParameter("resourceBase", apiResourceBase);
                defaultServletHolder.setInitParameter("welcomeServlets", "true");
                defaultServletHolder.setInitParameter("redirectWelcome", "true");
                defaultServletHolder.setInitParameter("gzip", "true");
                defaultServletHolder.setInitParameter("etags", "true");
                apiHandler.addServlet(defaultServletHolder, "/*");
                apiHandler.setWelcomeFiles(new String[]{Nxt.getStringProperty("nxt.apiWelcomeFile")});
            }

            String javadocResourceBase = Nxt.getStringProperty("nxt.javadocResourceBase");
            if (javadocResourceBase != null) {
                ContextHandler contextHandler = new ContextHandler("/doc");
                ResourceHandler docFileHandler = new ResourceHandler();
                docFileHandler.setDirectoriesListed(false);
                docFileHandler.setWelcomeFiles(new String[]{"index.html"});
                docFileHandler.setResourceBase(javadocResourceBase);
                contextHandler.setHandler(docFileHandler);
                apiHandlers.addHandler(contextHandler);
            }

            ServletHolder servletHolder = apiHandler.addServlet(APIServlet.class, "/nhz");
            servletHolder.getRegistration().setMultipartConfig(new MultipartConfigElement(
                    null, Math.max(Nxt.getIntProperty("nxt.maxUploadFileSize"), Constants.MAX_TAGGED_DATA_DATA_LENGTH), -1L, 0));
            if (Nxt.getBooleanProperty("nxt.enableAPIServerGZIPFilter")) {
                FilterHolder gzipFilterHolder = apiHandler.addFilter(GzipFilter.class, "/nhz", null);
                gzipFilterHolder.setInitParameter("methods", "GET,POST");
                gzipFilterHolder.setAsyncSupported(true);
            }

            apiHandler.addServlet(APITestServlet.class, "/test");

            apiHandler.addServlet(DbShellServlet.class, "/dbshell");

            if (Nxt.getBooleanProperty("nxt.apiServerCORS")) {
                FilterHolder filterHolder = apiHandler.addFilter(CrossOriginFilter.class, "/*", null);
                filterHolder.setInitParameter("allowedHeaders", "*");
                filterHolder.setAsyncSupported(true);
            }

            apiHandlers.addHandler(apiHandler);
            apiHandlers.addHandler(new DefaultHandler());

            apiServer.setHandler(apiHandlers);
            apiServer.setStopAtShutdown(true);

            ThreadPool.runBeforeStart(() -> {
                try {
                    if (enableAPIUPnP) {
                        Connector[] apiConnectors = apiServer.getConnectors();
                        for (Connector apiConnector : apiConnectors) {
                            if (apiConnector instanceof ServerConnector)
                                UPnP.addPort(((ServerConnector)apiConnector).getPort());
                        }
                    }
                    apiServer.start();
                    Logger.logMessage("Started API server at " + host + ":" + port + (enableSSL && port != sslPort ? ", " + host + ":" + sslPort : ""));
                } catch (Exception e) {
                    Logger.logErrorMessage("Failed to start API server", e);
                    throw new RuntimeException(e.toString(), e);
                }

            }, true);

        } else {
            apiServer = null;
            disableAdminPassword = false;
            Logger.logMessage("API server not enabled");
        }

    }

    public static void init() {}

    public static void shutdown() {
        if (apiServer != null) {
            try {
                apiServer.stop();
                if (enableAPIUPnP) {
                    Connector[] apiConnectors = apiServer.getConnectors();
                    for (Connector apiConnector : apiConnectors) {
                        if (apiConnector instanceof ServerConnector)
                            UPnP.deletePort(((ServerConnector)apiConnector).getPort());
                    }
                }
            } catch (Exception e) {
                Logger.logShutdownMessage("Failed to stop API server", e);
            }
        }
    }

    static void verifyPassword(HttpServletRequest req) throws ParameterException {
        if (API.disableAdminPassword) {
            return;
        }
        if (API.adminPassword.isEmpty()) {
            throw new ParameterException(NO_PASSWORD_IN_CONFIG);
        } else if (!API.adminPassword.equals(req.getParameter("adminPassword"))) {
            Logger.logWarningMessage("Incorrect adminPassword");
            throw new ParameterException(INCORRECT_ADMIN_PASSWORD);
        }
    }

    static boolean checkPassword(HttpServletRequest req) {
        return (API.disableAdminPassword || (!API.adminPassword.isEmpty() && API.adminPassword.equals(req.getParameter("adminPassword"))));
    }

    static boolean isAllowed(String remoteHost) {
        if (API.allowedBotHosts == null || API.allowedBotHosts.contains(remoteHost)) {
            return true;
        }
        try {
            BigInteger hostAddressToCheck = new BigInteger(InetAddress.getByName(remoteHost).getAddress());
            for (NetworkAddress network : API.allowedBotNets) {
                if (network.contains(hostAddressToCheck)) {
                    return true;
                }
            }
        } catch (UnknownHostException e) {
            // can't resolve, disallow
            Logger.logMessage("Unknown remote host " + remoteHost);
        }
        return false;

    }

    private static class NetworkAddress {

        private BigInteger netAddress;
        private BigInteger netMask;

        private NetworkAddress(String address) throws UnknownHostException {
            String[] addressParts = address.split("/");
            if (addressParts.length == 2) {
                InetAddress targetHostAddress = InetAddress.getByName(addressParts[0]);
                byte[] srcBytes = targetHostAddress.getAddress();
                netAddress = new BigInteger(1, srcBytes);
                int maskBitLength = Integer.valueOf(addressParts[1]);
                int addressBitLength = (targetHostAddress instanceof Inet4Address) ? 32 : 128;
                netMask = BigInteger.ZERO
                        .setBit(addressBitLength)
                        .subtract(BigInteger.ONE)
                        .subtract(BigInteger.ZERO.setBit(addressBitLength - maskBitLength).subtract(BigInteger.ONE));
            } else {
                throw new IllegalArgumentException("Invalid address: " + address);
            }
        }

        private boolean contains(BigInteger hostAddressToCheck) {
            return hostAddressToCheck.and(netMask).equals(netAddress);
        }

    }

    public static URI getBrowserUri() {
        return browserUri;
    }

    private API() {} // never

}
