import { Component, OnInit, OnDestroy, AfterViewChecked, ViewChild, ElementRef, PLATFORM_ID, Inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StatisticsComponent } from '../statistics/statistics.component';
import { TokenService } from '../../service/token.service';
import { AccountService } from '../../service/taikhoan.service';
import { Router } from '@angular/router';
import { CustomerComponent } from '../account/account-customer-list/customer.component';
import { UserAdminComponent } from '../account/account-staff-list/user-admin.component';
import { ProductAdminComponent } from '../product/product-list/product-admin.component';
import { VourcherComponent } from '../voucher/vourcher-list/vourcher.component';
import { InvoiceComponent } from '../order/order-list/invoice.component';
import { LichsuthaotacComponent } from '../../lichsuthaotac/lichsuthaotac.component';
import { OfflineOrderComponent } from '../banhangofffline/banhangofffline/banhangofffline.component';
import { ChangePasswordModalComponent } from '../../change-password/change-password.component';
import { AccountInfoAdminComponent } from '../account-info-admin/account-info-admin.component';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../../service/WebSocketService';
import { isPlatformBrowser } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { BrandComponent } from '../thuonghieu/brand/brand.component';
import { FragranceListComponent } from '../fragrance/fragrance-list/fragrance-list.component';
import { PhongCachComponent } from "../phongcach/phong-cach/phong-cach.component";
import { MuiHuongComponent } from "../muihuong/mui-huong/mui-huong.component";
import { NotHuongComponent } from "../nothuong/not-huong/not-huong.component";
import { AdminTraHangComponent } from '../../admin-tra-hang/admin-tra-hang.component';
import { TraHangNhaSanXuatComponent } from '../../tra-hang-nha-san-xuat/tra-hang-nha-san-xuat.component';
import { BannerComponent } from '../../banner/banner.component';


@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [
    RouterModule,
    ProductAdminComponent,
    CommonModule,
    FormsModule,
    UserAdminComponent,
    CustomerComponent,
    VourcherComponent,
    StatisticsComponent,
    InvoiceComponent,
    LichsuthaotacComponent,
    OfflineOrderComponent,
    FragranceListComponent,
    BrandComponent,
    PhongCachComponent,
    MuiHuongComponent,
    NotHuongComponent,
    AdminTraHangComponent,TraHangNhaSanXuatComponent,BannerComponent
  ],
  templateUrl: './home-admin.component.html',
  styleUrls: ['./home-admin.component.scss'],
})
export class HomeAdminComponent implements OnInit, OnDestroy, AfterViewChecked {
  selectedComponent: string = 'bho';
  selectedNav: string = 'bho';
  userRole: string | null = null;
  tenDangNhap: any = null;
  userID: number | null = null;
  isDropdownVisible: boolean = false;
  isComponentSwitched: boolean = false;
  isSubMenuOpen: { [key: string]: boolean } = { products: false };

  messages: any[] = [];
  allMessages: any[] = [];
  newMessage: string = '';
  selectedChatUserId: number | null = null;
  chatUsers: any[] = [];
  newMessageCount: Map<number, number> = new Map();
  totalUnreadMessages: number = 0;
  errorMessage: string | null = null;
  isSending: boolean = false;
  incomingMessages: { customerId: number; content: string; hoTen: string }[] = [];
  private lastScrollHeight: number = 0;
  private chatSubscription: Subscription | null = null;
  private reconnectSubscription: Subscription | null = null;
  private recentlySentMessages: Set<string> = new Set();
  private processedMessages: Set<string> = new Set();

  @ViewChild('chatMessages', { static: false }) chatMessagesRef!: ElementRef<HTMLDivElement>;

  constructor(
    private tokenService: TokenService,
    private accountService: AccountService,
    private router: Router,
    private modalService: NgbModal,
    private http: HttpClient,
    private webSocketService: WebSocketService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    const userInfo = this.tokenService.getUserInfo();
    this.tenDangNhap = userInfo;
    this.userID = userInfo?.UserID;

    if (!this.userID || this.userID < 1000) {
      this.router.navigate(['/']);
      return;
    }

    this.userRole = this.tokenService.getRole();
    if (this.userRole === 'ADMIN' || this.userRole === 'STAFF') {
      const newSessionId = this.generateSessionId();
      this.setLocalStorageSafely('sessionId', newSessionId);
      this.router.navigate(['/admin']);
      this.initializeWebSocket();
      this.loadChatUsers();
      this.initializeTawkTo();

      if (isPlatformBrowser(this.platformId)) {
        const savedUserId = localStorage.getItem('selectedChatUserId');
        if (savedUserId) {
          const parsedUserId = parseInt(savedUserId, 10);
          if (parsedUserId >= 1000) {
            this.selectedChatUserId = parsedUserId;
            this.loadMessages(parsedUserId);
          } else {
            localStorage.removeItem('selectedChatUserId');
          }
        }
      }
    } else {
      this.router.navigate(['/']);
    }
    this.isComponentSwitched = false;
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private setLocalStorageSafely(key: string, value: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      localStorage.setItem(key, value);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        this.clearLocalStorage();
        localStorage.setItem(key, value);
      }
    }
  }

  private initializeTawkTo(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (typeof window.Tawk_API !== 'undefined' && window.Tawk_API) {
      this.setupTawkToEvents();
    } else {
      const checkTawkInterval = setInterval(() => {
        if (typeof window.Tawk_API !== 'undefined' && window.Tawk_API) {
          clearInterval(checkTawkInterval);
          this.setupTawkToEvents();
        }
      }, 500);

      if (typeof window.Tawk_API !== 'undefined' && window.Tawk_API && typeof window.Tawk_API.onLoad === 'function') {
        window.Tawk_API.onLoad = () => {
          this.setupTawkToEvents();
        };
      }
    }
  }

  private setupTawkToEvents(): void {
    if (!window.Tawk_API) return;

    if (window.Tawk_API.onChatMessageAgent) {
      window.Tawk_API.onChatMessageAgent((message: any) => {
        this.handleTawkToMessage(message);
      });
    }
  }

  private handleTawkToMessage(message: any): void {
    if (!this.selectedChatUserId) return;

    const messageId = this.generateMessageId({
      sender: { id: this.selectedChatUserId },
      receiver: { id: this.userID },
      content: message.message,
      timestamp: new Date().toISOString(),
    });

    if (!this.recentlySentMessages.has(messageId)) {
      this.allMessages.push({
        sender: { id: this.selectedChatUserId, hoTen: `Khách ${this.selectedChatUserId}` },
        receiver: { id: this.userID },
        content: message.message,
        timestamp: new Date().toISOString(),
        senderId: this.selectedChatUserId,
        receiverId: this.userID,
        messageId,
        source: 'tawk.to',
      });
      this.updateMessagesForDisplay();
      this.sortMessages();
      this.cdr.detectChanges();
    }
  }

  private generateMessageId(message: any): string {
    const senderId = message.sender?.id ?? message.senderId;
    const receiverId = message.receiver?.id ?? message.receiverId;
    const normalizedTimestamp = new Date(message.timestamp).setMilliseconds(0);
    return `${senderId}-${receiverId}-${message.content}-${normalizedTimestamp}`;
  }

  showComponent(component: string): void {
    const role = this.tokenService.getRole();
    if (role === 'ADMIN' || role === 'STAFF') {
      this.selectedComponent = component;
      this.selectedNav = component;
      this.isComponentSwitched = true;
      if (component === 'chat') {
        this.loadChatUsers();
        if (this.selectedChatUserId) {
          this.loadMessages(this.selectedChatUserId);
        }
      }
    } else {
      this.router.navigate(['/']);
    }
  }

  toggleSubMenu(menu: string): void {
    this.isSubMenuOpen[menu] = !this.isSubMenuOpen[menu];
    if (menu === 'products') {
      this.showComponent('products');
    }
  }

  showDropdown(): void {
    this.isDropdownVisible = true;
  }

  hideDropdown(): void {
    this.isDropdownVisible = false;
  }

  openUpdateInfo(): void {
    this.isDropdownVisible = false;
    this.modalService.open(AccountInfoAdminComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });
  }

  openChangePasswordModal(): void {
    this.isDropdownVisible = false;
    this.modalService.open(ChangePasswordModalComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });
  }

  logout(): void {
    const token = this.tokenService.getToken();
    if (token) {
      this.tokenService.removeToken();
      this.clearLocalStorage();
      this.isComponentSwitched = false;
      alert('Bạn đã đăng xuất thành công!');
      this.router.navigate(['/login']);
    } else {
      alert('Bạn chưa đăng nhập!');
    }
  }

  private clearLocalStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const keysToRemove = [
      'offlineOrders', 'currentOrderIndex', 'discountCodeInput', 'discountDetails',
      'discountAmount', 'discountMessage', 'totalBeforeDiscount', 'totalAfterDiscount',
      'searchKeyword', 'filterTenNhomHuong', 'filterTenDanhMuc', 'filterTenThuongHieu',
      'allProducts', 'products', 'nhomHuongList', 'danhMucList', 'thuongHieuList',
      'errorMessage', 'isLoading', 'showQuantityModal', 'selectedProduct',
      'selectedQuantity', 'cart', 'orderData', 'quantity', 'volume', 'product',
      'selectedChatUserId',
    ];

    keysToRemove.forEach(key => localStorage.removeItem(key));
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cart-') || key.startsWith('discountUsed_')) {
        localStorage.removeItem(key);
      }
    });
  }

  private initializeWebSocket(): void {
    if (!isPlatformBrowser(this.platformId) || !this.userID || this.userID < 1000) {
      this.errorMessage = 'Không thể khởi tạo chat do ID người dùng không hợp lệ.';
      this.cdr.detectChanges();
      return;
    }

    this.webSocketService.connectAdmin2(this.userID);

    let retryCount = 0;
    const maxRetries = 5;
    const retryInterval = 2000;

    const checkConnection = setInterval(() => {
      if (this.webSocketService.isWebSocketConnected()) {
        clearInterval(checkConnection);
        this.subscribeToMessages();
        this.loadChatUsers();
        if (this.selectedChatUserId) {
          this.loadMessages(this.selectedChatUserId);
        }
        this.setupWebSocketReconnect();
      } else {
        retryCount++;
        this.errorMessage = 'Đang kết nối đến hệ thống chat. Vui lòng đợi.';
        this.cdr.detectChanges();

        if (retryCount >= maxRetries) {
          clearInterval(checkConnection);
          this.errorMessage = 'Không thể kết nối đến hệ thống chat. Vui lòng làm mới trang.';
          this.cdr.detectChanges();
        }
      }
    }, retryInterval);
  }

  private setupWebSocketReconnect(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.reconnectSubscription) {
      this.reconnectSubscription.unsubscribe();
    }

    this.reconnectSubscription = interval(5000).subscribe(() => {
      if (!this.webSocketService.isWebSocketConnected()) {
        this.errorMessage = 'Mất kết nối chat. Đang thử kết nối lại...';
        this.cdr.detectChanges();
        this.webSocketService.connectAdmin2(this.userID!);
      } else {
        if (this.errorMessage === 'Mất kết nối chat. Đang thử kết nối lại...') {
          this.errorMessage = null;
          this.cdr.detectChanges();
        }
      }
    });
  }

  private subscribeToMessages(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }

    this.chatSubscription = this.webSocketService.getChatMessages().subscribe({
      next: (message: any) => {
        if (!message || (!message.sender && !message.senderId)) return;

        const senderId = message.sender?.id ?? message.senderId;
        const receiverId = message.receiver?.id ?? message.receiverId;

        if (!senderId || (receiverId !== null && !receiverId && receiverId !== 0)) return;

        if (senderId < 1000 || (receiverId !== null && receiverId < 1000)) return;

        let customerId: number;
        if (senderId === this.userID) {
          customerId = receiverId;
        } else {
          customerId = senderId;
        }

        if (receiverId === null && senderId !== this.userID) {
          customerId = senderId;
        }

        if (!this.chatUsers.some(user => user.id === customerId)) {
          const userName = senderId === customerId ? message.sender?.hoTen : message.receiver?.hoTen;
          const newUser = {
            id: customerId,
            hoTen: userName || `Khách ${customerId}`,
            vaiTro: 'GUEST' || 'USER'
          };
          this.chatUsers.push(newUser);

          this.http.post(`http://localhost:8080/api/chat/add-user/${this.userID}`, newUser).subscribe({
            next: () => this.loadChatUsers(),
            error: (err) => console.error('[HomeAdmin] Lỗi khi lưu user vào backend:', err)
          });
        }

        const messageId = this.generateMessageId(message);

        if (senderId === this.userID && this.recentlySentMessages.has(messageId)) {
          this.recentlySentMessages.delete(messageId);
          return;
        }

        this.ngZone.run(() => {
          if (!this.processedMessages.has(messageId)) {
            this.processedMessages.add(messageId);
            this.allMessages.push({ ...message, senderId, receiverId, messageId });
          }

          if (this.selectedChatUserId !== customerId) {
            const userName = senderId === customerId ? message.sender?.hoTen : message.receiver?.hoTen;
            this.incomingMessages.push({
              customerId,
              content: message.content,
              hoTen: userName || `Khách ${customerId}`
            });
            const currentCount = this.newMessageCount.get(customerId) || 0;
            this.newMessageCount.set(customerId, currentCount + 1);
            this.updateTotalUnreadMessages();
          } else {
            this.updateMessagesForDisplay();
            this.sortMessages();
            this.newMessageCount.set(customerId, 0);
            this.messages = [...this.messages];
          }

          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.errorMessage = 'Lỗi khi nhận tin nhắn. Vui lòng kiểm tra kết nối.';
        this.cdr.detectChanges();
      }
    });
  }

  private updateMessagesForDisplay(): void {
    if (this.selectedChatUserId) {
      this.messages = this.allMessages.filter(msg => {
        const msgSenderId = msg.sender?.id ?? msg.senderId;
        const msgReceiverId = msg.receiver?.id ?? msg.receiverId;
        return (
          (msgSenderId === this.userID && msgReceiverId === this.selectedChatUserId) ||
          (msgSenderId === this.selectedChatUserId && msgReceiverId === this.userID) ||
          (msgSenderId === this.selectedChatUserId && msgReceiverId === null)
        );
      });
    } else {
      this.messages = [];
    }
    this.sortMessages();
  }

  private loadChatUsers(): void {
    if (!this.userID) {
      this.errorMessage = 'Không thể tải danh sách khách hàng do ID không hợp lệ.';
      return;
    }

    this.http.get<any[]>(`http://localhost:8080/api/chat/users-with-messages/${this.userID}`).subscribe({
      next: (users) => {
        const uniqueUsers = Array.from(new Set(users.map(user => user.id)))
          .map(id => users.find(user => user.id === id))
          .filter(user => user && (user.vaiTro === 'USER' || user.vaiTro === 'GUEST') && user.id >= 1000);

        this.chatUsers = uniqueUsers;

        if (this.chatUsers.length === 1 && !this.selectedChatUserId) {
          this.selectChatUser(this.chatUsers[0].id);
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Lỗi khi tải danh sách khách hàng. Vui lòng thử lại.';
        this.cdr.detectChanges();
      }
    });
  }

  selectChatUser(userId: number): void {
    if (userId < 1000) {
      this.errorMessage = 'ID người dùng không hợp lệ.';
      this.cdr.detectChanges();
      return;
    }

    this.selectedChatUserId = userId;
    this.setLocalStorageSafely('selectedChatUserId', userId.toString());
    this.startTawkToChat(userId);
    this.loadMessages(this.userID);
    this.newMessageCount.set(userId, 0);
    this.updateTotalUnreadMessages();
    this.incomingMessages = this.incomingMessages.filter(msg => msg.customerId !== userId);
    this.cdr.detectChanges();
  }

  private startTawkToChat(userId: number): void {
    if (typeof window.Tawk_API !== 'undefined' && window.Tawk_API) {
      if (typeof window.Tawk_API.maximize === 'function') {
        if (typeof window.Tawk_API.startChat === 'function') {
          window.Tawk_API.startChat();
        }
      } else {
        setTimeout(() => this.startTawkToChat(userId), 500);
      }
    }
  }

  private loadMessages(userId: number): void {
    if (!this.userID) return;

    this.http.get<any[]>(`http://localhost:8080/api/chat/messages/${this.userID}/${userId}`).subscribe({
      next: (messages) => {
        if (this.selectedChatUserId === userId) {
          const newMessages = messages.filter(msg => {
            const senderId = msg.sender?.id ?? msg.senderId;
            const receiverId = msg.receiver?.id ?? msg.receiverId;
            return senderId >= 1000 && (receiverId >= 1000 || receiverId === null);
          });

          newMessages.forEach(msg => {
            msg.messageId = this.generateMessageId(msg);
            if (!this.processedMessages.has(msg.messageId)) {
              this.processedMessages.add(msg.messageId);
              this.allMessages.push(msg);
            }
          });

          this.updateMessagesForDisplay();
          this.newMessageCount.set(userId, 0);
          this.updateTotalUnreadMessages();
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        this.errorMessage = 'Lỗi khi tải tin nhắn. Vui lòng thử lại.';
        this.cdr.detectChanges();
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage || !this.selectedChatUserId || !this.userID || this.selectedChatUserId < 1000 || this.userID < 1000) {
      this.errorMessage = 'Không thể gửi tin nhắn. Vui lòng kiểm tra thông tin.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.webSocketService.isWebSocketConnected()) {
      this.errorMessage = 'Kết nối WebSocket đang bị gián đoạn. Tin nhắn sẽ được gửi khi kết nối được khôi phục.';
      this.cdr.detectChanges();
      return;
    }

    if (this.isSending) return;

    this.isSending = true;

    const newMessageObj = {
      sender: { id: this.userID },
      receiver: { id: this.selectedChatUserId },
      content: this.newMessage,
      timestamp: new Date().toISOString(),
      senderId: this.userID,
      receiverId: this.selectedChatUserId,
      messageId: ''
    };

    newMessageObj.messageId = this.generateMessageId(newMessageObj);

    if (!this.processedMessages.has(newMessageObj.messageId)) {
      this.processedMessages.add(newMessageObj.messageId);
      this.allMessages.push(newMessageObj);
      this.updateMessagesForDisplay();
    }

    this.recentlySentMessages.add(newMessageObj.messageId);
    setTimeout(() => this.recentlySentMessages.delete(newMessageObj.messageId), 5000);

    try {
      this.webSocketService.sendChatMessage(this.userID, this.selectedChatUserId, this.newMessage);
    } catch (error) {
      this.errorMessage = 'Không thể gửi tin nhắn do lỗi kết nối. Vui lòng thử lại.';
      this.cdr.detectChanges();
    }

    this.newMessage = '';
    this.isSending = false;
    this.cdr.detectChanges();
  }

  private sortMessages(): void {
    this.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  private updateTotalUnreadMessages(): void {
    this.totalUnreadMessages = Array.from(this.newMessageCount.values()).reduce((sum, count) => sum + count, 0);
  }

  ngAfterViewChecked(): void {
    if (isPlatformBrowser(this.platformId) && this.chatMessagesRef) {
      const chatMessages = this.chatMessagesRef.nativeElement;
      if (chatMessages && chatMessages.scrollHeight !== this.lastScrollHeight) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
        this.lastScrollHeight = chatMessages.scrollHeight;
      }
    }
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.webSocketService.disconnect();
    if (this.chatSubscription) this.chatSubscription.unsubscribe();
    if (this.reconnectSubscription) this.reconnectSubscription.unsubscribe();

    if (typeof window.Tawk_API !== 'undefined' && window.Tawk_API && typeof window.Tawk_API.endChat === 'function') {
      window.Tawk_API.endChat();
    }
  }
}