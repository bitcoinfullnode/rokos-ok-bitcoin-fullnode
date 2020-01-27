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

import nxt.BlockchainProcessor;
import nxt.TransactionProcessor;
import nxt.http.EventListener.EventListenerException;
import nxt.peer.Peers;
import org.json.simple.JSONObject;
import org.json.simple.JSONStreamAware;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;

/**
 * <p>The EventRegister API will create an event listener and register
 * one or more server events.
 * The 'add' and 'remove' parameters must be omitted or must both be false
 * in order to create a new event listener.</p>
 *
 * <p>After calling EventRegister, the application needs to call the
 * EventWait API to wait for one of the registered events to occur.
 * The events will remain registered so successive calls to EventWait can
 * be made without another call to EventRegister.</p>
 *
 * <p>When the event listener is no longer needed, the application should call
 * EventRegister with an empty event list and 'remove=true'.  An outstanding
 * event wait will be completed and the event listener will be canceled.
 * </p>
 *
 * <p>An existing event list can be modified by calling EventRegister with
 * either 'add=true' or 'remove=true'.  The current event list will be replaced
 * if both parameters are omitted or are false.</p>
 *
 * <p>Event registration will be canceled if the application does not
 * issue an EventWait before the time interval specified by nxt.apiEventTimeout
 * expires.  The timer is reset each time an EventWait is processed.</p>
 *
 * <p>An application cannot register events if the maximum number of event users
 * specified by nxt.apiMaxEventUsers has been reached.</p>
 *
 * <p>Request parameters:</p>
 * <ul>
 * <li>event - Event name.  The 'event' parameter can be
 * repeated to specify multiple events.  All events will be included
 * if the 'event' parameter is not specified.</li>
 * <li>add - Specify 'true' to add the events to an existing event list.</li>
 * <li>remove - Specify 'true' to remove the events from an existing event list.</li>
 * </ul>
 *
 * <p>Response parameters:</p>
 * <ul>
 * <li>registered - Set to 'true' if the events were processed.</li>
 * </ul>
 *
 * <p>Error Response parameters:</p>
 * <ul>
 * <li>errorCode - API error code</li>
 * <li>errorDescription - API error description</li>
 * </ul>
 *
 * <p>Event names:</p>
 * <ul>
 * <li>Block.BLOCK_GENERATED</li>
 * <li>Block.BLOCK_POPPED</li>
 * <li>Block.BLOCK_PUSHED</li>
 * <li>Peer.ADD_INBOUND</li>
 * <li>Peer.ADDED_ACTIVE_PEER</li>
 * <li>Peer.BLACKLIST</li>
 * <li>Peer.CHANGED_ACTIVE_PEER</li>
 * <li>Peer.DEACTIVATE</li>
 * <li>Peer.NEW_PEER</li>
 * <li>Peer.REMOVE</li>
 * <li>Peer.REMOVE_INBOUND</li>
 * <li>Peer.UNBLACKLIST</li>
 * <li>Transaction.ADDED_CONFIRMED_TRANSACTIONS</li>
 * <li>Transaction.ADDED_UNCONFIRMED_TRANSACTIONS</li>
 * <li>Transaction.REJECT_PHASED_TRANSACTION</li>
 * <li>Transaction.RELEASE_PHASED_TRANSACTION</li>
 * <li>Transaction.REMOVE_UNCONFIRMED_TRANSACTIONS</li>
 * </ul>
 */
public class EventRegister extends APIServlet.APIRequestHandler {

    /** EventRegister instance */
    static final EventRegister instance = new EventRegister();

    /** Events registers */
    private static final JSONObject eventsRegistered = new JSONObject();
    static {
        eventsRegistered.put("registered", true);
    }

    /** Mutually exclusive parameters */
    private static final JSONObject exclusiveParams = new JSONObject();
    static {
        exclusiveParams.put("errorCode", 4);
        exclusiveParams.put("errorDescription", "Mutually exclusive 'add' and 'remove'");
    }

    /** Incorrect event */
    private static final JSONObject incorrectEvent = new JSONObject();
    static {
        incorrectEvent.put("errorCode", 4);
        incorrectEvent.put("errorDescription", "Incorrect event name format");
    }

    /** Unknown event */
    private static final JSONObject unknownEvent = new JSONObject();
    static {
        unknownEvent.put("errorCode", 5);
        unknownEvent.put("errorDescription", "Unknown event name");
    }

    /** No events registered */
    private static final JSONObject noEventsRegistered = new JSONObject();
    static {
        noEventsRegistered.put("errorCode", 8);
        noEventsRegistered.put("errorDescription", "No events registered");
    }

    /**
     * Create the EventRegister instance
     */
    private EventRegister() {
        super(new APITag[] {APITag.INFO}, "event", "event", "event", "add", "remove");
    }

    /**
     * Process the EventRegister API request
     *
     * @param   req                 API request
     * @return                      API response
     */
    @Override
    JSONStreamAware processRequest(HttpServletRequest req) {
        JSONObject response = null;
        //
        // Get 'add' and 'remove' parameters
        //
        boolean addEvents = Boolean.valueOf(req.getParameter("add"));
        boolean removeEvents = Boolean.valueOf(req.getParameter("remove"));
        if (addEvents && removeEvents)
            return exclusiveParams;
        //
        // Build the event list from the 'event' parameters
        //
        List<Peers.Event> peerEvents = new ArrayList<>();
        List<BlockchainProcessor.Event> blockEvents = new ArrayList<>();
        List<TransactionProcessor.Event> txEvents = new ArrayList<>();
        String[] params = req.getParameterValues("event");
        if (params == null) {
            peerEvents.addAll(EventListener.peerEvents);
            blockEvents.addAll(EventListener.blockEvents);
            txEvents.addAll(EventListener.txEvents);
        } else {
            for (String param : params) {
                String[] parts = param.split("\\.");
                if (parts.length != 2) {
                    response = incorrectEvent;
                    break;
                }
                boolean eventAdded = false;
                switch (parts[0]) {
                    case "Block":
                        for (BlockchainProcessor.Event event : EventListener.blockEvents) {
                            if (event.name().equals(parts[1])) {
                                blockEvents.add(event);
                                eventAdded = true;
                                break;
                            }
                        }
                        break;
                    case "Peer":
                        for (Peers.Event event : EventListener.peerEvents) {
                            if (event.name().equals(parts[1])) {
                                peerEvents.add(event);
                                eventAdded = true;
                                break;
                            }
                        }
                        break;
                    case "Transaction":
                        for (TransactionProcessor.Event event : EventListener.txEvents) {
                            if (event.name().equals(parts[1])) {
                                txEvents.add(event);
                                eventAdded = true;
                                break;
                            }
                        }
                        break;
                }
                if (!eventAdded) {
                    response = unknownEvent;
                    break;
                }
            }
        }
        //
        // Register the event listener
        //
        if (response == null) {
            try {
                if (addEvents || removeEvents) {
                    EventListener listener = EventListener.eventListeners.get(req.getRemoteAddr());
                    if (listener != null) {
                        if (addEvents)
                            listener.addEvents(peerEvents, blockEvents, txEvents);
                        else
                            listener.removeEvents(peerEvents, blockEvents, txEvents);
                        response = eventsRegistered;
                    } else {
                        response = noEventsRegistered;
                    }
                } else {
                    EventListener listener = new EventListener(req.getRemoteAddr());
                    listener.activateListener(peerEvents, blockEvents, txEvents);
                    response = eventsRegistered;
                }
            } catch (EventListenerException exc) {
                response = new JSONObject();
                response.put("errorCode", 7);
                response.put("errorDescription", "Unable to register events: "+exc.getMessage());
            }
        }
        //
        // Return the response
        //
        return response;
    }

    @Override
    final boolean requirePost() {
        return true;
    }

}
