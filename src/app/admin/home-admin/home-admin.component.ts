import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewChecked, ViewChild, ElementRef, PLATFORM_ID, Inject, NgZone } from '@angular/core';
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
    NotHuongComponent
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
    console.log('[HomeAdmin] Người dùng đăng nhập:', this.tenDangNhap, 'với userID:', this.userID);

    if (!this.userID || this.userID < 1000) {
      console.error('[HomeAdmin] ID người dùng không hợp lệ:', this.userID);
      this.router.navigate(['/']);
      return;
    }

    this.userRole = this.tokenService.getRole();
    console.log('[HomeAdmin] Vai trò người dùng:', this.userRole);

    if (this.userRole === 'ADMIN' || this.userRole === 'STAFF') {
      const newSessionId = this.generateSessionId();
      this.setLocalStorageSafely('sessionId', newSessionId);
      console.log('[HomeAdmin] Tạo sessionId mới:', newSessionId);

      this.router.navigate(['/admin']);
      this.initializeWebSocket();
      this.loadChatUsers();
      this.initializeTawkTo();

      if (isPlatformBrowser(this.platformId)) {
        const savedUserId = localStorage.getItem('selectedChatUserId');
        if (savedUserId) {
          const parsedUserId = parseInt(savedUserId, 10);
          if (parsedUserId >= 1000) {
            console.log('[HomeAdmin] Khôi phục selectedChatUserId:', parsedUserId);
            this.selectedChatUserId = parsedUserId;
            this.loadMessages(parsedUserId);
          } else {
            console.warn('[HomeAdmin] ID người dùng đã lưu không hợp lệ:', parsedUserId);
            localStorage.removeItem('selectedChatUserId');
          }
        }
      }
    } else {
      console.error('[HomeAdmin] Vai trò không hợp lệ, điều hướng về trang chủ.');
      this.router.navigate(['/']);
    }
    this.isComponentSwitched = false;
  }

  private initializeTawkTo(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('[HomeAdmin] Bỏ qua khởi tạo Tawk.to trên server-side');
      return;
    }

    if (typeof window.Tawk_API !== 'undefined' && window.Tawk_API) {
      console.log('[HomeAdmin] Tawk.to API đã sẵn sàng');
      this.setupTawkToEvents();
    } else {
      const checkTawkInterval = setInterval(() => {
        if (typeof window.Tawk_API !== 'undefined' && window.Tawk_API) {
          clearInterval(checkTawkInterval);
          console.log('[HomeAdmin] Tawk.to API đã tải xong');
          this.setupTawkToEvents();
        }
      }, 500);

      if (typeof window.Tawk_API !== 'undefined' && window.Tawk_API && typeof window.Tawk_API.onLoad === 'function') {
        window.Tawk_API.onLoad = () => {
          console.log('[HomeAdmin] Tawk.to onLoad triggered');
          this.setupTawkToEvents();
        };
      }
    }
  }

  private setupTawkToEvents(): void {
    if (!window.Tawk_API) {
      console.error('[HomeAdmin] Tawk_API không tồn tại');
      return;
    }

    window.Tawk_API.onMessageReceived = (message: any) => {
      console.log('[HomeAdmin] Tawk.to: Tin nhắn từ người dùng:', message);
      this.handleTawkToMessage(message);
    };
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

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private setLocalStorageSafely(key: string, value: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('[HomeAdmin] Không thể truy cập localStorage trên server-side');
      return;
    }

    try {
      localStorage.setItem(key, value);
      console.log('[HomeAdmin] Đã lưu vào localStorage:', { key, value });
    } catch (e) {
      console.error('[HomeAdmin] Lỗi khi lưu vào localStorage:', e);
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.warn('[HomeAdmin] Dung lượng localStorage đầy, dọn dẹp dữ liệu cũ...');
        this.clearLocalStorage();
        try {
          localStorage.setItem(key, value);
          console.log('[HomeAdmin] Đã lưu lại vào localStorage sau khi dọn dẹp:', { key, value });
        } catch (retryError) {
          console.error('[HomeAdmin] Không thể lưu vào localStorage sau khi dọn dẹp:', retryError);
        }
      }
    }
  }

  showComponent(component: string): void {
    const role = this.tokenService.getRole();
    console.log('[HomeAdmin] Vai trò hiện tại:', role);

    if (role === 'ADMIN' || role === 'STAFF') {
      this.selectedComponent = component;
      this.selectedNav = component;
      this.isComponentSwitched = true;
      console.log('[HomeAdmin] Hiển thị component:', component);
      if (component === 'chat') {
        this.loadChatUsers();
        if (this.selectedChatUserId) {
          this.loadMessages(this.selectedChatUserId);
        }
      }
    } else {
      console.error('[HomeAdmin] Người dùng không phải admin, điều hướng về trang chủ.');
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
    console.log('[HomeAdmin] Hiển thị dropdown menu');
  }

  hideDropdown(): void {
    this.isDropdownVisible = false;
    console.log('[HomeAdmin] Ẩn dropdown menu');
  }

  openUpdateInfo(): void {
    this.isDropdownVisible = false;
    const modalRef = this.modalService.open(AccountInfoAdminComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });
  }

  openChangePasswordModal(): void {
    this.isDropdownVisible = false;
    console.log('[HomeAdmin] Mở modal đổi mật khẩu');
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
      console.log('[HomeAdmin] Đăng xuất thành công');
      alert('Bạn đã đăng xuất thành công!');
      this.router.navigate(['/login']);
    } else {
      console.warn('[HomeAdmin] Người dùng chưa đăng nhập');
      alert('Bạn chưa đăng nhập!');
    }
  }

  private clearLocalStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('[HomeAdmin] Không thể truy cập localStorage trên server-side');
      return;
    }

    console.log('[HomeAdmin] Dữ liệu localStorage trước khi xóa:', { ...localStorage });

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

    console.log('[HomeAdmin] Đã xóa dữ liệu localStorage khi đăng xuất');
    console.log('[HomeAdmin] Dữ liệu localStorage sau khi xóa:', { ...localStorage });
  }

  private initializeWebSocket(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('[HomeAdmin] Bỏ qua initializeWebSocket trên server-side');
      return;
    }

    if (!this.userID || this.userID < 1000) {
      console.error('[HomeAdmin] userID không hợp lệ:', this.userID);
      this.errorMessage = 'Không thể khởi tạo chat do ID người dùng không hợp lệ.';
      this.cdr.detectChanges();
      return;
    }

    console.log('[HomeAdmin] Khởi tạo WebSocket cho admin với ID:', this.userID);
    this.webSocketService.connectAdmin2(this.userID);

    let retryCount = 0;
    const maxRetries = 5;
    const retryInterval = 2000;

    const checkConnection = setInterval(() => {
      if (this.webSocketService.isWebSocketConnected()) {
        clearInterval(checkConnection);
        console.log('[HomeAdmin] WebSocket đã kết nối thành công');
        this.subscribeToMessages();
        this.loadChatUsers();
        if (this.selectedChatUserId) {
          this.loadMessages(this.selectedChatUserId);
        }
        this.setupWebSocketReconnect();
      } else {
        retryCount++;
        console.warn(`[HomeAdmin] WebSocket chưa kết nối, thử lại lần ${retryCount}/${maxRetries}...`);
        this.errorMessage = 'Đang kết nối đến hệ thống chat. Vui lòng đợi.';
        this.cdr.detectChanges();

        if (retryCount >= maxRetries) {
          clearInterval(checkConnection);
          console.error('[HomeAdmin] Không thể kết nối WebSocket sau nhiều lần thử.');
          this.errorMessage = 'Không thể kết nối đến hệ thống chat. Vui lòng làm mới trang.';
          this.cdr.detectChanges();
        }
      }
    }, retryInterval);
  }

  private setupWebSocketReconnect(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('[HomeAdmin] Bỏ qua setupWebSocketReconnect trên server-side');
      return;
    }

    if (this.reconnectSubscription) {
      this.reconnectSubscription.unsubscribe();
    }

    this.reconnectSubscription = interval(5000).subscribe(() => {
      if (!this.webSocketService.isWebSocketConnected()) {
        console.warn('[HomeAdmin] WebSocket đã mất kết nối. Thử kết nối lại...');
        this.errorMessage = 'Mất kết nối chat. Đang thử kết nối lại...';
        this.cdr.detectChanges();
        this.webSocketService.connectAdmin2(this.userID!);
      } else {
        if (this.errorMessage === 'Mất kết nối chat. Đang thử kết nối lại...') {
          this.errorMessage = null;
          console.log('[HomeAdmin] Đã khôi phục kết nối WebSocket');
          this.cdr.detectChanges();
        }
      }
    });
  }

  private generateMessageId(message: any): string {
    const senderId = message.sender?.id ?? message.senderId;
    const receiverId = message.receiver?.id ?? message.receiverId;
    const normalizedTimestamp = new Date(message.timestamp).setMilliseconds(0);
    return `${senderId}-${receiverId}-${message.content}-${normalizedTimestamp}`;
  }

 private subscribeToMessages(): void {
  if (!isPlatformBrowser(this.platformId)) {
    console.warn('[HomeAdmin] Bỏ qua subscribeToMessages trên server-side');
    return;
  }

  if (this.chatSubscription) {
    this.chatSubscription.unsubscribe();
    console.log('[HomeAdmin] Đã hủy subscription cũ');
  }

  console.log(`[HomeAdmin] Đăng ký subscription cho /topic/admin-messages/${this.userID}`);
  this.chatSubscription = this.webSocketService.getChatMessages().subscribe({
    next: (message: any) => {
      console.log('[HomeAdmin] Admin nhận được tin nhắn:', message);
      if (!message || (!message.sender && !message.senderId)) {
        console.error('[HomeAdmin] Tin nhắn không hợp lệ, thiếu sender:', message);
        return;
      }

      const senderId = message.sender?.id ?? message.senderId;
      const receiverId = message.receiver?.id ?? message.receiverId;

      console.log('[HomeAdmin] Kiểm tra sender và receiver:', { senderId, receiverId });

      if (!senderId || (receiverId !== null && !receiverId && receiverId !== 0)) {
        console.error('[HomeAdmin] Sender hoặc receiver không có ID hợp lệ:', { senderId, receiverId });
        return;
      }

      if (senderId < 1000 || (receiverId !== null && receiverId < 1000)) {
        console.warn('[HomeAdmin] ID không hợp lệ:', { senderId, receiverId });
        return;
      }

      let customerId: number;
      if (senderId === this.userID) {
        customerId = receiverId;
      } else {
        customerId = senderId;
      }

      if (receiverId === null && senderId !== this.userID) {
        customerId = senderId;
      }

      console.log('[HomeAdmin] Xử lý tin nhắn:', { senderId, receiverId, customerId, selectedChatUserId: this.selectedChatUserId });

      if (!this.chatUsers.some(user => user.id === customerId)) {
        const userName = senderId === customerId ? message.sender?.hoTen : message.receiver?.hoTen;
        const newUser = {
          id: customerId,
          hoTen: userName || `Khách ${customerId}`,
          vaiTro: 'GUEST' || 'USER'
        };
        this.chatUsers.push(newUser);
        console.log('[HomeAdmin] Đã thêm khách hàng vào chatUsers:', newUser);

        this.http.post(`http://localhost:8080/api/chat/add-user/${this.userID}`, newUser).subscribe({
          next: () => {
            console.log('[HomeAdmin] Đã lưu user vào backend:', newUser);
            this.loadChatUsers();
          },
          error: (err) => console.error('[HomeAdmin] Lỗi khi lưu user vào backend:', err)
        });
      }

      const messageId = this.generateMessageId(message);

      console.log('[HomeAdmin] Trước khi kiểm tra trùng lặp:', { messageId, senderId, isAdmin: senderId === this.userID });

      if (senderId === this.userID && this.recentlySentMessages.has(messageId)) {
        console.log('[HomeAdmin] Bỏ qua tin nhắn vừa gửi từ admin:', message);
        this.recentlySentMessages.delete(messageId);
        return;
      }



      this.ngZone.run(() => {
        this.allMessages.push({ ...message, senderId, receiverId, messageId });
        console.log('[HomeAdmin] Đã thêm tin nhắn vào allMessages:', { messageId, senderId, content: message.content });
        console.log('[HomeAdmin] Số tin nhắn trong allMessages sau khi thêm:', this.allMessages.length);

        console.log('[HomeAdmin] Trạng thái trước khi xử lý:', {
          selectedChatUserId: this.selectedChatUserId,
          customerId,
          isMatch: this.selectedChatUserId === customerId
        });
        const twoSecondsAgo = new Date(Date.now() - 2000); // lùi 2s
        // Kiểm tra nếu tin nhắn là "Tôi cần tư vấn" thì tự động trả lời
        if (message.content === 'Tôi cần tư vấn') {
          const autoReplyMessage = 'Bạn vui lòng hờ chúng tôi trong giây lát.Nhân viên tư vấn sẽ liên hệ lại bạn ngay.';
          const autoReplyObj = {
            sender: { id: this.userID },
            receiver: { id: customerId },
            content: autoReplyMessage,
            timestamp: twoSecondsAgo.toISOString(),
            senderId: this.userID,
            receiverId: customerId,
            messageId: ''
          };

          autoReplyObj.messageId = this.generateMessageId(autoReplyObj);

          const autoReplyExists = this.allMessages.some(msg => msg.messageId === autoReplyObj.messageId);
          if (!autoReplyExists) {
            this.allMessages.push(autoReplyObj);
            console.log('[HomeAdmin] Đã thêm tin nhắn tự động vào allMessages:', autoReplyObj);

            // Gửi tin nhắn tự động qua WebSocket
            this.webSocketService.sendChatMessage(this.userID!, customerId, autoReplyMessage);
            console.log('[HomeAdmin] Đã gửi tin nhắn tự động qua WebSocket:', autoReplyMessage);

            // Gửi tin nhắn tự động qua Tawk.to
            if (typeof window.Tawk_API !== 'undefined' && window.Tawk_API) {
              window.Tawk_API.addMessage({
                message: autoReplyMessage,
                sender: 'Admin',
              });
              console.log('[HomeAdmin] Đã gửi tin nhắn tự động qua Tawk.to:', autoReplyMessage);
            }

            this.recentlySentMessages.add(autoReplyObj.messageId);
            setTimeout(() => this.recentlySentMessages.delete(autoReplyObj.messageId), 5000);

            this.updateMessagesForDisplay();
            this.sortMessages();
            this.cdr.detectChanges();
          }
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
          console.log('[HomeAdmin] Tăng số tin nhắn chưa đọc cho user', customerId, ':', this.newMessageCount.get(customerId));
          this.updateTotalUnreadMessages();
        } else {
          console.log('[HomeAdmin] Hiển thị tin nhắn ngay lập tức cho user:', customerId);
          this.updateMessagesForDisplay();
          this.sortMessages();
          this.newMessageCount.set(customerId, 0);
          console.log('[HomeAdmin] Đã thêm tin nhắn và hiển thị ngay cho user:', customerId);
          this.messages = [...this.messages];
          console.log('[HomeAdmin] Số tin nhắn hiển thị:', this.messages.length);
        }

        this.cdr.detectChanges();
        console.log('[HomeAdmin] Đã gọi detectChanges()');
      });
    },
    error: (error) => {
      console.error('[HomeAdmin] Lỗi khi nhận tin nhắn:', error);
      this.errorMessage = 'Lỗi khi nhận tin nhắn. Vui lòng kiểm tra kết nối.';
      this.cdr.detectChanges();
    },
    complete: () => {
      console.log('[HomeAdmin] Subscription đã hoàn tất');
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
    console.log('[HomeAdmin] Đã cập nhật messages để hiển thị:', this.messages);
    console.log('[HomeAdmin] Số tin nhắn hiển thị:', this.messages.length);
  }

  private loadChatUsers(): void {
    console.log('[HomeAdmin] Bắt đầu loadChatUsers, userID:', this.userID);
    if (!this.userID) {
        console.error('[HomeAdmin] userID không hợp lệ, không thể tải danh sách khách hàng.');
        this.errorMessage = 'Không thể tải danh sách khách hàng do ID không hợp lệ.';
        return;
    }

    this.http.get<any[]>(`http://localhost:8080/api/chat/users-with-messages/${this.userID}`).subscribe({
        next: (users) => {
            console.log('[HomeAdmin] Dữ liệu users thô từ API:', users);

            // Sửa lỗi: Sử dụng user.id === id để tìm đúng user theo id
            const uniqueUsers = Array.from(new Set(users.map(user => user.id)))
                .map(id => users.find(user => user.id === id))
                .filter(user => user && (user.vaiTro === 'USER' || user.vaiTro === 'GUEST') && user.id >= 1000);

            console.log('[HomeAdmin] Đã tải danh sách chatUsers:', uniqueUsers);
            this.chatUsers = uniqueUsers;

            if (this.chatUsers.length === 0) {
                console.warn('[HomeAdmin] Không có khách hàng nào nhắn tin với admin ID:', this.userID);
            } else {
                this.chatUsers.forEach(user => {
                    console.log('[HomeAdmin] User trong chatUsers:', user);
                });

                if (this.chatUsers.length === 1 && !this.selectedChatUserId) {
                    this.selectChatUser(this.chatUsers[0].id);
                }
            }
            this.cdr.detectChanges();
        },
        error: (error) => {
            console.error('[HomeAdmin] Lỗi khi tải danh sách chatUsers:', error);
            this.errorMessage = 'Lỗi khi tải danh sách khách hàng. Vui lòng thử lại.';
            this.cdr.detectChanges();
        }
    });
}

  selectChatUser(userId: number): void {
    if (userId < 1000) {
      console.error('[HomeAdmin] ID người dùng không hợp lệ:', userId);
      this.errorMessage = 'ID người dùng không hợp lệ.';
      this.cdr.detectChanges();
      return;
    }

    console.log('[HomeAdmin] Chọn khách hàng để chat, userId:', userId);
    this.selectedChatUserId = userId;
    this.setLocalStorageSafely('selectedChatUserId', userId.toString());
    console.log('[HomeAdmin] Đã gán selectedChatUserId:', this.selectedChatUserId);
    this.startTawkToChat(userId);
    this.loadMessages(userId);
    this.newMessageCount.set(userId, 0);
    this.updateTotalUnreadMessages();
    this.incomingMessages = this.incomingMessages.filter(msg => msg.customerId !== userId);
    this.cdr.detectChanges();
  }

  private startTawkToChat(userId: number): void {
    if (typeof window.Tawk_API !== 'undefined' && window.Tawk_API) {
      window.Tawk_API.startChat();
      console.log(`[HomeAdmin] Đã khởi tạo phiên chat Tawk.to cho user ${userId}`);
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
            const messageExists = this.allMessages.some(existingMsg => existingMsg.messageId === msg.messageId);
            if (!messageExists) {
              this.allMessages.push(msg);
            }
          });

          console.log('[HomeAdmin] Số tin nhắn trong allMessages sau khi tải từ backend:', this.allMessages.length);

          this.updateMessagesForDisplay();
          this.newMessageCount.set(userId, 0);
          this.updateTotalUnreadMessages();
          console.log('[HomeAdmin] Đã tải và đồng bộ tin nhắn cho user', userId, ':', this.messages);
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('[HomeAdmin] Lỗi khi tải tin nhắn:', error);
        this.errorMessage = 'Lỗi khi tải tin nhắn. Vui lòng thử lại.';
        this.cdr.detectChanges();
      }
    });
  }

  sendMessage(): void {
    console.log('[HomeAdmin] Gọi hàm sendMessage()');
    if (!this.newMessage || !this.selectedChatUserId || !this.userID || this.selectedChatUserId < 1000 || this.userID < 1000) {
      console.error('[HomeAdmin] Không thể gửi tin nhắn:', {
        newMessage: this.newMessage,
        selectedChatUserId: this.selectedChatUserId,
        userID: this.userID,
      });
      this.errorMessage = 'Không thể gửi tin nhắn. Vui lòng kiểm tra thông tin.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.webSocketService.isWebSocketConnected()) {
      this.errorMessage = 'Kết nối WebSocket đang bị gián đoạn. Tin nhắn sẽ được gửi khi kết nối được khôi phục.';
      console.warn('[HomeAdmin] WebSocket chưa kết nối khi gửi tin nhắn');
      this.cdr.detectChanges();
      return;
    }

    if (this.isSending) {
      console.warn('[HomeAdmin] Đang gửi tin nhắn, vui lòng chờ...');
      return;
    }

    this.isSending = true;

    console.log('[HomeAdmin] Gửi tin nhắn từ admin', this.userID, 'đến user', this.selectedChatUserId, ':', this.newMessage);
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

    const messageExists = this.allMessages.some(msg => msg.messageId === newMessageObj.messageId);
    if (!messageExists) {
      this.allMessages.push(newMessageObj);
      console.log('[HomeAdmin] Số tin nhắn trong allMessages sau khi gửi:', this.allMessages.length);
      this.updateMessagesForDisplay();
    } else {
      console.warn('[HomeAdmin] Tin nhắn vừa gửi đã tồn tại, không thêm lại:', newMessageObj);
    }

    this.recentlySentMessages.add(newMessageObj.messageId);
    setTimeout(() => this.recentlySentMessages.delete(newMessageObj.messageId), 5000);

    // Bỏ phần gửi qua Tawk.to vì phương thức addMessage không tồn tại
    this.cdr.detectChanges();

    try {
      this.webSocketService.sendChatMessage(this.userID, this.selectedChatUserId, this.newMessage);
      console.log('[HomeAdmin] Đã gửi tin nhắn qua WebSocket, chờ cập nhật');
    } catch (error) {
      console.error('[HomeAdmin] Lỗi khi gửi tin nhắn qua WebSocket:', error);
      this.errorMessage = 'Không thể gửi tin nhắn do lỗi kết nối. Vui lòng thử lại.';
      this.cdr.detectChanges();
    }

    this.newMessage = '';
    this.isSending = false;
  }

  private sortMessages(): void {
    this.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    console.log('[HomeAdmin] Đã sắp xếp tin nhắn:', this.messages.length);
  }

  private updateTotalUnreadMessages(): void {
    this.totalUnreadMessages = Array.from(this.newMessageCount.values()).reduce((sum, count) => sum + count, 0);
    console.log('[HomeAdmin] Tổng số tin nhắn chưa đọc:', this.totalUnreadMessages);
  }

  ngAfterViewChecked(): void {
    if (isPlatformBrowser(this.platformId) && this.chatMessagesRef) {
      const chatMessages = this.chatMessagesRef.nativeElement;
      if (chatMessages && chatMessages.scrollHeight !== this.lastScrollHeight) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
        this.lastScrollHeight = chatMessages.scrollHeight;
        console.log('[HomeAdmin] Cuộn xuống cuối khung chat');
      }
    }
  }

  ngOnDestroy(): void {
    console.log('[HomeAdmin] Hủy component, ngắt kết nối WebSocket');
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('[HomeAdmin] Bỏ qua ngOnDestroy trên server-side');
      return;
    }

    this.webSocketService.disconnect();
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
      console.log('[HomeAdmin] Đã hủy chat subscription');
    }
    if (this.reconnectSubscription) {
      this.reconnectSubscription.unsubscribe();
      console.log('[HomeAdmin] Đã hủy reconnect subscription');
    }

    // Kết thúc phiên chat Tawk.to
    if (typeof window.Tawk_API !== 'undefined' && window.Tawk_API) {
      window.Tawk_API.endChat();
    }
  }
}
