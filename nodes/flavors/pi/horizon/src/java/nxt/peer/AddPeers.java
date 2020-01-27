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

import nxt.util.JSON;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONStreamAware;

final class AddPeers extends PeerServlet.PeerRequestHandler {

    static final AddPeers instance = new AddPeers();

    private AddPeers() {}

    @Override
    JSONStreamAware processRequest(JSONObject request, Peer peer) {
        final JSONArray peers = (JSONArray)request.get("peers");
        if (peers != null && Peers.getMorePeers && !Peers.hasTooManyKnownPeers()) {
            Peers.peersService.submit(() -> {
                for (Object announcedAddress : peers) {
                    Peer newPeer = Peers.findOrCreatePeer((String) announcedAddress, true);
                    if (newPeer != null) {
                        Peers.addPeer(newPeer);
                        if (Peers.hasTooManyKnownPeers()) {
                            break;
                        }
                    }
                }
            });
        }
        return JSON.emptyJSON;
    }

    @Override
    boolean rejectWhileDownloading() {
        return false;
    }

}
