'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type Booking, type User } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Send,
  MessageSquare,
  Clock,
  Check,
  CheckCheck,
  Diamond,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSocket, type SocketMessage } from '@/hooks/useSocket';
import { formatDistanceToNow } from 'date-fns';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface Conversation {
  booking: Booking;
  otherUser: User;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  bookingId?: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender?: { id: string; name: string; avatar?: string };
  receiver?: { id: string; name: string; avatar?: string };
}

/* -------------------------------------------------------------------------- */
/*  Animation helpers                                                         */
/* -------------------------------------------------------------------------- */

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const slideInRight = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, x: 24, transition: { duration: 0.2 } },
};

const slideInLeft = {
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, x: -24, transition: { duration: 0.2 } },
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return '';
  }
}

function formatMessageTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function getInitial(name: string): string {
  return name?.charAt(0)?.toUpperCase() ?? '?';
}

/* -------------------------------------------------------------------------- */
/*  Conversation item                                                         */
/* -------------------------------------------------------------------------- */

function ConversationItem({
  conversation,
  isSelected,
  unreadCount,
  onClick,
}: {
  conversation: Conversation;
  isSelected: boolean;
  unreadCount: number;
  onClick: () => void;
}) {
  const { otherUser, lastMessage } = conversation;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
      whileTap={{ scale: 0.98 }}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left transition-all ${
        isSelected
          ? 'bg-gradient-to-r from-gold/10 via-gold/5 to-transparent border border-gold/20'
          : 'border border-transparent hover:border-gold/10'
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar className="size-11 border border-gold/20">
          <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
          <AvatarFallback className="bg-gradient-to-br from-gold-dark to-gold text-sm font-bold text-black">
            {getInitial(otherUser.name)}
          </AvatarFallback>
        </Avatar>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-black">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-white">
            {otherUser.name}
          </span>
          {lastMessage && (
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {formatTime(lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="truncate text-xs text-muted-foreground">
            {lastMessage
              ? lastMessage.content.length > 40
                ? lastMessage.content.slice(0, 40) + '...'
                : lastMessage.content
              : `Service: ${conversation.booking.service?.title ?? 'Booking'}`}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Message bubble                                                             */
/* -------------------------------------------------------------------------- */

function MessageBubble({
  message,
  isOwn,
}: {
  message: Message;
  isOwn: boolean;
}) {
  return (
    <motion.div
      variants={isOwn ? slideInRight : slideInLeft}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`relative max-w-[75%] rounded-2xl px-4 py-2.5 sm:max-w-[65%] ${
          isOwn
            ? 'rounded-br-md bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black'
            : 'rounded-bl-md border border-gold/10 bg-surface text-white'
        }`}
      >
        <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <div
          className={`mt-1.5 flex items-center gap-1.5 ${
            isOwn ? 'justify-end' : 'justify-start'
          }`}
        >
          <span
            className={`text-[10px] ${
              isOwn ? 'text-black/50' : 'text-muted-foreground'
            }`}
          >
            {formatMessageTime(message.createdAt)}
          </span>
          {isOwn && (
            message.read ? (
              <CheckCheck className="size-3 text-black/50" />
            ) : (
              <Check className="size-3 text-black/40" />
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Empty states                                                               */
/* -------------------------------------------------------------------------- */

function EmptyChatSelect() {
  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center"
    >
      <div className="flex size-20 items-center justify-center rounded-full bg-gold/10">
        <MessageSquare className="size-9 text-gold" />
      </div>
      <div>
        <h3 className="font-serif text-xl font-semibold text-white">
          Select a Conversation
        </h3>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Choose a conversation from the sidebar to start messaging
        </p>
      </div>
    </motion.div>
  );
}

function NoConversations() {
  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center"
    >
      <div className="flex size-20 items-center justify-center rounded-full bg-gold/5">
        <Diamond className="size-8 text-gold/40" />
      </div>
      <div>
        <h3 className="font-serif text-xl font-semibold text-white">
          No Conversations Yet
        </h3>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Book a service and start a conversation with a provider to see messages here
        </p>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Chat sidebar skeleton                                                      */
/* -------------------------------------------------------------------------- */

function SidebarSkeleton() {
  return (
    <div className="space-y-2 p-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl p-3">
          <Skeleton className="size-11 rounded-full bg-surface" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-28 rounded bg-surface" />
            <Skeleton className="h-3 w-40 rounded bg-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Messages skeleton                                                          */
/* -------------------------------------------------------------------------- */

function MessagesSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-3 p-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
        >
          <Skeleton
            className={`h-14 rounded-2xl ${
              i % 2 === 0 ? 'w-48 rounded-br-md' : 'w-56 rounded-bl-md'
            } bg-surface`}
          />
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main ChatPage                                                              */
/* -------------------------------------------------------------------------- */

export function ChatPage() {
  const {
    user,
    selectedChatUser,
    setSelectedChatUser,
    setView,
    selectedBooking,
    setSelectedBooking,
  } = useAppStore();

  const isMobile = useIsMobile();

  // Socket.io integration
  const { isConnected, sendMessage: socketSendMessage, emitTyping, onNewMessage, onTyping } = useSocket({
    userId: user?.id,
    enabled: !!user?.id,
  });

  // UI state
  const [showChat, setShowChat] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Typing indicator state — tracks which users are typing in the current conversation
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingEmitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------------------------------------------------------------------- */
  /*  Socket: Listen for new incoming messages                                */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onNewMessage((msg: SocketMessage) => {
      // Add the new message to state (avoid duplicates)
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg as Message];
      });

      // Refresh conversation list to update last message preview
      fetchConversations();
    });

    return () => {
      unsubscribe();
    };
  }, [user, onNewMessage]);

  /* ---------------------------------------------------------------------- */
  /*  Socket: Listen for typing indicators                                    */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onTyping((data: { senderId: string }) => {
      if (!selectedChatUser || data.senderId !== selectedChatUser.id) return;

      // Show typing indicator
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.add(data.senderId);
        return next;
      });

      // Auto-clear typing after 2 seconds of no further events
      const existingTimer = typingTimeoutRef.current.get(data.senderId);
      if (existingTimer) clearTimeout(existingTimer);

      const timer = setTimeout(() => {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(data.senderId);
          return next;
        });
        typingTimeoutRef.current.delete(data.senderId);
      }, 2000);

      typingTimeoutRef.current.set(data.senderId, timer);
    });

    return () => {
      unsubscribe();
      // Clear all typing timeouts on unmount
      typingTimeoutRef.current.forEach((timer) => clearTimeout(timer));
      typingTimeoutRef.current.clear();
    };
  }, [user, selectedChatUser, onTyping]);

  /* ---------------------------------------------------------------------- */
  /*  Fetch conversations (derived from bookings)                             */
  /* ---------------------------------------------------------------------- */

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingConversations(true);

      // Fetch bookings where user is client or provider
      const [clientRes, providerRes] = await Promise.all([
        fetch(`/api/bookings?clientId=${user.id}`),
        fetch(`/api/bookings?providerId=${user.id}`),
      ]);

      const clientData = clientRes.ok ? await clientRes.json() : { bookings: [] };
      const providerData = providerRes.ok ? await providerRes.json() : { bookings: [] };

      const allBookings: Booking[] = [
        ...(clientData.bookings ?? []),
        ...(providerData.bookings ?? []),
      ];

      // Deduplicate bookings by id
      const seen = new Set<string>();
      const uniqueBookings = allBookings.filter((b) => {
        if (seen.has(b.id)) return false;
        seen.add(b.id);
        return true;
      });

      // Build conversations: one per unique other user
      const userMap = new Map<string, Conversation>();
      for (const booking of uniqueBookings) {
        const isClient = booking.clientId === user.id;
        const otherUser = isClient ? booking.provider : booking.client;
        if (!otherUser) continue;

        const key = otherUser.id;
        const existing = userMap.get(key);

        if (!existing || new Date(booking.createdAt) > new Date(existing.booking.createdAt)) {
          userMap.set(key, { booking, otherUser });
        }
      }

      // For each conversation, try to get last message
      const convos = Array.from(userMap.values());
      const enrichedConversations = await Promise.all(
        convos.map(async (conv) => {
          try {
            const res = await fetch(
              `/api/messages?senderId=${user.id}&receiverId=${conv.otherUser.id}`
            );
            if (res.ok) {
              const data = await res.json();
              const msgs: Message[] = data.messages ?? [];
              if (msgs.length > 0) {
                return {
                  ...conv,
                  lastMessage: {
                    content: msgs[msgs.length - 1].content,
                    createdAt: msgs[msgs.length - 1].createdAt,
                  },
                };
              }
            }
          } catch {
            // Ignore
          }
          return conv;
        })
      );

      // Sort by last message time (most recent first)
      enrichedConversations.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt ?? a.booking.createdAt;
        const bTime = b.lastMessage?.createdAt ?? b.booking.createdAt;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      setConversations(enrichedConversations);
    } catch {
      // Silently fail
    } finally {
      setLoadingConversations(false);
    }
  }, [user]);

  /* ---------------------------------------------------------------------- */
  /*  Fetch messages (initial load only)                                      */
  /* ---------------------------------------------------------------------- */

  const fetchMessages = useCallback(
    async (otherUserId: string) => {
      if (!user) return;
      try {
        setLoadingMessages(true);

        // Fetch messages in both directions
        const [sentRes, receivedRes] = await Promise.all([
          fetch(`/api/messages?senderId=${user.id}&receiverId=${otherUserId}`),
          fetch(`/api/messages?senderId=${otherUserId}&receiverId=${user.id}`),
        ]);

        const sentData = sentRes.ok ? await sentRes.json() : { messages: [] };
        const receivedData = receivedRes.ok ? await receivedRes.json() : { messages: [] };

        const allMessages: Message[] = [
          ...(sentData.messages ?? []),
          ...(receivedData.messages ?? []),
        ];

        // Deduplicate and sort
        const seen = new Set<string>();
        const unique = allMessages.filter((m) => {
          if (seen.has(m.id)) return false;
          seen.add(m.id);
          return true;
        });

        unique.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        setMessages(unique);

        // Mark unread received messages as read
        const unreadIds = unique
          .filter((m) => m.receiverId === user.id && !m.read)
          .map((m) => m.id);

        if (unreadIds.length > 0) {
          fetch('/api/messages', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: unreadIds }),
          }).catch(() => {});
        }
      } catch {
        // Silently fail
      } finally {
        setLoadingMessages(false);
      }
    },
    [user]
  );

  /* ---------------------------------------------------------------------- */
  /*  Send message via Socket.io (replaces REST API call)                     */
  /* ---------------------------------------------------------------------- */

  const sendMessage = useCallback(async () => {
    if (!user || !selectedChatUser || !newMessage.trim() || sendingMessage) return;

    const content = newMessage.trim();
    setNewMessage('');
    setSendingMessage(true);

    // Send via socket — the server persists to DB and broadcasts
    if (isConnected) {
      socketSendMessage({
        senderId: user.id,
        receiverId: selectedChatUser.id,
        bookingId: selectedBooking?.id,
        content,
      });
      // The message-sent and new-message events will arrive via socket
      // and update the messages state. We also optimistically refresh conversations.
      setSendingMessage(false);
      fetchConversations();
      inputRef.current?.focus();
      return;
    }

    // Fallback: if socket not connected, use REST API (same as before)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: selectedChatUser.id,
          bookingId: selectedBooking?.id,
          content,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newMsg = data.message as Message;
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        fetchConversations();
      }
    } catch {
      // Restore message on failure
      setNewMessage(content);
    } finally {
      setSendingMessage(false);
      inputRef.current?.focus();
    }
  }, [user, selectedChatUser, newMessage, sendingMessage, selectedBooking?.id, fetchConversations, isConnected, socketSendMessage]);

  /* ---------------------------------------------------------------------- */
  /*  Handle typing — emit debounced (1 second)                               */
  /* ---------------------------------------------------------------------- */

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewMessage(e.target.value);

      if (!user || !selectedChatUser) return;

      // Debounce typing emission to 1 second
      if (typingEmitTimerRef.current) {
        clearTimeout(typingEmitTimerRef.current);
      }

      typingEmitTimerRef.current = setTimeout(() => {
        if (isConnected) {
          emitTyping({
            senderId: user.id,
            receiverId: selectedChatUser.id,
          });
        }
      }, 1000);
    },
    [user, selectedChatUser, isConnected, emitTyping]
  );

  /* ---------------------------------------------------------------------- */
  /*  Auto scroll                                                              */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  /* ---------------------------------------------------------------------- */
  /*  Select conversation                                                      */
  /* ---------------------------------------------------------------------- */

  const handleSelectConversation = useCallback(
    (conv: Conversation) => {
      setSelectedChatUser(conv.otherUser);
      setSelectedBooking(conv.booking);
      if (isMobile) setShowChat(true);
    },
    [setSelectedChatUser, setSelectedBooking, isMobile]
  );

  /* ---------------------------------------------------------------------- */
  /*  Back button (mobile)                                                     */
  /* ---------------------------------------------------------------------- */

  const handleBack = useCallback(() => {
    setShowChat(false);
  }, []);

  /* ---------------------------------------------------------------------- */
  /*  Keyboard submit                                                          */
  /* ---------------------------------------------------------------------- */

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  /* ---------------------------------------------------------------------- */
  /*  Load conversations on mount                                              */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  /* ---------------------------------------------------------------------- */
  /*  Load messages when selectedChatUser changes (initial load only — no polling) */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (selectedChatUser) {
      fetchMessages(selectedChatUser.id);
    }
  }, [selectedChatUser, fetchMessages]);

  /* ---------------------------------------------------------------------- */
  /*  Unread count per conversation                                            */
  /* ---------------------------------------------------------------------- */

  const getUnreadCount = useCallback(
    (conv: Conversation) => {
      return messages.filter(
        (m) =>
          m.senderId === conv.otherUser.id &&
          m.receiverId === user?.id &&
          !m.read
      ).length;
    },
    [messages, user]
  );

  // Determine if the other user is currently typing
  const isOtherUserTyping = selectedChatUser
    ? typingUsers.has(selectedChatUser.id)
    : false;

  /* ---------------------------------------------------------------------- */
  /*  Render                                                                  */
  /* ---------------------------------------------------------------------- */

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Please sign in to access messages</p>
      </div>
    );
  }

  // Find the active conversation for the chat header
  const activeConversation = conversations.find(
    (c) => c.otherUser.id === selectedChatUser?.id
  );

  return (
    <div className="flex h-[calc(100dvh-80px)] overflow-hidden rounded-2xl border border-gold/10 bg-[#0A0A0A]">
      {/* ======================== LEFT PANEL: Conversations ======================== */}
      <AnimatePresence mode="wait">
        {(isMobile ? !showChat : true) && (
          <motion.div
            key="sidebar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`flex shrink-0 flex-col border-r border-gold/10 bg-[#0d0d0d] ${
              isMobile ? 'w-full' : 'w-80 lg:w-96'
            }`}
          >
            {/* Sidebar header */}
            <div className="flex items-center justify-between border-b border-gold/10 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-gold/10">
                  <MessageSquare className="size-4.5 text-gold" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-semibold text-white">
                    Messages
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              {/* Connection status indicator */}
              <div
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${
                  isConnected
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {isConnected ? (
                  <Wifi className="size-3" />
                ) : (
                  <WifiOff className="size-3" />
                )}
                {isConnected ? 'Live' : 'Offline'}
              </div>
            </div>

            {/* Conversation list */}
            <ScrollArea className="flex-1">
              {loadingConversations ? (
                <SidebarSkeleton />
              ) : conversations.length === 0 ? (
                <NoConversations />
              ) : (
                <div className="space-y-1 p-2">
                  {conversations.map((conv) => (
                    <ConversationItem
                      key={conv.otherUser.id}
                      conversation={conv}
                      isSelected={selectedChatUser?.id === conv.otherUser.id}
                      unreadCount={getUnreadCount(conv)}
                      onClick={() => handleSelectConversation(conv)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================== RIGHT PANEL: Chat ======================== */}
      <AnimatePresence mode="wait">
        {(isMobile ? showChat : true) && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-1 flex-col bg-[#0A0A0A]"
          >
            {selectedChatUser ? (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 border-b border-gold/10 px-4 py-3">
                  {/* Back button (mobile only) */}
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleBack}
                      className="shrink-0 text-muted-foreground hover:text-gold"
                    >
                      <ArrowLeft className="size-5" />
                    </Button>
                  )}

                  <Avatar className="size-10 border border-gold/20">
                    <AvatarImage
                      src={selectedChatUser.avatar}
                      alt={selectedChatUser.name}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-gold-dark to-gold text-sm font-bold text-black">
                      {getInitial(selectedChatUser.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-white">
                        {selectedChatUser.name}
                      </span>
                      {selectedChatUser.verified && (
                        <Badge
                          variant="outline"
                          className="shrink-0 border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0 text-[10px] text-emerald-400"
                        >
                          Verified
                        </Badge>
                      )}
                    </div>
                    {isOtherUserTyping ? (
                      <p className="truncate text-xs text-gold animate-pulse">
                        Typing...
                      </p>
                    ) : activeConversation?.booking?.service ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {activeConversation.booking.service.title}
                      </p>
                    ) : null}
                  </div>

                  {/* Status dot */}
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex size-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                      <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-[11px] text-muted-foreground">Online</span>
                  </div>
                </div>

                {/* Messages area */}
                {loadingMessages ? (
                  <MessagesSkeleton />
                ) : (
                  <ScrollArea className="flex-1 px-4 py-4">
                    <div className="mx-auto max-w-3xl space-y-3">
                      {/* Date separator */}
                      {messages.length > 0 && (
                        <div className="flex items-center gap-3 py-2">
                          <div className="h-px flex-1 bg-gold/10" />
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Clock className="size-3" />
                            {formatTime(messages[0].createdAt)}
                          </div>
                          <div className="h-px flex-1 bg-gold/10" />
                        </div>
                      )}

                      {/* Messages */}
                      <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                          <MessageBubble
                            key={msg.id}
                            message={msg}
                            isOwn={msg.senderId === user.id}
                          />
                        ))}
                      </AnimatePresence>

                      {/* Typing indicator for other user */}
                      {isOtherUserTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="flex justify-start"
                        >
                          <div className="rounded-2xl rounded-bl-md border border-gold/10 bg-surface px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="typing-dot size-2 rounded-full bg-gold/60" />
                              <span className="typing-dot size-2 rounded-full bg-gold/60" />
                              <span className="typing-dot size-2 rounded-full bg-gold/60" />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Sending indicator */}
                      {sendingMessage && !isOtherUserTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="flex justify-end"
                        >
                          <div className="rounded-2xl rounded-br-md bg-gradient-to-r from-gold-dark via-gold to-gold-light px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="typing-dot size-2 rounded-full bg-black/30" />
                              <span className="typing-dot size-2 rounded-full bg-black/30" />
                              <span className="typing-dot size-2 rounded-full bg-black/30" />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {messages.length === 0 && !isOtherUserTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="py-16 text-center"
                        >
                          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-gold/5">
                            <MessageSquare className="size-6 text-gold/40" />
                          </div>
                          <p className="mt-3 text-sm text-muted-foreground">
                            No messages yet. Say hello!
                          </p>
                        </motion.div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                )}

                {/* Message input */}
                <div className="border-t border-gold/10 p-3">
                  <div className="mx-auto flex max-w-3xl items-center gap-2">
                    <Input
                      ref={inputRef}
                      value={newMessage}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="h-11 flex-1 rounded-xl border-gold/15 bg-surface text-sm text-white placeholder-muted-foreground focus-visible:ring-gold/30"
                      disabled={sendingMessage}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black shadow-lg shadow-gold/20 transition-all hover:shadow-gold/40 hover:brightness-110 disabled:opacity-40 disabled:shadow-none"
                    >
                      <Send className="size-4.5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <EmptyChatSelect />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
