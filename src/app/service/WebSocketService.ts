import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private stompClient: Client;
  private messageSubject: Subject<any> = new Subject<any>();
  private adminMessageSubject: Subject<any> = new Subject<any>();
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
        } else {
          console.log('WebSocket message has no body:', message);
        }
      });

      console.log(`Subscribed to /topic/donhang/${userId}`);
    };

    this.stompClient.onStompError = (error) => {
      console.error('STOMP error:', error);
      this.isConnected = false;
      this.messageSubject.error('STOMP error: ' + error);
      this.adminMessageSubject.error('STOMP error: ' + error);
    };

    this.stompClient.onWebSocketClose = (event) => {
      console.log('WebSocket closed:', event);
      this.isConnected = false;
      this.messageSubject.complete();
      this.adminMessageSubject.complete();
    };

    this.stompClient.onWebSocketError = (error) => {
      console.error('WebSocket error:', error);
      this.messageSubject.error('WebSocket error: ' + error);
      this.adminMessageSubject.error('WebSocket error: ' + error);
    };

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
        } else {
          console.log('WebSocket message has no body:', message);
        }
      });

      console.log('Subscribed to /topic/admin/orders');
    };

    this.stompClient.onStompError = (error) => {
      console.error('STOMP error:', error);
      this.isConnected = false;
      this.messageSubject.error('STOMP error: ' + error);
      this.adminMessageSubject.error('STOMP error: ' + error);
    };

    this.stompClient.onWebSocketClose = (event) => {
      console.log('WebSocket closed:', event);
      this.isConnected = false;
      this.messageSubject.complete();
      this.adminMessageSubject.complete();
    };

    this.stompClient.onWebSocketError = (error) => {
      console.error('WebSocket error:', error);
      this.messageSubject.error('WebSocket error: ' + error);
      this.adminMessageSubject.error('WebSocket error: ' + error);
    };

    this.stompClient.activate();
    console.log('Initiating WebSocket connection for admin');
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

  isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}