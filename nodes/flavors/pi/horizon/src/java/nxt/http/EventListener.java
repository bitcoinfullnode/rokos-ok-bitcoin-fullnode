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

import nxt.Block;
import nxt.BlockchainProcessor;
import nxt.Db;
import nxt.Nxt;
import nxt.Transaction;
import nxt.TransactionProcessor;
import nxt.db.TransactionalDb;
import nxt.peer.Peer;
import nxt.peer.Peers;
import nxt.util.Listener;
import nxt.util.Logger;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import javax.servlet.AsyncContext;
import javax.servlet.AsyncEvent;
import javax.servlet.AsyncListener;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.locks.ReentrantLock;

/**
 * EventListener listens for peer, block and transaction events as
 * specified by the EventRegister API.  Events are held until
 * an EventWait API request is received.  All pending events
 * are then returned to the application.
 *
 * Event registrations are discarded if an EventWait API request
 * has not been received within nxt.apiEventTimeout seconds.
 *
 * The maximum number of event users is specified by nxt.apiMaxEventUsers.
 */
class EventListener implements Runnable, AsyncListener, TransactionalDb.TransactionCallback {

    /** Maximum event users */
    static final int maxEventUsers = Nxt.getIntProperty("nxt.apiMaxEventUsers");

    /** Event registration timeout (seconds) */
    static final int eventTimeout = Math.max(Nxt.getIntProperty("nxt.apiEventTimeout"), 15);

    /** Active event users */
    static final Map<String, EventListener> eventListeners = new ConcurrentHashMap<>();

    /** Thread to clean up inactive event registrations */
    private static final Timer eventTimer = new Timer();
    static {
        eventTimer.schedule(new TimerTask() {
            @Override
            public void run() {
                long oldestTime = System.currentTimeMillis() - eventTimeout*1000;
                eventListeners.values().forEach(listener -> {
                    if (listener.getTimestamp() < oldestTime) {
                        listener.deactivateListener();
                    }
                });
            }
        }, eventTimeout*500, eventTimeout*500);
    }

    /** Thread pool for asynchronous completions */
    private static final ExecutorService threadPool = Executors.newCachedThreadPool();

    /** Peer events - update API comments for EventRegister and EventWait if changed */
    static final List<Peers.Event> peerEvents = new ArrayList<>();
    static {
        peerEvents.add(Peers.Event.ADD_INBOUND);
        peerEvents.add(Peers.Event.ADDED_ACTIVE_PEER);
        peerEvents.add(Peers.Event.BLACKLIST);
        peerEvents.add(Peers.Event.CHANGED_ACTIVE_PEER);
        peerEvents.add(Peers.Event.DEACTIVATE);
        peerEvents.add(Peers.Event.NEW_PEER);
        peerEvents.add(Peers.Event.REMOVE);
        peerEvents.add(Peers.Event.REMOVE_INBOUND);
        peerEvents.add(Peers.Event.UNBLACKLIST);
    }

    /** Block events - update API comments for EventRegister and EventWait if changed */
    static final List<BlockchainProcessor.Event> blockEvents = new ArrayList<>();
    static {
        blockEvents.add(BlockchainProcessor.Event.BLOCK_GENERATED);
        blockEvents.add(BlockchainProcessor.Event.BLOCK_POPPED);
        blockEvents.add(BlockchainProcessor.Event.BLOCK_PUSHED);
    }

    /** Transaction events - update API comments for EventRegister and EventWait if changed */
    static final List<TransactionProcessor.Event> txEvents = new ArrayList<>();
    static {
        txEvents.add(TransactionProcessor.Event.ADDED_CONFIRMED_TRANSACTIONS);
        txEvents.add(TransactionProcessor.Event.ADDED_UNCONFIRMED_TRANSACTIONS);
        txEvents.add(TransactionProcessor.Event.REJECT_PHASED_TRANSACTION);
        txEvents.add(TransactionProcessor.Event.RELEASE_PHASED_TRANSACTION);
        txEvents.add(TransactionProcessor.Event.REMOVED_UNCONFIRMED_TRANSACTIONS);
    }

    /** Application IP address */
    private final String address;

    /** Activity timestamp */
    private long timestamp;

    /** Activity lock */
    private final ReentrantLock lock = new ReentrantLock();

    /** Event listener has been deactivated */
    private volatile boolean deactivated;

    /** Event wait aborted */
    private boolean aborted;

    /** Event thread dispatched */
    private boolean dispatched;

    /** Peer event listeners */
    private final List<PeerEventListener> peerListeners = new ArrayList<>();

    /** Block event listeners */
    private final List<BlockEventListener> blockListeners = new ArrayList<>();

    /** Transaction event listeners */
    private final List<TransactionEventListener> txListeners = new ArrayList<>();

    /** Pending events */
    private final List<PendingEvent> pendingEvents = new ArrayList<>();

    /** Database events */
    private final List<PendingEvent> dbEvents = new ArrayList<>();

    /** Pending waits */
    private final List<AsyncContext> pendingWaits = new ArrayList<>();

    /**
     * Create an event listener
     *
     * @param   address             Application IP address
     */
    EventListener(String address) {
        this.address = address;
    }

    /**
     * Activate the event listener
     *
     * Event listeners will be added for the specified peer, block and transaction events.
     *
     * @param   peerEvents              Peer event list
     * @param   blockEvents             Block event list
     * @param   txEvents                Transaction event list
     * @throws  EventListenerException  Unable to activate event listeners
     */
    void activateListener(List<Peers.Event> peerEvents, List<BlockchainProcessor.Event> blockEvents,
                                        List<TransactionProcessor.Event> txEvents)
                                        throws EventListenerException {
        if (deactivated)
            throw new EventListenerException("Event listener deactivated");
        if (eventListeners.size() >= maxEventUsers && eventListeners.get(address) == null)
            throw new EventListenerException(String.format("Too many API event users: Maximum %d", maxEventUsers));
        //
        // Start listening for events
        //
        addEvents(peerEvents, blockEvents, txEvents);
        //
        // Add this event listener to the active list
        //
        EventListener oldListener = eventListeners.get(address);
        if (oldListener != null)
            oldListener.deactivateListener();
        eventListeners.put(address, this);
        Logger.logDebugMessage(String.format("Event listener activated for %s", address));
    }

    /**
     * Add events to the event list
     *
     * @param   peerEvents              Peer event list
     * @param   blockEvents             Block event list
     * @param   txEvents                Transaction event list
     */
    void addEvents(List<Peers.Event> peerEvents, List<BlockchainProcessor.Event> blockEvents,
                                        List<TransactionProcessor.Event> txEvents) {
        BlockchainProcessor blockProcessor = Nxt.getBlockchainProcessor();
        TransactionProcessor txProcessor = Nxt.getTransactionProcessor();
        lock.lock();
        try {
            if (deactivated)
                return;
            peerEvents.forEach(event -> {
                PeerEventListener listener = new PeerEventListener(event);
                if (!peerListeners.contains(listener)) {
                    peerListeners.add(listener);
                    Peers.addListener(listener, event);
                }
            });
            blockEvents.forEach(event -> {
                BlockEventListener listener = new BlockEventListener(event);
                if (!blockListeners.contains(listener)) {
                    blockListeners.add(listener);
                    blockProcessor.addListener(listener, event);
                }
            });
            txEvents.forEach(event -> {
                TransactionEventListener listener = new TransactionEventListener(event);
                if (!txListeners.contains(listener)) {
                    txListeners.add(listener);
                    txProcessor.addListener(listener, event);
                }
            });
        } finally {
            lock.unlock();
        }
    }

    /**
     * Remove events from the event list
     *
     * @param   peerEvents              Peer event list
     * @param   blockEvents             Block event list
     * @param   txEvents                Transaction event list
     */
    void removeEvents(List<Peers.Event> peerEvents, List<BlockchainProcessor.Event> blockEvents,
                                        List<TransactionProcessor.Event> txEvents) {
        BlockchainProcessor blockProcessor = Nxt.getBlockchainProcessor();
        TransactionProcessor txProcessor = Nxt.getTransactionProcessor();
        lock.lock();
        try {
            if (deactivated)
                return;
            peerEvents.forEach(event -> {
                Iterator<PeerEventListener> peerIt = peerListeners.iterator();
                while (peerIt.hasNext()) {
                    PeerEventListener peerListener = peerIt.next();
                    if (peerListener.getEvent() == event) {
                        Peers.removeListener(peerListener, event);
                        peerIt.remove();
                    }
                }
            });
            blockEvents.forEach(event -> {
                Iterator<BlockEventListener> blockIt = blockListeners.iterator();
                while (blockIt.hasNext()) {
                    BlockEventListener blockListener = blockIt.next();
                    if (blockListener.getEvent() == event) {
                        blockProcessor.removeListener(blockListener, event);
                        blockIt.remove();
                    }
                }
            });
            txEvents.forEach(event -> {
                Iterator<TransactionEventListener> txIt = txListeners.iterator();
                while (txIt.hasNext()) {
                    TransactionEventListener txListener = txIt.next();
                    if (txListener.getEvent() == event) {
                        txProcessor.removeListener(txListener, event);
                        txIt.remove();
                    }
                }
            });
            //
            // Deactivate the listeners if there are no events remaining
            //
            if (peerListeners.isEmpty() && blockListeners.isEmpty() && txListeners.isEmpty())
                deactivateListener();
        } finally {
            lock.unlock();
        }
    }

    /**
     * Deactivate the event listener
     */
    void deactivateListener() {
        BlockchainProcessor blockProcessor = Nxt.getBlockchainProcessor();
        TransactionProcessor txProcessor = Nxt.getTransactionProcessor();
        lock.lock();
        try {
            if (deactivated)
                return;
            deactivated = true;
            //
            // Cancel all pending wait requests
            //
            if (!pendingWaits.isEmpty() && !dispatched) {
                dispatched = true;
                threadPool.submit(this);
            }
            //
            // Remove this event listener from the active list
            //
            eventListeners.remove(address);
            //
            // Stop listening for events
            //
            peerListeners.forEach(listener -> Peers.removeListener(listener, listener.getEvent()));
            blockListeners.forEach(listener -> blockProcessor.removeListener(listener, listener.getEvent()));
            txListeners.forEach(listener -> txProcessor.removeListener(listener, listener.getEvent()));
        } finally {
            lock.unlock();
        }
        Logger.logDebugMessage(String.format("Event listener deactivated for %s", address));
    }

    /**
     * Wait for an event
     *
     * @param   req                     HTTP request
     * @param   timeout                 Wait timeout in seconds
     * @return                          List of pending events or null if wait incomplete
     * @throws  EventListenerException  Unable to wait for an event
     */
    List<PendingEvent> eventWait(HttpServletRequest req, long timeout) throws EventListenerException {
        List<PendingEvent> events = null;
        lock.lock();
        try {
            if (deactivated)
                throw new EventListenerException("Event listener deactivated");
            if (!pendingWaits.isEmpty()) {
                //
                // We want only one waiter at a time.  This can happen if the
                // application issues an event wait while it already has an event
                // wait outstanding.  In this case, we will cancel the current wait
                // and replace it with the new wait.
                //
                aborted = true;
                if (!dispatched) {
                    dispatched = true;
                    threadPool.submit(this);
                }
                AsyncContext context = req.startAsync();
                context.addListener(this);
                context.setTimeout(timeout*1000);
                pendingWaits.add(context);
            } else if (!pendingEvents.isEmpty()) {
                //
                // Return immediately if we have a pending event
                //
                events = new ArrayList<>();
                events.addAll(pendingEvents);
                pendingEvents.clear();
                timestamp = System.currentTimeMillis();
            } else {
                //
                // Wait for an event
                //
                aborted = false;
                AsyncContext context = req.startAsync();
                context.addListener(this);
                context.setTimeout(timeout*1000);
                pendingWaits.add(context);
                timestamp = System.currentTimeMillis();
            }
        } finally {
            lock.unlock();
        }
        return events;
    }

    /**
     * Complete the current event wait (Runnable interface)
     */
    @Override
    public void run() {
        lock.lock();
        try {
            dispatched = false;
            while (!pendingWaits.isEmpty() && (aborted || deactivated || !pendingEvents.isEmpty())) {
                AsyncContext context = pendingWaits.remove(0);
                List<PendingEvent> events = new ArrayList<>();
                if (!aborted && !deactivated) {
                    events.addAll(pendingEvents);
                    pendingEvents.clear();
                }
                HttpServletResponse resp = (HttpServletResponse)context.getResponse();
                JSONObject response = EventWait.formatResponse(events);
                response.put("requestProcessingTime", System.currentTimeMillis()-timestamp);
                try (Writer writer = resp.getWriter()) {
                    response.writeJSONString(writer);
                } catch (IOException exc) {
                    Logger.logDebugMessage(String.format("Unable to return API response to %s: %s",
                                                         address, exc.toString()));
                }
                context.complete();
                aborted = false;
                timestamp = System.currentTimeMillis();
            }
        } finally {
            lock.unlock();
        }
    }

    /**
     * Get the activity timestamp
     *
     * @return                      Activity timestamp (milliseconds)
     */
    long getTimestamp() {
        return timestamp;
    }

    /**
     * Async operation completed (AsyncListener interface)
     *
     * @param   event               Async event
     */
    @Override
    public void onComplete(AsyncEvent event) {
    }

    /**
     * Async error detected (AsyncListener interface)
     *
     * @param   event               Async event
     */
    @Override
    public void onError(AsyncEvent event) {
        AsyncContext context = event.getAsyncContext();
        lock.lock();
        try {
            pendingWaits.remove(context);
            context.complete();
            timestamp = System.currentTimeMillis();
            Logger.logDebugMessage("Error detected during event wait for "+address, event.getThrowable());
        } finally {
            lock.unlock();
        }
    }

    /**
     * Async operation started (AsyncListener interface)
     *
     * @param   event               Async event
     */
    @Override
    public void onStartAsync(AsyncEvent event) {
    }

    /**
     * Async operation timeout (AsyncListener interface)
     *
     * @param   event               Async event
     */
    @Override
    public void onTimeout(AsyncEvent event) {
        AsyncContext context = event.getAsyncContext();
        lock.lock();
        try {
            pendingWaits.remove(context);
            JSONObject response = new JSONObject();
            response.put("events", new JSONArray());
            response.put("requestProcessingTime", System.currentTimeMillis()-timestamp);
            try (Writer writer = context.getResponse().getWriter()) {
                response.writeJSONString(writer);
            } catch (IOException exc) {
                Logger.logDebugMessage(String.format("Unable to return API response to %s: %s",
                                                     address, exc.toString()));
            }
            context.complete();
            timestamp = System.currentTimeMillis();
        } finally {
            lock.unlock();
        }
    }

    /**
     * Transaction has been committed
     *
     * Dispatch the pending events for this database transaction
     */
    @Override
    public void commit() {
        Thread thread = Thread.currentThread();
        lock.lock();
        try {
            Iterator<PendingEvent> it = dbEvents.iterator();
            while (it.hasNext()) {
                PendingEvent pendingEvent = it.next();
                if (pendingEvent.getThread() == thread) {
                    it.remove();
                    pendingEvents.add(pendingEvent);
                    if (!pendingWaits.isEmpty() && !dispatched) {
                        dispatched = true;
                        threadPool.submit(EventListener.this);
                    }
                }
            }
        } finally {
            lock.unlock();
        }
    }

    /**
     * Transaction has been rolled back
     *
     * Discard the pending events for this database transaction
     */
    @Override
    public void rollback() {
        Thread thread = Thread.currentThread();
        lock.lock();
        try {
            Iterator<PendingEvent> it = dbEvents.iterator();
            while (it.hasNext()) {
                if (it.next().getThread() == thread)
                    it.remove();
            }
        } finally {
            lock.unlock();
        }
    }

    /**
     * Pending event
     */
    class PendingEvent {

        /** Event name */
        private final String name;

        /** Event identifier */
        private final List<String> idList;

        /** Database thread */
        private Thread thread;

        /**
         * Create a pending event
         *
         * @param   name            Event name
         * @param   id              Event identifier
         */
        public PendingEvent(String name, String id) {
            this.name = name;
            this.idList = new ArrayList<>(1);
            idList.add(id);
        }

        /**
         * Create a pending event
         *
         * @param   name            Event name
         * @param   idList          Event identifier list
         */
        public PendingEvent(String name, List<String> idList) {
            this.name = name;
            this.idList = idList;
        }

        /**
         * Return the event name
         *
         * @return                  Event name
         */
        public String getName() {
            return name;
        }

        /**
         * Return the event identifier list
         *
         * @return                  Event identifier
         */
        public List<String> getIdList() {
            return idList;
        }

        /**
         * Return the database thread
         *
         * @return                  Database thread
         */
        public Thread getThread() {
            return thread;
        }

        /**
         * Set the database thread
         *
         * @param   thread          Database thread
         */
        public void setThread(Thread thread) {
            this.thread = thread;
        }
    }

    /**
     * Peer event listener
     */
    private class PeerEventListener implements Listener<Peer> {

        /** Owning event listener */
        private final EventListener owner;

        /** Peer event */
        private final Peers.Event event;

        /**
         * Create the peer event listener
         *
         * @param   event           Peer event
         */
        public PeerEventListener(Peers.Event event) {
            this.owner = EventListener.this;
            this.event = event;
        }

        /**
         * Return the event for this listener
         *
         * @return                  Peer event
         */
        public Peers.Event getEvent() {
            return event;
        }

        /**
         * Event notification
         *
         * @param   peer            Peer
         */
        @Override
        public void notify(Peer peer) {
            lock.lock();
            try {
                pendingEvents.add(new PendingEvent("Peer."+event.name(), peer.getHost()));
                if (!pendingWaits.isEmpty() && !dispatched) {
                    dispatched = true;
                    threadPool.submit(EventListener.this);
                }
            } finally {
                lock.unlock();
            }
        }

        /**
         * Return the hash code for this event listener
         *
         * @return                  Hash code
         */
        @Override
        public int hashCode() {
            return event.hashCode();
        }

        /**
         * Check if two events listeners are equal
         *
         * @param   obj             Comparison listener
         * @return                  TRUE if the listeners are equal
         */
        @Override
        public boolean equals(Object obj) {
            return (obj!=null && (obj instanceof PeerEventListener) &&
                                    owner==((PeerEventListener)obj).owner &&
                                    event==((PeerEventListener)obj).event);
        }
    }

    /**
     * Block event listener
     */
    private class BlockEventListener implements Listener<Block> {

        /** Owning event listener */
        private final EventListener owner;

        /** Event */
        private final BlockchainProcessor.Event event;

        /**
         * Create the block event listener
         *
         * @param   event           Block event
         */
        public BlockEventListener(BlockchainProcessor.Event event) {
            this.owner = EventListener.this;
            this.event = event;
        }

        /**
         * Return the event for this listener
         *
         * @return                  Block event
         */
        public BlockchainProcessor.Event getEvent() {
            return event;
        }

        /**
         * Event notification
         *
         * @param   block           Block
         */
        @Override
        public void notify(Block block) {
            lock.lock();
            try {
                PendingEvent pendingEvent = new PendingEvent("Block."+event.name(), block.getStringId());
                if (Db.db.isInTransaction()) {
                    pendingEvent.setThread(Thread.currentThread());
                    dbEvents.add(pendingEvent);
                    Db.db.registerCallback(EventListener.this);
                } else {
                    pendingEvents.add(pendingEvent);
                    if (!pendingWaits.isEmpty() && !dispatched) {
                        dispatched = true;
                        threadPool.submit(EventListener.this);
                    }
                }
            } finally {
                lock.unlock();
            }
        }

        /**
         * Return the hash code for this event listener
         *
         * @return                  Hash code
         */
        @Override
        public int hashCode() {
            return event.hashCode();
        }

        /**
         * Check if two events listeners are equal
         *
         * @param   obj             Comparison listener
         * @return                  TRUE if the listeners are equal
         */
        @Override
        public boolean equals(Object obj) {
            return (obj!=null && (obj instanceof BlockEventListener) &&
                                    owner==((BlockEventListener)obj).owner &&
                                    event==((BlockEventListener)obj).event);
        }
    }

    /**
     * Transaction event listener
     */
    private class TransactionEventListener implements Listener<List<? extends Transaction>> {

        /** Owning event listener */
        private final EventListener owner;

        /** Event */
        private final TransactionProcessor.Event event;

        /**
         * Create the transaction event listener
         *
         * @param   event           Transaction event
         */
        public TransactionEventListener(TransactionProcessor.Event event) {
            this.owner = EventListener.this;
            this.event = event;
        }

        /**
         * Return the event for this listener
         *
         * @return                  Transaction event
         */
        public TransactionProcessor.Event getEvent() {
            return event;
        }

        /**
         * Event notification
         *
         * @param   txList          Transaction list
         */
        @Override
        public void notify(List<? extends Transaction> txList) {
            List<String> idList = new ArrayList<>();
            txList.forEach((tx) -> idList.add(tx.getStringId()));
            lock.lock();
            try {
                PendingEvent pendingEvent = new PendingEvent("Transaction."+event.name(), idList);
                if (Db.db.isInTransaction()) {
                    pendingEvent.setThread(Thread.currentThread());
                    dbEvents.add(pendingEvent);
                    Db.db.registerCallback(EventListener.this);
                } else {
                    pendingEvents.add(pendingEvent);
                    if (!pendingWaits.isEmpty() && !dispatched) {
                        dispatched = true;
                        threadPool.submit(EventListener.this);
                    }
                }
            } finally {
                lock.unlock();
            }
        }

        /**
         * Return the hash code for this event listener
         *
         * @return                  Hash code
         */
        @Override
        public int hashCode() {
            return event.hashCode();
        }

        /**
         * Check if two events listeners are equal
         *
         * @param   obj             Comparison listener
         * @return                  TRUE if the listeners are equal
         */
        @Override
        public boolean equals(Object obj) {
            return (obj!=null && (obj instanceof TransactionEventListener) &&
                                    owner==((TransactionEventListener)obj).owner &&
                                    event==((TransactionEventListener)obj).event);
        }
    }

    /**
     * Event exception
     */
    class EventListenerException extends Exception {

        /**
         * Create an event exception with a message
         *
         * @param   message         Exception message
         */
        public EventListenerException(String message) {
            super(message);
        }

        /**
         * Create an event exception with a message and a cause
         *
         * @param   message         Exception message
         * @param   cause           Exception cause
         */
        public EventListenerException(String message, Exception cause) {
            super(message, cause);
        }
    }
}
