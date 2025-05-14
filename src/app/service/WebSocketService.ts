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
        
      },
    });

    this.stompClient.onConnect = (frame) => {
      
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.setupSubscriptions();
      this.resendPendingMessages();
    };

    this.handleErrorsAndEvents();
  }

  connectAdmin(): void {
    if (this.isConnected) {
      
      return;
    }

    this.isAdmin = true;
    this.userId = null;
    this.stompClient.activate();
   
  }

  connect(userId: number): void {
    if (this.isConnected) {
     
      this.setupSubscriptions();
      return;
    }

    this.userId = userId.toString();
    this.isAdmin = false;
    this.stompClient.activate();
  
  }

  connectAdmin2(adminId: number): void {
    if (this.isConnected) {
     
      this.userId = adminId.toString();
      this.isAdmin = true;
      this.setupSubscriptions();
      return;
    }

    this.userId = adminId.toString();
    this.isAdmin = true;
    this.stompClient.activate();
    
  }

  private setupSubscriptions(): void {
   
    this.subscriptions.forEach((sub, destination) => {
      sub.unsubscribe();
      
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
      
      return;
    }
  
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
      
      setTimeout(() => this.subscribe(destination, subject, type), 1000);
      return;
    }

    if (this.subscriptions.has(destination)) {
      
      return;
    }

    console.log(`[WebSocketService] Đang đăng ký subscription cho ${destination}`);
    const subscription = this.stompClient.subscribe(destination, (message: IMessage) => {
     
      this.handleMessage(message, subject, type);
    }, { id: `sub-${type}-${this.userId || 'admin'}` });

    this.subscriptions.set(destination, subscription);
    
  }

  private handleMessage(message: IMessage, subject: BehaviorSubject<any>, type: string): void {
    if (!message.body) {
      
      return;
    }

    try {
      const update = JSON.parse(message.body);
     
      if (type === 'chat message') {
        if (!update || typeof update !== 'object') {
         
          return;
        }

        // Đảm bảo các trường cần thiết tồn tại
        const normalizedMessage = {
          sender: update.sender || null,
          senderId: update.sender?.id ?? update.senderId ?? null,
          receiver: update.receiver || null,
          receiverId: update.receiver?.id ?? update.receiverId ?? null,
          content: update.content || '',
          timestamp: update.timestamp || new Date().toISOString(),
          type: update.type || null,
          messageId: update.messageId || null,
          isRecalled: update.isRecalled || false,
        };

        // Kiểm tra các trường bắt buộc cho tin nhắn chat
        if (normalizedMessage.senderId === null || !normalizedMessage.content) {
          
          return;
        }

       
        subject.next(normalizedMessage);
      } else {
        // Các loại tin nhắn khác (order, inventory, product updates, v.v.)
        subject.next(update);
      }
    } catch (error) {
      
    }
  }

  private handleErrorsAndEvents(): void {
    this.stompClient.onStompError = (frame) => {
      
      this.isConnected = false;
      this.handleReconnect();
    };

    this.stompClient.onWebSocketClose = (event) => {
     
      this.isConnected = false;
      this.handleReconnect();
    };

    this.stompClient.onWebSocketError = (error) => {
      
      this.isConnected = false;
      this.handleReconnect();
    };
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      
      setTimeout(() => {
        if (!this.isConnected) {
          this.stompClient.activate();
        }
      }, this.reconnectDelay);
    } else {
      
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
  
  }

  disconnect(): void {
    if (this.isConnected) {
      this.subscriptions.forEach((sub, destination) => {
        sub.unsubscribe();
        
      });
      this.subscriptions.clear();
      this.stompClient.deactivate();
      this.isConnected = false;
      this.reconnectAttempts = 0;
      this.userId = null;
      this.isAdmin = false;
      this.pendingMessages = [];
     
    }
  }

  sendChatMessage(senderId: number, receiverId: number | null, message: string): void {
    if (senderId < 1000) {
      
      return;
    }

    if (receiverId !== null && receiverId < 1000) {
      
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
       
        this.stompClient.publish({
          destination: destination,
          body: JSON.stringify(chatMessage),
        });
       
      } else {
        destination = `/app/user-to-admin/${senderId}`;
       
        this.stompClient.publish({
          destination: destination,
          body: JSON.stringify(chatMessage),
        });
        
      }
    } else {
     
      if (isPlatformBrowser(this.platformId)) {
        this.pendingMessages.push({ senderId, receiverId, message });
        localStorage.setItem('pendingMessages', JSON.stringify(this.pendingMessages));
      }
    }
  }

  private resendPendingMessages(): void {
    if (!isPlatformBrowser(this.platformId)) {
     
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