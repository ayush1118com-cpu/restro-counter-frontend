import { Order, OrderStatus } from '@/types';

export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_RESTAURANT: 'join-restaurant',
  LEAVE_RESTAURANT: 'leave-restaurant',
  
  NEW_ORDER: 'new-order',
  ORDER_ACCEPTED: 'order-accepted',
  ORDER_PREPARING: 'order-preparing',
  ORDER_READY: 'order-ready',
  ORDER_COMPLETED: 'order-completed',
  ORDER_CANCELLED: 'order-cancelled',
  ORDER_STATUS_CHANGED: 'order-status-changed',
} as const;

export type SocketEventType = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];

export interface NewOrderPayload {
  restaurantId: string;
  order: Order;
}

export interface OrderStatusPayload {
  restaurantId: string;
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  updatedAt: string;
}
