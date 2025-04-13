import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private stompClient: Client;
  private messageSubject: Subject<any> = new Subject<any>(); // For user orders
  private adminMessageSubject: Subject<any> = new Subject<any>(); // For admin orders
  private inventorySubject: Subject<any> = new Subject<any>(); // For inventory updates
  private productUpdateSubject: Subject<any> = new Subject<any>(); // For product updates
  private spctUpdateSubject: Subject<any> = new Subject<any>(); // For Spct updates
  private isConnected: boolean = false;
  private userId: string | null = null;
  private isAdmin: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectDelay: number = 5000; // 5 seconds

  constructor() {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log('[WebSocket Debug]:', str);
      },
    });

    this.stompClient.onConnect = (frame) => {
      console.log('[WebSocketService] Connected:', frame);
      this.isConnected = true;
      this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection

      // Common subscriptions for both user and admin
      this.subscribeToInventoryUpdates();
      this.subscribeToProductUpdates();
      this.subscribeToSpctUpdates();

      // User-specific or admin-specific subscriptions
      if (this.isAdmin) {
        this.subscribeToAdminOrders();
      } else if (this.userId) {
        this.subscribeToUserOrders();
        this.subscribeToUserProductUpdates(); // Subscribe to user-specific product updates
      }
    };

    this.handleErrorsAndEvents();
  }

  connect(userId: number): void {
    if (this.isConnected) {
      console.log('[WebSocketService] Already connected, skipping connect for user:', userId);
      return;
    }

    this.userId = userId.toString();
    this.isAdmin = false;
    this.stompClient.activate();
    console.log('[WebSocketService] Initiating connection for user:', userId);
  }

  connectAdmin(): void {
    if (this.isConnected) {
      console.log('[WebSocketService] Already connected, skipping connect for admin');
      return;
    }

    this.isAdmin = true;
    this.userId = null;
    this.stompClient.activate();
    console.log('[WebSocketService] Initiating connection for admin');
  }

  private subscribeToUserOrders(): void {
    if (!this.userId) return;

    this.stompClient.subscribe(`/topic/donhang/${this.userId}`, (message: IMessage) => {
      console.log(`[WebSocketService] Received message on /topic/donhang/${this.userId}:`, message);
      this.handleMessage(message, this.messageSubject, 'user order');
    });
  }

  private subscribeToAdminOrders(): void {
    this.stompClient.subscribe('/topic/admin/orders', (message: IMessage) => {
      console.log('[WebSocketService] Received message on /topic/admin/orders:', message);
      this.handleMessage(message, this.adminMessageSubject, 'admin order');
    });
  }

  private subscribeToInventoryUpdates(): void {
    this.stompClient.subscribe('/topic/inventory', (message: IMessage) => {
      console.log('[WebSocketService] Received message on /topic/inventory:', message);
      this.handleMessage(message, this.inventorySubject, 'inventory');
    });
  }

  private subscribeToProductUpdates(): void {
    this.stompClient.subscribe('/topic/productUpdates', (message: IMessage) => {
      console.log('[WebSocketService] Received message on /topic/productUpdates:', message);
      this.handleMessage(message, this.productUpdateSubject, 'product update');
    });
  }

  private subscribeToUserProductUpdates(): void {
    if (!this.userId) return;

    this.stompClient.subscribe(`/user/${this.userId}/productUpdates`, (message: IMessage) => {
      console.log(`[WebSocketService] Received user-specific message on /user/${this.userId}/productUpdates:`, message);
      this.handleMessage(message, this.productUpdateSubject, 'user-specific product update');
    });
  }

  private subscribeToSpctUpdates(): void {
    this.stompClient.subscribe('/topic/spctUpdates', (message: IMessage) => {
      console.log('[WebSocketService] Received message on /topic/spctUpdates:', message);
      this.handleMessage(message, this.spctUpdateSubject, 'Spct update');
    });
  }

  private handleMessage(message: IMessage, subject: Subject<any>, type: string): void {
    if (message.body) {
      try {
        const update = JSON.parse(message.body);
        console.log(`[WebSocketService] Parsed ${type} update:`, update);
        subject.next(update);
      } catch (error) {
        console.error(`[WebSocketService] Error parsing ${type} message:`, error);
      }
    } else {
      console.warn(`[WebSocketService] Empty message body received for ${type}`);
    }
  }

  private handleErrorsAndEvents(): void {
    this.stompClient.onStompError = (frame) => {
      console.error('[WebSocketService] STOMP error:', frame);
      this.isConnected = false;
      this.notifyError('STOMP error: ' + frame);
      this.handleReconnect();
    };

    this.stompClient.onWebSocketClose = (event) => {
      console.log('[WebSocketService] WebSocket connection closed:', event);
      this.isConnected = false;
      this.notifyComplete();
      this.handleReconnect();
    };

    this.stompClient.onWebSocketError = (error) => {
      console.error('[WebSocketService] WebSocket error:', error);
      this.isConnected = false;
      this.notifyError('WebSocket error: ' + error);
      this.handleReconnect();
    };
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[WebSocketService] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectDelay}ms...`);
      // The stompClient already has reconnectDelay set, so it will automatically reconnect
    } else {
      console.error('[WebSocketService] Max reconnect attempts reached. Please refresh the page to reconnect.');
      this.notifyError('Max reconnect attempts reached');
    }
  }

  private notifyError(error: string): void {
    this.messageSubject.error(error);
    this.adminMessageSubject.error(error);
    this.inventorySubject.error(error);
    this.productUpdateSubject.error(error);
    this.spctUpdateSubject.error(error);
  }

  private notifyComplete(): void {
    this.messageSubject.complete();
    this.adminMessageSubject.complete();
    this.inventorySubject.complete();
    this.productUpdateSubject.complete();
    this.spctUpdateSubject.complete();
  }

  disconnect(): void {
    if (this.isConnected) {
      this.stompClient.deactivate();
      this.isConnected = false;
      this.reconnectAttempts = 0;
      console.log('[WebSocketService] Disconnected');
    }
  }

  getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  getAdminMessages(): Observable<any> {
    return this.adminMessageSubject.asObservable();
  }

  getInventoryUpdates(): Observable<any> {
    return this.inventorySubject.asObservable();
  }

  getProductUpdates(): Observable<any> {
    return this.productUpdateSubject.asObservable();
  }

  getSpctUpdates(): Observable<any> {
    return this.spctUpdateSubject.asObservable();
  }

  isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}