const { createServer } = require('http')
const { Server } = require('socket.io')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res)
  })

  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  })

  // Track active users per board
  const boardUsers = new Map()

  io.on('connection', (socket) => {
    const { boardId, userId } = socket.handshake.auth

    socket.on('join-board', (boardId) => {
      socket.join(boardId)
      
      // Track user
      if (!boardUsers.has(boardId)) {
        boardUsers.set(boardId, new Set())
      }
      boardUsers.get(boardId).add(userId)

      // Notify others
      socket.to(boardId).emit('user-joined', {
        userId,
        userName: 'User Name', // Get from DB
      })
    })

    socket.on('leave-board', (boardId) => {
      socket.leave(boardId)
      
      // Remove user
      if (boardUsers.has(boardId)) {
        boardUsers.get(boardId).delete(userId)
      }

      // Notify others
      socket.to(boardId).emit('user-left', {
        userId,
        userName: 'User Name',
      })
    })

    socket.on('task-move', ({ taskId, newStatus }) => {
      socket.to(boardId).emit('task-moved', {
        taskId,
        newStatus,
        userId,
        userName: 'User Name',
      })
    })

    socket.on('task-update', ({ task }) => {
      socket.to(boardId).emit('task-updated', {
        task,
        userId,
        userName: 'User Name',
      })
    })

    socket.on('task-create', ({ task }) => {
      socket.to(boardId).emit('task-created', {
        task,
        userId,
        userName: 'User Name',
      })
    })

    socket.on('task-delete', ({ taskId }) => {
      socket.to(boardId).emit('task-deleted', {
        taskId,
        userId,
        userName: 'User Name',
      })
    })

    socket.on('disconnect', () => {
      // Clean up user from boards
      boardUsers.forEach((users, boardId) => {
        if (users.has(userId)) {
          users.delete(userId)
          socket.to(boardId).emit('user-left', {
            userId,
            userName: 'User Name',
          })
        }
      })
    })
  })

  const PORT = process.env.PORT || 3001
  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`)
  })
})