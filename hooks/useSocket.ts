'use client';

import { useEffect, useState } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket/socket';
import { SOCKET_EVENTS } from '@/lib/socket/events';

export function useSocket(restaurantId?: string) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = connectSocket(restaurantId);

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on(SOCKET_EVENTS.CONNECT, onConnect);
    socket.on(SOCKET_EVENTS.DISCONNECT, onDisconnect);

    setIsConnected(socket.connected);

    return () => {
      socket.off(SOCKET_EVENTS.CONNECT, onConnect);
      socket.off(SOCKET_EVENTS.DISCONNECT, onDisconnect);
      disconnectSocket(restaurantId);
    };
  }, [restaurantId]);

  return {
    socket: getSocket(),
    isConnected,
  };
}
