'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const SESSION_ID = 'concierge-aria-session';
const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Welcome to ConciergeX! I'm Aria, your personal concierge. How can I help you find the perfect luxury service today?",
  timestamp: new Date(),
};

const ease = [0.22, 1, 0.36, 1] as const;

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                         */
/* -------------------------------------------------------------------------- */

const panelVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.92,
    transition: { duration: 0.3, ease },
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease },
  },
  exit: {
    opacity: 0,
    y: 30,
    scale: 0.95,
    transition: { duration: 0.25, ease },
  },
};

const messageVariants = {
  initial: { opacity: 0, y: 12, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

const buttonFloatKeyframes = {
  y: [0, -6, 0],
};
const buttonFloatTransition = {
  duration: 3,
  repeat: Infinity,
  ease: 'easeInOut' as const,
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

let messageIdCounter = 0;
function generateId(): string {
  messageIdCounter += 1;
  return `msg-${Date.now()}-${messageIdCounter}`;
}

/* -------------------------------------------------------------------------- */
/*  Typing indicator                                                           */
/* -------------------------------------------------------------------------- */

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="flex justify-start"
    >
      <div className="rounded-2xl rounded-bl-md border-l-[3px] border-l-gold/20 bg-surface px-5 py-3.5">
        <div className="flex items-center gap-1.5">
          <span className="typing-dot size-2 rounded-full bg-gold/60" />
          <span className="typing-dot size-2 rounded-full bg-gold/60" />
          <span className="typing-dot size-2 rounded-full bg-gold/60" />
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main AIConcierge component                                                 */
/* -------------------------------------------------------------------------- */

export function AIConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  /* ---------------------------------------------------------------------- */
  /*  Auto-scroll to bottom                                                   */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  /* ---------------------------------------------------------------------- */
  /*  Focus input when panel opens                                            */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (isOpen) {
      // Small delay to allow animation to start
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  /* ---------------------------------------------------------------------- */
  /*  Send message                                                            */
  /* ---------------------------------------------------------------------- */

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId: SESSION_ID,
        }),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.response ?? data.message ?? 'I appreciate your question. Let me look into that for you.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      // Inline error message within chat
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [inputText, isLoading]);

  /* ---------------------------------------------------------------------- */
  /*  Keydown handler                                                         */
  /* ---------------------------------------------------------------------- */

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  /* ---------------------------------------------------------------------- */
  /*  Render                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <>
      {/* ================================================================== */}
      {/*  Chat Panel                                                         */}
      {/* ================================================================== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-24 right-6 z-50 flex flex-col overflow-hidden rounded-2xl border border-gold/15 bg-card/95 shadow-2xl shadow-black/50 backdrop-blur-xl"
            style={{
              width: '380px',
              maxWidth: 'calc(100vw - 2rem)',
              height: '520px',
              maxHeight: '70vh',
            }}
          >
            {/* -------------------- Header -------------------- */}
            <div className="flex shrink-0 items-center justify-between border-b border-gold/10 bg-gradient-to-r from-gold/[0.06] to-transparent px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-dark shadow-md shadow-gold/20">
                  <Sparkles className="size-4 text-background" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">
                    <span className="text-gold-gradient">Aria</span>
                    <span className="ml-1.5 text-muted-foreground">- AI Concierge</span>
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                      <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-[11px] text-emerald-400">Online</span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-gold/10 hover:text-gold"
                aria-label="Close chat"
              >
                <X className="size-4" />
              </motion.button>
            </div>

            {/* -------------------- Messages -------------------- */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-4 py-4"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#333 #1A1A1A',
              }}
            >
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      variants={messageVariants}
                      initial="initial"
                      animate="animate"
                      className={`flex ${
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {msg.isError ? (
                        /* ---- Inline error toast ---- */
                        <div className="w-full rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-center">
                          <p className="text-xs font-medium text-red-400">
                            Something went wrong. Please try again.
                          </p>
                        </div>
                      ) : msg.role === 'user' ? (
                        /* ---- User bubble ---- */
                        <div className="max-w-[80%]">
                          <div className="rounded-2xl rounded-br-md bg-gradient-to-r from-gold/20 to-gold/10 px-4 py-2.5">
                            <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words text-foreground">
                              {msg.content}
                            </p>
                          </div>
                          <p className="mt-1 text-right text-[10px] text-muted-foreground/60">
                            {formatTimestamp(msg.timestamp)}
                          </p>
                        </div>
                      ) : (
                        /* ---- AI bubble ---- */
                        <div className="max-w-[85%]">
                          <div className="rounded-2xl rounded-bl-md border-l-[3px] border-l-gold/20 bg-surface px-4 py-2.5">
                            <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words text-foreground/90">
                              {msg.content}
                            </p>
                          </div>
                          <div className="mt-1 flex items-center gap-1.5">
                            <Sparkles className="size-2.5 text-gold/40" />
                            <p className="text-[10px] text-muted-foreground/60">
                              {formatTimestamp(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing indicator */}
                <AnimatePresence>
                  {isLoading && <TypingIndicator />}
                </AnimatePresence>

                <div ref={chatEndRef} />
              </div>
            </div>

            {/* -------------------- Input -------------------- */}
            <div className="shrink-0 border-t border-gold/10 bg-gradient-to-t from-card/100 to-card/80 px-3 py-3">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Aria anything..."
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-gold/15 bg-surface px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground transition-all focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20 disabled:opacity-50"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleSend}
                  disabled={!inputText.trim() || isLoading}
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background shadow-lg shadow-gold/20 transition-all hover:shadow-gold/40 hover:brightness-110 disabled:opacity-30 disabled:shadow-none"
                  aria-label="Send message"
                >
                  <Send className="size-4" />
                </motion.button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-muted-foreground/40">
                Powered by Aria AI &middot; ConciergeX
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================== */}
      {/*  Floating Button                                                    */}
      {/* ================================================================== */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-dark shadow-xl shadow-gold/30 transition-shadow hover:shadow-2xl hover:shadow-gold/40"
            aria-label="Open AI Concierge"
          >
            {/* Floating animation */}
            <motion.span
              animate={buttonFloatKeyframes}
              transition={buttonFloatTransition}
              className="flex items-center justify-center"
            >
              <Sparkles className="size-6 text-background" />
            </motion.span>

            {/* "AI" badge */}
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-background text-[9px] font-bold tracking-wide text-gold shadow-md ring-2 ring-gold/30">
              AI
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
