import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const connectSocket = (restaurantId?: string) => {
  const sock = getSocket();
  if (!sock.connected) {
    sock.connect();
  }
  if (restaurantId) {
    sock.emit('join-restaurant', { room: `restaurant:${restaurantId}` });
  }
  return sock;
};

export const disconnectSocket = (restaurantId?: string) => {
  if (socket) {
    if (restaurantId) {
      socket.emit('leave-restaurant', { room: `restaurant:${restaurantId}` });
    }
    socket.disconnect();
  }
};
