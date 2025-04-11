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
  private isConnected: boolean = false;

  constructor() {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
    });
  }

  connect(userId: number): void {
    if (this.isConnected) {
      console.log('WebSocket already connected for userId:', userId);
      return;
    }

    this.stompClient.onConnect = (frame) => {
      console.log('Connected to WebSocket:', frame);
      this.isConnected = true;

      // Subscribe cho đơn hàng của user
      this.stompClient.subscribe(`/topic/donhang/${userId}`, (message) => {
        console.log('Raw WebSocket message received for user:', message);
        if (message.body) {
          try {
            const update = JSON.parse(message.body);
            console.log('Parsed WebSocket message for userId', userId, ':', update);
            this.messageSubject.next(update);
          } catch (error) {
            console.error('Error parsing WebSocket message body:', error);
          }
        }
      });

      // Subscribe cho cập nhật tồn kho
      this.stompClient.subscribe('/topic/inventory', (message) => {
        console.log('Raw WebSocket message received for inventory:', message);
        if (message.body) {
          try {
            const update = JSON.parse(message.body);
            console.log('Parsed WebSocket message for inventory:', update);
            this.inventorySubject.next(update);
          } catch (error) {
            console.error('Error parsing WebSocket message body:', error);
          }
        }
      });

      console.log(`Subscribed to /topic/donhang/${userId} and /topic/inventory`);
    };

    this.handleErrorsAndEvents();
    this.stompClient.activate();
    console.log('Initiating WebSocket connection for userId:', userId);
  }

  connectAdmin(): void {
    if (this.isConnected) {
      console.log('WebSocket already connected for admin');
      return;
    }

    this.stompClient.onConnect = (frame) => {
      console.log('Connected to WebSocket for admin:', frame);
      this.isConnected = true;

      this.stompClient.subscribe('/topic/admin/orders', (message) => {
        console.log('Raw WebSocket message received for admin:', message);
        if (message.body) {
          try {
            const update = JSON.parse(message.body);
            console.log('Parsed WebSocket message for admin:', update);
            this.adminMessageSubject.next(update);
          } catch (error) {
            console.error('Error parsing WebSocket message body:', error);
          }
        }
      });

      // Subscribe cho cập nhật tồn kho (cả admin cũng cần thấy tồn kho)
      this.stompClient.subscribe('/topic/inventory', (message) => {
        console.log('Raw WebSocket message received for inventory (admin):', message);
        if (message.body) {
          try {
            const update = JSON.parse(message.body);
            console.log('Parsed WebSocket message for inventory (admin):', update);
            this.inventorySubject.next(update);
          } catch (error) {
            console.error('Error parsing WebSocket message body:', error);
          }
        }
      });

      console.log('Subscribed to /topic/admin/orders and /topic/inventory');
    };

    this.handleErrorsAndEvents();
    this.stompClient.activate();
    console.log('Initiating WebSocket connection for admin');
  }

  private handleErrorsAndEvents(): void {
    this.stompClient.onStompError = (error) => {
      console.error('STOMP error:', error);
      this.isConnected = false;
      this.messageSubject.error('STOMP error: ' + error);
      this.adminMessageSubject.error('STOMP error: ' + error);
      this.inventorySubject.error('STOMP error: ' + error);
    };

    this.stompClient.onWebSocketClose = (event) => {
      console.log('WebSocket closed:', event);
      this.isConnected = false;
      this.messageSubject.complete();
      this.adminMessageSubject.complete();
      this.inventorySubject.complete();
    };

    this.stompClient.onWebSocketError = (error) => {
      console.error('WebSocket error:', error);
      this.messageSubject.error('WebSocket error: ' + error);
      this.adminMessageSubject.error('WebSocket error: ' + error);
      this.inventorySubject.error('WebSocket error: ' + error);
    };
  }

  disconnect(): void {
    if (this.isConnected) {
      this.stompClient.deactivate();
      this.isConnected = false;
      console.log('Disconnected from WebSocket');
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

  isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}