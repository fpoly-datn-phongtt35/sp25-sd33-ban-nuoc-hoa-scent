import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../service/WebSocketService';
import { TokenService } from '../service/token.service';

interface Notification {
  id: number;
  message: string;
  type: 'order' | 'return';
  read: boolean;
  timestamp: string;
}

@Component({
  selector: 'app-thongbao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './thongbao.component.html',
  styleUrls: ['./thongbao.component.scss']
})
export class ThongbaoComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  showPopup: boolean = false; // Khởi tạo là false
  unreadCount: number = 0;
  private userId: number | null = null;
  private orderSubscription: Subscription | undefined;
  private returnSubscription: Subscription | undefined;

  constructor(
    private webSocketService: WebSocketService,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const userInfo = this.tokenService.getUserInfo();
    if (userInfo && userInfo.UserID) {
      this.userId = userInfo.UserID;
      console.log('UserID:', this.userId);
      this.loadNotificationsFromStorage();
      this.webSocketService.connect(this.userId);

      this.orderSubscription = this.webSocketService.getMessages().subscribe({
        next: (update: any) => this.handleOrderUpdate(update),
        error: (error) => console.error('Order subscription error:', error),
        complete: () => console.log('Order subscription completed'),
      });

      this.returnSubscription = this.webSocketService.getReturnMessages().subscribe({
        next: (update: any) => this.handleReturnUpdate(update),
        error: (error) => console.error('Return subscription error:', error),
        complete: () => console.log('Return subscription completed'),
      });
    } else {
      console.error('User not logged in, cannot connect to WebSocket');
    }
  }

  ngOnDestroy() {
    if (this.orderSubscription) this.orderSubscription.unsubscribe();
    if (this.returnSubscription) this.returnSubscription.unsubscribe();
    this.webSocketService.disconnect();
  }

  private loadNotificationsFromStorage(): void {
    if (this.userId) {
      const storedNotifications = localStorage.getItem(`notifications_${this.userId}`);
      console.log('Loading from localStorage:', storedNotifications);
      if (storedNotifications) {
        this.notifications = JSON.parse(storedNotifications).map((notif: any) => ({
          ...notif,
          timestamp: new Date(notif.timestamp).toISOString()
        }));
        this.unreadCount = this.notifications.filter(n => !n.read).length;
        console.log('Restored notifications:', this.notifications);
      }
    }
  }

  private saveNotificationsToStorage(): void {
    if (this.userId) {
      localStorage.setItem(`notifications_${this.userId}`, JSON.stringify(this.notifications));
      console.log('Saved to localStorage:', this.notifications);
    }
  }

  private handleOrderUpdate(update: any): void {
    console.log('Order update:', update);
    if (!update || typeof update !== 'object' || !update.idDonHang || update.trangThai === undefined) {
      console.log('Invalid order update:', update);
      return;
    }
    const { idDonHang, trangThai, lyDoHuy } = update;
    const message = this.getOrderMessage(idDonHang, trangThai, lyDoHuy);
    this.addNotification(message, 'order');
  }

  private handleReturnUpdate(update: any): void {
    console.log('Return update:', update);
    if (!update || typeof update !== 'object' || !update.id || update.trangThai === undefined) {
      console.log('Invalid return update:', update);
      return;
    }
    const { id, trangThai, lyDoTuChoi } = update;
    const message = this.getReturnMessage(id, trangThai, lyDoTuChoi);
    this.addNotification(message, 'return');
  }

  private getOrderMessage(orderId: number, status: number, reason?: string): string {
    switch (status) {
      case 1: return `Đơn hàng #${orderId} đang chờ xác nhận.`;
      case 2: return `Đơn hàng #${orderId} đã được xác nhận.`;
      case 3: return `Đơn hàng #${orderId} đang giao.`;
      case 4: return `Đơn hàng #${orderId} đã hoàn thành.`;
      case 5: return `Đơn hàng #${orderId} đã bị hủy. Lý do: ${reason || 'Không có lý do'}.`;
      case 6: return `Đơn hàng #${orderId} đã thanh toán.`;
      default: return `Đơn hàng #${orderId} có cập nhật trạng thái mới.`;
    }
  }

  private getReturnMessage(returnId: number, status: number, reason?: string): string {
    switch (status) {
      case 0: return `Yêu cầu trả hàng #${returnId} đang chờ duyệt.`;
      case 1: return `Yêu cầu trả hàng #${returnId} đã được duyệt.`;
      case 2: return `Yêu cầu trả hàng #${returnId} đã bị từ chối. Lý do: ${reason || 'Không có lý do'}.`;
      case 3: return `Yêu cầu trả hàng #${returnId} đã hoàn thành.`;
      default: return `Yêu cầu trả hàng #${returnId} có cập nhật mới.`;
    }
  }

  addNotification(message: string, type: 'order' | 'return') {
    const newNotification: Notification = {
      id: Date.now(),
      message,
      type,
      read: false,
      timestamp: new Date().toISOString()
    };
    this.notifications = [newNotification, ...this.notifications];
    this.unreadCount++;
    this.saveNotificationsToStorage();
    this.cdr.detectChanges();
  }

  togglePopup(state: boolean) {
    this.showPopup = state;
    console.log('Toggle popup to:', this.showPopup);
    if (this.showPopup) {
      this.notifications.forEach(n => n.read = true);
      this.unreadCount = 0;
      this.saveNotificationsToStorage();
    }
    this.cdr.detectChanges();
  }

  clearNotifications() {
    this.notifications = [];
    this.unreadCount = 0;
    this.showPopup = false;
    this.saveNotificationsToStorage();
    this.cdr.detectChanges();
  }
}