import { Injectable, inject, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: Socket | null = null;
  private readonly logger = inject(LoggerService);

  // Connection state
  isConnected = signal(false);

  // Event subjects
  private newNotificationSubject = new Subject<any>();
  private unreadCountUpdateSubject = new Subject<{ count: number }>();
  private notificationReadSubject = new Subject<{ notificationId: string }>();

  constructor() {
    // Try to connect if token is available
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.logger.info('Token found in localStorage, initializing WebSocket');
      this.initializeSocket();
    } else {
      this.logger.info('No token found in localStorage, WebSocket not initialized');
    }
  }

  private initializeSocket() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      this.logger.warn('WebSocket: No auth token available');
      return;
    }

    // Disconnect existing socket if any
    this.disconnect();

    // Connect to backend WebSocket server with notifications namespace
    this.socket = io('http://localhost:3000/notifications', {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      this.logger.info('WebSocket connected successfully');
      this.isConnected.set(true);
    });

    this.socket.on('disconnect', (reason) => {
      this.logger.info('WebSocket disconnected:', reason);
      this.isConnected.set(false);
    });

    this.socket.on('connect_error', (error) => {
      this.logger.error('WebSocket connection error:', error);
      this.isConnected.set(false);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      this.logger.info('WebSocket reconnected after', attemptNumber, 'attempts');
      this.isConnected.set(true);
    });

    // Set up event listeners
    this.socket.on('newNotification', (notification: any) => {
      this.logger.info('WebSocket received newNotification:', notification);
      this.newNotificationSubject.next(notification);
    });

    this.socket.on('unreadCount', (data: { count: number }) => {
      this.logger.info('WebSocket received unreadCount:', data.count);
      this.unreadCountUpdateSubject.next(data);
    });

    this.socket.on('notificationRead', (data: { notificationId: string }) => {
      this.logger.info('WebSocket received notificationRead:', data.notificationId);
      this.notificationReadSubject.next(data);
    });

    this.logger.info('WebSocket event listeners set up');
  }

  // Listen for new notifications
  onNewNotification(): Observable<any> {
    return this.newNotificationSubject.asObservable();
  }

  // Listen for unread count updates
  onUnreadCountUpdate(): Observable<{ count: number }> {
    return this.unreadCountUpdateSubject.asObservable();
  }

  // Listen for notification read events
  onNotificationRead(): Observable<{ notificationId: string }> {
    return this.notificationReadSubject.asObservable();
  }

  // Send ping to keep connection alive
  ping(): void {
    if (this.socket && this.isConnected()) {
      this.socket.emit('ping');
    }
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected.set(false);
    }
  }

  // Reconnect (useful after login)
  reconnect(): void {
    this.initializeSocket();
  }

  // Check if socket is connected
  get isSocketConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}