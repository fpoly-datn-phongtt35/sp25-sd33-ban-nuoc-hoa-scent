import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private stompClient: Client;
  private messageSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private adminMessageSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private inventorySubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private productUpdateSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private spctUpdateSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private chatMessageSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private isConnected: boolean = false;
  private userId: string | null = null;
  private isAdmin: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectDelay: number = 5000;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private pendingMessages: any[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
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
      this.reconnectAttempts = 0;
      this.setupSubscriptions();
      this.resendPendingMessages();
    };

    this.handleErrorsAndEvents();
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

  connect(userId: number): void {
    if (this.isConnected) {
      console.log('[WebSocketService] Đã kết nối, bỏ qua kết nối mới cho user:', userId);
      this.setupSubscriptions();
      return;
    }

    this.userId = userId.toString();
    this.isAdmin = false;
    this.stompClient.activate();
    console.log('[WebSocketService] Khởi tạo kết nối cho user:', userId);
  }

  connectAdmin2(adminId: number): void {
    if (this.isConnected) {
      console.log('[WebSocketService] Đã kết nối, bỏ qua kết nối mới cho admin:', adminId);
      this.userId = adminId.toString();
      this.isAdmin = true;
      this.setupSubscriptions();
      return;
    }

    this.userId = adminId.toString();
    this.isAdmin = true;
    this.stompClient.activate();
    console.log('[WebSocketService] Khởi tạo kết nối cho admin với ID:', adminId);
  }

  private setupSubscriptions(): void {
    console.log('[WebSocketService] Thiết lập subscriptions với userId:', this.userId, 'isAdmin:', this.isAdmin);
    this.subscriptions.forEach((sub, destination) => {
      sub.unsubscribe();
      console.log(`[WebSocketService] Đã hủy subscription cũ cho ${destination}`);
    });
    this.subscriptions.clear();

    this.subscribeToInventoryUpdates();
    this.subscribeToProductUpdates();
    this.subscribeToSpctUpdates();
    if (this.isAdmin) {
      this.subscribeToAdminOrders();
      if (this.userId) {
        this.subscribeToChatMessages();
      } else {
        console.warn('[WebSocketService] Không thể đăng ký chat messages: userId là null');
      }
    } else if (this.userId) {
      this.subscribeToUserOrders();
      this.subscribeToUserProductUpdates();
      this.subscribeToChatMessages();
    }
  }

  private subscribeToUserOrders(): void {
    if (!this.userId) return;
    this.subscribe(`/topic/donhang/${this.userId}`, this.messageSubject, 'user order');
  }

  private subscribeToAdminOrders(): void {
    this.subscribe('/topic/admin/orders', this.adminMessageSubject, 'admin order');
  }

  private subscribeToChatMessages(): void {
    if (!this.userId) {
      console.warn('[WebSocketService] Không thể đăng ký chat messages: userId là null');
      return;
    }
    console.log('[WebSocketService] Đăng ký subscription cho /topic/admin-messages hoặc /topic/messages với userId:', this.userId);
    const destination = this.isAdmin ? `/topic/admin-messages/${this.userId}` : `/topic/messages/${this.userId}`;
    this.subscribe(destination, this.chatMessageSubject, 'chat message');
  }

  private subscribeToInventoryUpdates(): void {
    this.subscribe('/topic/inventory', this.inventorySubject, 'inventory');
  }

  private subscribeToProductUpdates(): void {
    this.subscribe('/topic/productUpdates', this.productUpdateSubject, 'product update');
  }

  private subscribeToUserProductUpdates(): void {
    if (!this.userId) return;
    this.subscribe(`/user/${this.userId}/productUpdates`, this.productUpdateSubject, 'user-specific product update');
  }

  private subscribeToSpctUpdates(): void {
    this.subscribe('/topic/spctUpdates', this.spctUpdateSubject, 'Spct update');
  }

  private subscribe(destination: string, subject: BehaviorSubject<any>, type: string): void {
    if (!this.stompClient.active) {
      console.warn(`[WebSocketService] Không thể đăng ký ${destination}: WebSocket chưa kết nối`);
      setTimeout(() => this.subscribe(destination, subject, type), 1000);
      return;
    }

    if (this.subscriptions.has(destination)) {
      console.log(`[WebSocketService] Đã đăng ký subscription cho ${destination}, bỏ qua...`);
      return;
    }

    console.log(`[WebSocketService] Đang đăng ký subscription cho ${destination}`);
    const subscription = this.stompClient.subscribe(destination, (message: IMessage) => {
      console.log(`[WebSocketService] Nhận tin nhắn trên ${destination}:`, message.body);
      this.handleMessage(message, subject, type);
    }, { id: `sub-${type}-${this.userId || 'admin'}` });

    this.subscriptions.set(destination, subscription);
    console.log(`[WebSocketService] Subscription thành công cho ${destination}, subscription ID: ${subscription.id}`);
  }

  private handleMessage(message: IMessage, subject: BehaviorSubject<any>, type: string): void {
    if (message.body) {
      try {
        const update = JSON.parse(message.body);
        console.log(`[WebSocketService] Đã phân tích ${type} update:`, update);
        subject.next(update);
      } catch (error) {
        console.error(`[WebSocketService] Lỗi khi phân tích ${type} message:`, error);
      }
    } else {
      console.warn(`[WebSocketService] Nhận được tin nhắn trống cho ${type}`);
    }
  }

  private handleErrorsAndEvents(): void {
    this.stompClient.onStompError = (frame) => {
      console.error('[WebSocketService] Lỗi STOMP:', frame);
      this.isConnected = false;
      this.handleReconnect();
    };

    this.stompClient.onWebSocketClose = (event) => {
      console.log('[WebSocketService] Kết nối WebSocket đã đóng:', event);
      this.isConnected = false;
      this.handleReconnect();
    };

    this.stompClient.onWebSocketError = (error) => {
      console.error('[WebSocketService] Lỗi WebSocket:', error);
      this.isConnected = false;
      this.handleReconnect();
    };
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[WebSocketService] Đang thử kết nối lại (${this.reconnectAttempts}/${this.maxReconnectAttempts}) sau ${this.reconnectDelay}ms...`);
      setTimeout(() => {
        if (!this.isConnected) {
          this.stompClient.activate();
        }
      }, this.reconnectDelay);
    } else {
      console.error('[WebSocketService] Đã đạt tối đa số lần thử kết nối lại. Vui lòng làm mới trang để kết nối lại.');
      // Instead of completing subjects, emit a special message
      this.chatMessageSubject.next({ type: 'error', message: 'Đã đạt tối đa số lần thử kết nối lại' });
    }
  }

  private notify_CMError(error: string): void {
    // Instead of calling error() on subjects, emit an error message
    this.chatMessageSubject.next({ type: 'error', message: error });
  }

  private notifyComplete(): void {
    // Remove completion of subjects
    console.log('[WebSocketService] Kết nối đã đóng, sẽ thử kết nối lại...');
  }

  disconnect(): void {
    if (this.isConnected) {
      this.subscriptions.forEach((sub, destination) => {
        sub.unsubscribe();
        console.log(`[WebSocketService] Đã hủy subscription cho ${destination}`);
      });
      this.subscriptions.clear();
      this.stompClient.deactivate();
      this.isConnected = false;
      this.reconnectAttempts = 0;
      this.userId = null;
      this.isAdmin = false;
      this.pendingMessages = [];
      console.log('[WebSocketService] Đã ngắt kết nối');
    }
  }

  sendChatMessage(senderId: number, receiverId: number | null, message: string): void {
    if (senderId < 1000) {
      console.error('[WebSocketService] ID người gửi không hợp lệ:', senderId);
      return;
    }

    if (receiverId !== null && receiverId < 1000) {
      console.error('[WebSocketService] ID người nhận không hợp lệ:', receiverId);
      return;
    }

    if (this.isConnected) {
      const chatMessage = {
        sender: { id: senderId },
        receiver: receiverId ? { id: receiverId } : null,
        content: message,
        timestamp: new Date().toISOString(),
      };

      let destination: string;
      if (receiverId) {
        destination = `/app/admin-to-user/${senderId}/${receiverId}`;
        console.log('[WebSocketService] Publishing message to destination:', destination, chatMessage);
        this.stompClient.publish({
          destination: destination,
          body: JSON.stringify(chatMessage),
        });
        console.log(`[WebSocketService] Đã gửi tin nhắn chat từ admin ${senderId} đến user ${receiverId}:`, chatMessage);
      } else {
        destination = `/app/user-to-admin/${senderId}`;
        console.log('[WebSocketService] Publishing message to destination:', destination, chatMessage);
        this.stompClient.publish({
          destination: destination,
          body: JSON.stringify(chatMessage),
        });
        console.log(`[WebSocketService] Đã gửi tin nhắn chat từ user ${senderId} đến tất cả admin/staff:`, chatMessage);
      }
    } else {
      console.error('[WebSocketService] Không thể gửi tin nhắn: WebSocket chưa kết nối');
      if (isPlatformBrowser(this.platformId)) {
        this.pendingMessages.push({ senderId, receiverId, message });
        localStorage.setItem('pendingMessages', JSON.stringify(this.pendingMessages));
      }
    }
  }

  private resendPendingMessages(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('Không thể gửi lại tin nhắn: Đang chạy trên server-side');
      return;
    }

    const pendingMessages = JSON.parse(localStorage.getItem('pendingMessages') || '[]');
    this.pendingMessages = [...pendingMessages];
    if (this.pendingMessages.length > 0) {
      this.pendingMessages.forEach((msg: any) => {
        this.sendChatMessage(msg.senderId, msg.receiverId, msg.message);
      });
      this.pendingMessages = [];
      localStorage.setItem('pendingMessages', '[]');
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

  getChatMessages(): Observable<any> {
    return this.chatMessageSubject.asObservable();
  }

  isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}