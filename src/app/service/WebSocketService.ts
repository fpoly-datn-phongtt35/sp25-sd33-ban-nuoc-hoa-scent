import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private stompClient: Client;
  private messageSubject: Subject<any> = new Subject<any>(); // Cho đơn hàng user
  private adminMessageSubject: Subject<any> = new Subject<any>(); // Cho admin
  private inventorySubject: Subject<any> = new Subject<any>(); // Cho tồn kho
  private productUpdateSubject: Subject<any> = new Subject<any>(); // Cho cập nhật sản phẩm
  private isConnected: boolean = false;

  constructor() {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        
      },
    });
  }

  connect(userId: number): void {
    if (this.isConnected) {
      
      return;
    }

    this.stompClient.onConnect = (frame) => {
      
      this.isConnected = true;

      // Subscribe cho đơn hàng của user
      this.stompClient.subscribe(`/topic/donhang/${userId}`, (message) => {
        
        if (message.body) {
          try {
            const update = JSON.parse(message.body);
           
            this.messageSubject.next(update);
          } catch (error) {
            
          }
        } else {
          
        }
      });

      // Subscribe cho cập nhật tồn kho
      this.stompClient.subscribe('/topic/inventory', (message) => {
      
        if (message.body) {
          try {
            const update = JSON.parse(message.body);
            
            this.inventorySubject.next(update);
          } catch (error) {
            
          }
        } else {
         
        }
      });

      // Subscribe cho cập nhật sản phẩm
      this.stompClient.subscribe('/topic/productUpdates', (message) => {
       
        if (message.body) {
          try {
            const update = JSON.parse(message.body);
           
            this.productUpdateSubject.next(update);
          } catch (error) {
            
          }
        } else {
          
        }
      });

      
    };

    this.handleErrorsAndEvents();
    this.stompClient.activate();
    
  }

  connectAdmin(): void {
    if (this.isConnected) {
     
      return;
    }

    this.stompClient.onConnect = (frame) => {
      
      this.isConnected = true;

      // Subscribe cho đơn hàng admin
      this.stompClient.subscribe('/topic/admin/orders', (message) => {
        
        if (message.body) {
          try {
            const update = JSON.parse(message.body);
            
            this.adminMessageSubject.next(update);
          } catch (error) {
           
          }
        } else {
          console.warn('[WebSocketService] Empty message body received on /topic/admin/orders');
        }
      });

      // Subscribe cho cập nhật tồn kho
      this.stompClient.subscribe('/topic/inventory', (message) => {
       
        if (message.body) {
          try {
            const update = JSON.parse(message.body);
            
            this.inventorySubject.next(update);
          } catch (error) {
            
          }
        } else {
          console.warn('[WebSocketService] Empty message body received on /topic/inventory (admin)');
        }
      });

      // Subscribe cho cập nhật sản phẩm
      this.stompClient.subscribe('/topic/productUpdates', (message) => {
       
        if (message.body) {
          try {
            const update = JSON.parse(message.body);
           
            this.productUpdateSubject.next(update);
          } catch (error) {
           
          }
        } else {
          
        }
      });

     
    };

    this.handleErrorsAndEvents();
    this.stompClient.activate();
    
  }

  private handleErrorsAndEvents(): void {
    this.stompClient.onStompError = (error) => {
      console.error('[WebSocketService] STOMP error:', error);
      this.isConnected = false;
      this.messageSubject.error('STOMP error: ' + error);
      this.adminMessageSubject.error('STOMP error: ' + error);
      this.inventorySubject.error('STOMP error: ' + error);
      this.productUpdateSubject.error('STOMP error: ' + error);
    };

    this.stompClient.onWebSocketClose = (event) => {
      
      this.isConnected = false;
      this.messageSubject.complete();
      this.adminMessageSubject.complete();
      this.inventorySubject.complete();
      this.productUpdateSubject.complete();
    };

    this.stompClient.onWebSocketError = (error) => {
      console.error('[WebSocketService] WebSocket error:', error);
      this.messageSubject.error('WebSocket error: ' + error);
      this.adminMessageSubject.error('WebSocket error: ' + error);
      this.inventorySubject.error('WebSocket error: ' + error);
      this.productUpdateSubject.error('WebSocket error: ' + error);
    };
  }

  disconnect(): void {
    if (this.isConnected) {
      this.stompClient.deactivate();
      this.isConnected = false;
      
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

  isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}