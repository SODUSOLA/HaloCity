import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket

  socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:5000', {
    auth: { token },
    transports: ['websocket', 'polling'],
  })

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message)
  })

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function getSocket(): Socket | null {
  return socket
}
