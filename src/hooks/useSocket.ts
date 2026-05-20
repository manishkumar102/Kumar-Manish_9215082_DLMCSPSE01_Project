'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface SocketMessage {
  id: string;
  senderId: string;
  receiverId: string;
  bookingId?: string | null;
  content: string;
  read: boolean;
  createdAt: string;
  sender?: { id: string; name: string; avatar?: string };
  receiver?: { id: string; name: string; avatar?: string };
}

interface UseSocketOptions {
  userId: string | null | undefined;
  enabled?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useSocket({ userId, enabled = true }: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Message listeners stored as refs so they don't cause reconnections
  const newMessageListenersRef = useRef<Set<(msg: SocketMessage) => void>>(new Set());
  const typingListenersRef = useRef<Set<(data: { senderId: string }) => void>>(new Set());

  /* ---------------------------------------------------------------------- */
  /*  Connect / Disconnect                                                   */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!userId || !enabled) {
      // Disconnect if user logs out or hook is disabled
      const socket = socketRef.current;
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
        // State is updated via the disconnect event handler
      }
      return;
    }

    // Avoid duplicate connections
    if (socketRef.current?.connected) return;

    const socket = io('/?XTransformPort=3004', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 15000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('[useSocket] Connected:', socket.id);
      // Join the user's personal room
      socket.emit('join-room', userId);
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('[useSocket] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('[useSocket] Connection error:', err.message);
    });

    // Listen for new messages
    socket.on('new-message', (msg: SocketMessage) => {
      newMessageListenersRef.current.forEach((listener) => listener(msg));
    });

    // Listen for typing events
    socket.on('typing', (data: { senderId: string }) => {
      typingListenersRef.current.forEach((listener) => listener(data));
    });

    // Handle reconnection: rejoin room
    socket.on('reconnect', () => {
      console.log('[useSocket] Reconnected, rejoining room');
      socket.emit('join-room', userId);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [userId, enabled]);

  /* ---------------------------------------------------------------------- */
  /*  sendMessage — persist to DB via socket, then server broadcasts         */
  /* ---------------------------------------------------------------------- */

  const sendMessage = useCallback(
    (payload: {
      senderId: string;
      receiverId: string;
      bookingId?: string;
      content: string;
    }) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('send-message', payload);
      } else {
        console.warn('[useSocket] Cannot send message — not connected');
      }
    },
    []
  );

  /* ---------------------------------------------------------------------- */
  /*  emitTyping — broadcast typing indicator to the other user             */
  /* ---------------------------------------------------------------------- */

  const emitTyping = useCallback(
    (payload: { senderId: string; receiverId: string }) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('typing', payload);
      }
    },
    []
  );

  /* ---------------------------------------------------------------------- */
  /*  markRead — mark messages as read in DB                                 */
  /* ---------------------------------------------------------------------- */

  const markRead = useCallback((messageIds: string[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark-read', { messageIds });
    }
  }, []);

  /* ---------------------------------------------------------------------- */
  /*  onNewMessage — subscribe to incoming messages                          */
  /* ---------------------------------------------------------------------- */

  const onNewMessage = useCallback((listener: (msg: SocketMessage) => void) => {
    newMessageListenersRef.current.add(listener);
    // Return unsubscribe function
    return () => {
      newMessageListenersRef.current.delete(listener);
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /*  onTyping — subscribe to typing indicator events                        */
  /* ---------------------------------------------------------------------- */

  const onTyping = useCallback((listener: (data: { senderId: string }) => void) => {
    typingListenersRef.current.add(listener);
    return () => {
      typingListenersRef.current.delete(listener);
    };
  }, []);

  return {
    isConnected,
    sendMessage,
    emitTyping,
    markRead,
    onNewMessage,
    onTyping,
  };
}
