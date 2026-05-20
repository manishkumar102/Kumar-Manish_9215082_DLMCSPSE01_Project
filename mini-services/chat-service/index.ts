import { createServer } from 'http'
import { Server } from 'socket.io'
import { db } from '../../src/lib/db'

// ─── HTTP Server + Socket.io ────────────────────────────────────────────────
const httpServer = createServer()
const io = new Server(httpServer, {
  // DO NOT change the path — Caddy gateway routes based on this
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// ─── Types ──────────────────────────────────────────────────────────────────
interface ConnectedUser {
  userId: string
  socketId: string
}

interface SendMessagePayload {
  senderId: string
  receiverId: string
  bookingId?: string
  content: string
}

interface TypingPayload {
  senderId: string
  receiverId: string
}

interface MarkReadPayload {
  messageIds: string[]
}

// ─── State ──────────────────────────────────────────────────────────────────
const connectedUsers = new Map<string, ConnectedUser>() // socketId → user

const PORT = 3004

// ─── Helpers ────────────────────────────────────────────────────────────────
function getUserRoom(userId: string): string {
  return `user:${userId}`
}

function log(msg: string) {
  console.log(`[ChatService] ${new Date().toISOString()} ${msg}`)
}

// ─── Socket Event Handlers ──────────────────────────────────────────────────
io.on('connection', (socket) => {
  log(`Socket connected: ${socket.id} (total: ${io.engine.clientsCount})`)

  // ── join-room ──────────────────────────────────────────────────────────
  socket.on('join-room', (userId: string) => {
    if (!userId || typeof userId !== 'string') {
      log(`Invalid userId from socket ${socket.id}`)
      return
    }

    // Store the connected user
    const user: ConnectedUser = {
      userId,
      socketId: socket.id,
    }
    connectedUsers.set(socket.id, user)

    // Join the user's personal room so we can target them directly
    socket.join(getUserRoom(userId))

    log(`User ${userId} joined room — online users: ${connectedUsers.size}`)
  })

  // ── send-message ───────────────────────────────────────────────────────
  socket.on('send-message', async (payload: SendMessagePayload) => {
    const { senderId, receiverId, content, bookingId } = payload

    if (!senderId || !receiverId || !content?.trim()) {
      log(`Invalid message payload from socket ${socket.id}`)
      return
    }

    log(`Message from ${senderId} → ${receiverId}: "${content.substring(0, 60)}${content.length > 60 ? '…' : ''}"`)

    try {
      // Validate sender exists
      const sender = await db.user.findUnique({ where: { id: senderId } })
      if (!sender) {
        log(`Sender ${senderId} not found`)
        return
      }

      // Validate receiver exists
      const receiver = await db.user.findUnique({ where: { id: receiverId } })
      if (!receiver) {
        log(`Receiver ${receiverId} not found`)
        return
      }

      // Optionally validate booking
      if (bookingId) {
        const booking = await db.booking.findUnique({ where: { id: bookingId } })
        if (!booking) {
          log(`Booking ${bookingId} not found`)
          return
        }
      }

      // Create message in DB
      const message = await db.message.create({
        data: {
          senderId,
          receiverId,
          bookingId: bookingId || null,
          content: content.trim(),
        },
        include: {
          sender: {
            select: { id: true, name: true, avatar: true },
          },
          receiver: {
            select: { id: true, name: true, avatar: true },
          },
        },
      })

      const messagePayload = {
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        bookingId: message.bookingId,
        content: message.content,
        read: message.read,
        createdAt: message.createdAt.toISOString(),
        sender: message.sender,
        receiver: message.receiver,
      }

      // Emit to receiver's room
      io.to(getUserRoom(receiverId)).emit('new-message', messagePayload)

      // Emit back to sender with DB data (message-sent)
      socket.emit('message-sent', messagePayload)

      log(`Message saved (id: ${message.id}) and delivered`)
    } catch (err) {
      log(`Error saving message to DB: ${err}`)
    }
  })

  // ── typing ─────────────────────────────────────────────────────────────
  socket.on('typing', (payload: TypingPayload) => {
    const { senderId, receiverId } = payload
    if (!senderId || !receiverId) return

    io.to(getUserRoom(receiverId)).emit('typing', { senderId })
  })

  // ── mark-read ──────────────────────────────────────────────────────────
  socket.on('mark-read', async (payload: MarkReadPayload) => {
    const { messageIds } = payload
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) return

    try {
      const result = await db.message.updateMany({
        where: { id: { in: messageIds } },
        data: { read: true },
      })

      log(`${result.count} message(s) marked as read`)
    } catch (err) {
      log(`Error marking messages read: ${err}`)
    }
  })

  // ── disconnect ─────────────────────────────────────────────────────────
  socket.on('disconnect', (reason) => {
    const user = connectedUsers.get(socket.id)

    if (user) {
      connectedUsers.delete(socket.id)
      log(`User ${user.userId} disconnected (${reason}) — online users: ${connectedUsers.size}`)
    } else {
      log(`Socket ${socket.id} disconnected (${reason})`)
    }
  })

  // ── error ──────────────────────────────────────────────────────────────
  socket.on('error', (error) => {
    log(`Socket error (${socket.id}): ${error}`)
  })
})

// ─── Start ──────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  log(`🚀 Chat service listening on port ${PORT}`)
})

// ─── Graceful Shutdown ──────────────────────────────────────────────────────
function shutdown(signal: string) {
  log(`Received ${signal}, shutting down…`)
  io.close()
  httpServer.close(() => {
    log('Server closed')
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
