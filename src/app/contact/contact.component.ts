import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewChecked, ViewChild, ElementRef, PLATFORM_ID, Inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TokenService } from '../service/token.service';
import { Subscription, interval } from 'rxjs';
import { WebSocketService } from '../service/WebSocketService';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnInit, OnDestroy, AfterViewChecked {
  isChatOpen: boolean = true;
  messages: any[] = [];
  newMessage: string = '';
  private lastSentTime: number = 0;
  private readonly DEBOUNCE_TIME: number = 1000;
  userId: number | null = null;
  errorMessage: string | null = null;
  isLoading: boolean = false;
  isSending: boolean = false;
  private chatSubscription: Subscription | null = null;
  private reconnectSubscription: Subscription | null = null;
  private lastScrollHeight: number = 0;
  private processedMessages: Set<string> = new Set();
  private shouldScroll: boolean = false;

  @ViewChild('chatMessages', { static: false }) chatMessagesRef!: ElementRef<HTMLDivElement>;

  constructor(
    private tokenService: TokenService,
    private webSocketService: WebSocketService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('[ContactComponent] Đang chạy trên server-side, bỏ qua khởi tạo chat');
      return;
    }

    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      this.userId = parseInt(storedUserId, 10);
      if (this.userId >= 1000) {
        console.log('[ContactComponent] Sử dụng userId từ localStorage:', this.userId);
        this.initializeChat();
        this.initializeTawkTo();
        this.addInitialMessages();
        return;
      } else {
        console.warn('[ContactComponent] userId trong localStorage không hợp lệ, xóa và tạo mới:', this.userId);
        localStorage.removeItem('userId');
      }
    }

    const userInfo = this.tokenService.getUserInfo();
    this.userId = userInfo?.UserID;

    if (!this.userId) {
      console.log('[ContactComponent] Không có userId, tạo guest user');
      this.createGuestUser();
    } else {
      console.log('[ContactComponent] Sử dụng userId từ token:', this.userId);
      localStorage.setItem('userId', this.userId.toString());
      this.initializeChat();
      this.initializeTawkTo();
      this.addInitialMessages();
    }
  }

  private normalizeTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      console.error('[ContactComponent] Timestamp không hợp lệ:', timestamp);
      return new Date().toISOString();
    }
    return date.toISOString(); // Giữ nguyên mili giây
  }

  private generateMessageKey(message: any): string {
    const senderId = message.sender?.id ?? message.senderId;
    return `${message.content}-${senderId}`;
  }

  private addInitialMessages(): void {
    const welcomeMessage = `Chào bạn! Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi sẽ hỗ trợ bạn ngay lập tức.`;
    const welcomeKey = `welcome-${this.userId}-${Date.now()}`;
    if (!this.processedMessages.has(welcomeKey)) {
      this.processedMessages.add(welcomeKey);
      const timestamp = new Date().toISOString();
      this.messages.push({
        id: null,
        sender: { id: 0, hoTen: 'Hệ thống', tenDangNhap: 'Hệ thống' },
        receiver: { id: this.userId },
        content: welcomeMessage,
        timestamp: timestamp,
        senderId: 0,
        receiverId: this.userId,
        source: 'system',
        isOption: false,
      });
    }

    const options = [
      { content: 'Tôi cần tư vấn', key: `option-consult-${this.userId}-${Date.now()}` },
      { content: 'Giá sản phẩm này bao nhiêu?', key: `option-price-${this.userId}-${Date.now()}` },
    ];

    options.forEach(option => {
      if (!this.processedMessages.has(option.key)) {
        this.processedMessages.add(option.key);
        const timestamp = new Date().toISOString();
        this.messages.push({
          id: null,
          sender: { id: 0, hoTen: 'Hệ thống', tenDangNhap: 'Hệ thống' },
          receiver: { id: this.userId },
          content: option.content,
          timestamp: timestamp,
          senderId: 0,
          receiverId: this.userId,
          source: 'system',
          isOption: true,
        });
      }
    });

    this.sortMessages();
    this.shouldScroll = true;
    this.cdr.detectChanges();
    console.log('[ContactComponent] Đã thêm tin nhắn chào mừng và tùy chọn ban đầu:', this.messages);
  }

  private initializeTawkTo(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('[ContactComponent] Bỏ qua khởi tạo Tawk.to trên server-side');
      return;
    }

    const checkTawkInterval = setInterval(() => {
      if (typeof window.Tawk_API !== 'undefined' && window.Tawk_API) {
        clearInterval(checkTawkInterval);
        console.log('[ContactComponent] Tawk.to API đã sẵn sàng');
        this.setupTawkTo();
      } else {
        console.log('[ContactComponent] Đang chờ Tawk.to API tải...');
      }
    }, 500);

    setTimeout(() => {
      if (typeof window.Tawk_API === 'undefined') {
        clearInterval(checkTawkInterval);
        console.error('[ContactComponent] Không thể tải Tawk.to API sau 10 giây');
      }
    }, 10000);
  }

  private setupTawkTo(): void {
    if (!window.Tawk_API) {
      console.error('[ContactComponent] Tawk_API không tồn tại');
      return;
    }

    window.Tawk_API.hideWidget();
    console.log('[ContactComponent] Đã ẩn widget Tawk.to');

    window.Tawk_API.startChat();
    console.log('[ContactComponent] Đã khởi tạo phiên chat Tawk.to');

    this.notifyAdminOfNewChat();

    window.Tawk_API.onMessageSent = (message: any) => {
      console.log('[ContactComponent] Tawk.to: Tin nhắn từ người dùng:', message);
      this.handleTawkToMessage(message);
    };

    window.Tawk_API.onMessageReceived = (message: any) => {
      console.log('[ContactComponent] Tawk.to: Tin nhắn từ admin:', message);
      this.handleTawkToMessage(message);
    };
  }

  selectOption(optionContent: string): void {
    const currentTime = Date.now();
    if (currentTime - this.lastSentTime < this.DEBOUNCE_TIME) {
      console.log('[ContactComponent] Bỏ qua nhấn liên tiếp:', optionContent);
      return;
    }

    if (!this.userId) return;

    const timestamp = new Date().toISOString();
    const message = {
      content: optionContent,
      senderId: this.userId,
      receiverId: null,
      timestamp: timestamp,
    };
    const messageKey = this.generateMessageKey(message);

    // Thêm tin nhắn vào messages trước để đảm bảo thứ tự
    if (!this.processedMessages.has(messageKey)) {
      this.processedMessages.add(messageKey);
      this.messages.push({
        id: null,
        sender: { id: this.userId, tenDangNhap: `Khách ${this.userId}` },
        receiver: null,
        content: optionContent,
        timestamp: timestamp,
        senderId: this.userId,
        receiverId: null,
        source: 'tawk.to',
        isOption: false,
      });
    } else {
      const existingMessage = this.messages.find(msg => this.generateMessageKey(msg) === messageKey);
      if (existingMessage && new Date(timestamp) > new Date(existingMessage.timestamp)) {
        existingMessage.timestamp = timestamp;
      }
    }

    this.sortMessages();
    this.shouldScroll = true;
    this.cdr.detectChanges();

    // Gửi tin nhắn sau khi đã thêm vào messages
    if (window.Tawk_API) {
      try {
        window.Tawk_API.addMessage({
          message: optionContent,
          sender: `Khách ${this.userId}`,
        });
        console.log('[ContactComponent] Đã gửi tùy chọn qua Tawk.to:', optionContent);
      } catch (error) {
        console.error('[ContactComponent] Lỗi khi gửi tùy chọn Tawk.to:', error);
      }
    }

    this.webSocketService.sendChatMessage(this.userId, null, optionContent);
    console.log('[ContactComponent] Đã gửi tùy chọn qua WebSocket:', optionContent);

    this.lastSentTime = currentTime;
  }

  private notifyAdminOfNewChat(): void {
    if (!this.userId || !this.webSocketService.isWebSocketConnected()) return;

    const notificationMessage = `Người dùng ${this.userId} đã bắt đầu phiên chat qua Tawk.to`;
    this.webSocketService.sendChatMessage(this.userId, null, notificationMessage);
    console.log('[ContactComponent] Đã thông báo cho admin về phiên chat Tawk.to mới:', notificationMessage);
  }

  private handleTawkToMessage(message: any): void {
    const timestamp = this.normalizeTimestamp(new Date().toISOString());
    const senderId = message.sender === 'Hệ thống' || message.sender === 'Admin' ? 0 : this.userId;
    const newMessage = {
      id: null,
      sender: { id: senderId, hoTen: senderId === 0 ? message.sender : `Khách ${this.userId}`, tenDangNhap: senderId === 0 ? message.sender : `Khách ${this.userId}` },
      receiver: { id: senderId === 0 ? this.userId : 0 },
      content: message.message,
      timestamp: timestamp,
      senderId: senderId,
      receiverId: senderId === 0 ? this.userId : 0,
      source: 'tawk.to',
      isOption: false,
    };

    const messageKey = this.generateMessageKey(newMessage);
    if (!this.processedMessages.has(messageKey)) {
      this.processedMessages.add(messageKey);
      this.messages.push(newMessage);
    } else {
      const existingMessage = this.messages.find(msg => this.generateMessageKey(msg) === messageKey);
      if (existingMessage && new Date(timestamp) > new Date(existingMessage.timestamp)) {
        existingMessage.timestamp = timestamp;
      }
    }

    this.sortMessages();
    this.shouldScroll = true;
    this.cdr.detectChanges();
    console.log('[ContactComponent] Đã xử lý tin nhắn Tawk.to:', newMessage);
  }

  private createGuestUser(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('[ContactComponent] Bỏ qua createGuestUser trên server-side');
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.http.post<{ userId: number }>('http://localhost:8080/api/chat/create-guest', {}).subscribe({
      next: (response) => {
        this.userId = response.userId;
        if (this.userId < 1000) {
          console.error('[ContactComponent] ID khách không hợp lệ:', this.userId);
          this.errorMessage = 'Không thể tạo tài khoản khách. Vui lòng thử lại sau.';
          this.isLoading = false;
          return;
        }
        console.log('[ContactComponent] Đã tạo guest user với ID:', this.userId);
        localStorage.setItem('userId', this.userId.toString());
        this.isLoading = false;
        this.initializeChat();
        this.initializeTawkTo();
        this.addInitialMessages();
      },
      error: (error) => {
        console.error('[ContactComponent] Lỗi khi tạo guest user:', error);
        this.errorMessage = 'Lỗi khi tạo tài khoản khách. Vui lòng thử lại sau.';
        this.isLoading = false;
      }
    });
  }

  initializeChat(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('[ContactComponent] Bỏ qua initializeChat trên server-side');
      return;
    }

    if (!this.userId || this.userId < 1000) {
      console.error('[ContactComponent] ID người dùng không hợp lệ:', this.userId);
      this.errorMessage = 'ID người dùng không hợp lệ. Vui lòng tải lại trang.';
      return;
    }

    console.log('[ContactComponent] UserID của khách hàng:', this.userId);
    this.webSocketService.connect(this.userId);

    let retryCount = 0;
    const maxRetries = 5;
    const retryInterval = 1000;

    const checkConnection = setInterval(() => {
      if (this.webSocketService.isWebSocketConnected()) {
        clearInterval(checkConnection);
        console.log('[ContactComponent] WebSocket đã kết nối thành công cho khách hàng:', this.userId);
        this.loadMessages();
        this.subscribeToMessages();
        this.setupWebSocketReconnect();
      } else {
        retryCount++;
        console.warn(`[ContactComponent] WebSocket chưa kết nối, thử lại lần ${retryCount}/${maxRetries}...`);
        this.errorMessage = 'Đang kết nối đến hệ thống chat. Vui lòng đợi...';
        if (retryCount >= maxRetries) {
          clearInterval(checkConnection);
          console.error('[ContactComponent] Không thể kết nối WebSocket sau nhiều lần thử.');
          this.errorMessage = 'Không thể kết nối đến hệ thống chat. Vui lòng làm mới trang.';
        }
      }
    }, retryInterval);
  }

  private setupWebSocketReconnect(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('[ContactComponent] Bỏ qua setupWebSocketReconnect trên server-side');
      return;
    }

    if (this.reconnectSubscription) {
      this.reconnectSubscription.unsubscribe();
    }

    this.reconnectSubscription = interval(5000).subscribe(() => {
      if (!this.webSocketService.isWebSocketConnected()) {
        console.warn('[ContactComponent] WebSocket đã mất kết nối. Thử kết nối lại...');
        this.errorMessage = 'Mất kết nối chat. Đang thử kết nối lại...';
        this.webSocketService.connect(this.userId!);
        if (!this.chatSubscription || this.chatSubscription.closed) {
          this.subscribeToMessages();
        }
      } else {
        if (this.errorMessage === 'Mất kết nối chat. Đang thử kết nối lại...') {
          this.errorMessage = null;
          console.log('[ContactComponent] Đã khôi phục kết nối WebSocket');
        }
      }
    });
  }

  subscribeToMessages(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('[ContactComponent] Bỏ qua subscribeToMessages trên server-side');
      return;
    }

    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
      console.log('[ContactComponent] Đã hủy subscription cũ');
    }

    this.chatSubscription = this.webSocketService.getChatMessages().subscribe({
      next: (message: any) => {
        console.log('[ContactComponent] Khách hàng nhận được tin nhắn:', message);
        if (!message || (!message.sender && !message.senderId)) {
          console.error('[ContactComponent] Tin nhắn không hợp lệ, thiếu sender:', message);
          return;
        }

        const senderId = message.sender?.id ?? message.senderId;
        const receiverId = message.receiver?.id ?? message.receiverId;

        if (!senderId) {
          console.error('[ContactComponent] Sender không có ID hợp lệ:', { senderId, receiverId });
          return;
        }

        console.log(`[ContactComponent] Kiểm tra tin nhắn: senderId=${senderId}, receiverId=${receiverId}, userId=${this.userId}`);

        if (senderId === this.userId || receiverId === this.userId) {
          this.ngZone.run(() => {
            const normalizedMessage = {
              ...message,
              sender: message.sender || { id: senderId, tenDangNhap: senderId === this.userId ? `Khách ${this.userId}` : 'Admin' },
              receiver: message.receiver || (receiverId ? { id: receiverId } : null),
              senderId,
              receiverId,
              content: message.content.trim(),
              timestamp: this.normalizeTimestamp(message.timestamp),
              isOption: false,
            };

            const messageKey = this.generateMessageKey(normalizedMessage);
            if (!this.processedMessages.has(messageKey)) {
              this.processedMessages.add(messageKey);
              this.messages.push(normalizedMessage);
            } else {
              const existingMessage = this.messages.find(msg => this.generateMessageKey(msg) === messageKey);
              if (existingMessage && new Date(normalizedMessage.timestamp) > new Date(existingMessage.timestamp)) {
                existingMessage.timestamp = normalizedMessage.timestamp;
              }
            }

            this.sortMessages();
            this.shouldScroll = true;
            this.cdr.detectChanges();
          });
        } else {
          console.warn('[ContactComponent] Bỏ qua tin nhắn không phù hợp:', message);
        }
      },
      error: (error) => {
        console.error('[ContactComponent] Lỗi khi nhận tin nhắn:', error);
        this.errorMessage = 'Lỗi khi nhận tin nhắn. Vui lòng kiểm tra kết nối.';
      }
    });
  }

  loadMessages(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('[ContactComponent] Bỏ qua loadMessages trên server-side');
      return;
    }

    if (!this.userId) {
      console.error('[ContactComponent] Không thể tải tin nhắn: userId không hợp lệ');
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.http.get<any[]>(`http://localhost:8080/api/chat/messages/user/${this.userId}`).subscribe({
      next: (messages) => {
        console.log('[ContactComponent] Dữ liệu tin nhắn từ API:', messages);

        const processedMessages = messages.map(msg => {
          const senderId = msg.sender?.id ?? msg.senderId;
          const receiverId = msg.receiver?.id ?? msg.receiverId;
          return {
            ...msg,
            sender: { id: senderId, tenDangNhap: senderId === this.userId ? `Khách ${this.userId}` : (msg.sender?.tenDangNhap || 'Admin') },
            receiver: msg.receiver || (receiverId ? { id: receiverId } : null),
            senderId,
            receiverId,
            content: msg.content.trim(),
            timestamp: this.normalizeTimestamp(msg.timestamp),
            isOption: false,
          };
        });

        const existingMessages = this.messages.filter(msg => msg.source === 'system');
        this.messages = [...existingMessages];

        processedMessages.forEach(msg => {
          const messageKey = this.generateMessageKey(msg);
          if (!this.processedMessages.has(messageKey)) {
            this.processedMessages.add(messageKey);
            this.messages.push(msg);
          }
        });

        this.sortMessages();
        this.isLoading = false;
        console.log('[ContactComponent] Đã cập nhật tin nhắn cho khách hàng:', this.messages);
        this.shouldScroll = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('[ContactComponent] Lỗi khi tải tin nhắn:', error);
        this.errorMessage = 'Lỗi khi tải tin nhắn. Vui lòng thử lại sau.';
        this.isLoading = false;
      }
    });
  }

  private sortMessages(): void {
    this.messages.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      if (timeA !== timeB) {
        return timeA - timeB; // Sắp xếp theo thời gian nếu timestamp khác nhau
      }
      // Nếu timestamp bằng nhau, ưu tiên tin nhắn từ người dùng trước
      const senderIdA = a.sender?.id ?? a.senderId;
      const senderIdB = b.sender?.id ?? b.senderId;
      if (senderIdA === this.userId && senderIdB !== this.userId) {
        return -1; // Tin nhắn từ người dùng (userId) hiển thị trước
      }
      if (senderIdB === this.userId && senderIdA !== this.userId) {
        return 1; // Tin nhắn từ admin hiển thị sau
      }
      return 0; // Giữ nguyên thứ tự nếu cả hai đều từ cùng nguồn
    });
    console.log('[ContactComponent] Đã sắp xếp tin nhắn:', this.messages);
  }

  sendMessage(): void {
    const currentTime = Date.now();
    if (currentTime - this.lastSentTime < this.DEBOUNCE_TIME) {
      console.log('[ContactComponent] Bỏ qua gửi tin nhắn liên tiếp:', this.newMessage);
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      console.warn('[ContactComponent] Không thể gửi tin nhắn: Đang chạy trên server-side');
      return;
    }

    if (!this.newMessage || !this.userId || this.userId < 1000) {
      this.errorMessage = 'Không thể gửi tin nhắn: Thiếu nội dung hoặc ID người dùng không hợp lệ.';
      console.error('[ContactComponent] Không thể gửi tin nhắn:', { newMessage: this.newMessage, userId: this.userId });
      return;
    }

    if (!this.webSocketService.isWebSocketConnected()) {
      this.errorMessage = 'Kết nối WebSocket đang bị gián đoạn. Tin nhắn sẽ được gửi khi kết nối được khôi phục.';
      console.warn('[ContactComponent] WebSocket chưa kết nối khi gửi tin nhắn');
      return;
    }

    if (this.isSending) {
      console.warn('[ContactComponent] Đang gửi tin nhắn, vui lòng chờ...');
      return;
    }

    this.isSending = true;
    console.log('[ContactComponent] Gửi tin nhắn từ user', this.userId, ':', this.newMessage);

    try {
      const timestamp = new Date().toISOString();
      const message = {
        id: null,
        sender: { id: this.userId, tenDangNhap: `Khách ${this.userId}` },
        receiver: null,
        content: this.newMessage.trim(),
        timestamp: timestamp,
        senderId: this.userId,
        receiverId: null,
        isOption: false,
      };
      const messageKey = this.generateMessageKey(message);

      // Thêm tin nhắn vào messages trước để đảm bảo thứ tự
      if (!this.processedMessages.has(messageKey)) {
        this.processedMessages.add(messageKey);
        this.messages.push(message);
      } else {
        const existingMessage = this.messages.find(msg => this.generateMessageKey(msg) === messageKey);
        if (existingMessage && new Date(timestamp) > new Date(existingMessage.timestamp)) {
          existingMessage.timestamp = timestamp;
        }
      }

      this.sortMessages();
      this.shouldScroll = true;
      this.cdr.detectChanges();

      // Gửi tin nhắn sau khi đã thêm vào messages
      this.webSocketService.sendChatMessage(this.userId, null, this.newMessage);
      console.log('[ContactComponent] Đã gửi tin nhắn qua WebSocket, chờ cập nhật');

      this.newMessage = '';
      this.isSending = false;
      this.lastSentTime = currentTime;
    } catch (error) {
      console.error('[ContactComponent] Lỗi khi gửi tin nhắn:', error);
      this.errorMessage = 'Không thể gửi tin nhắn do lỗi kết nối. Vui lòng thử lại.';
      this.isSending = false;
    }
  }

  ngAfterViewChecked(): void {
    if (isPlatformBrowser(this.platformId) && this.chatMessagesRef && this.shouldScroll) {
      const chatMessages = this.chatMessagesRef.nativeElement;
      if (chatMessages && chatMessages.scrollHeight !== this.lastScrollHeight) {
        console.log('[ContactComponent] Messages trước khi render:', this.messages);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        this.lastScrollHeight = chatMessages.scrollHeight;
        console.log('[ContactComponent] Cuộn xuống cuối khung chat');
        this.shouldScroll = false;
      }
    }
  }

  ngOnDestroy(): void {
    console.log('[ContactComponent] Hủy component, ngắt kết nối WebSocket và subscription');
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('[ContactComponent] Bỏ qua ngOnDestroy trên server-side');
      return;
    }

    this.webSocketService.disconnect();
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
      console.log('[ContactComponent] Đã hủy chat subscription');
    }
    if (this.reconnectSubscription) {
      this.reconnectSubscription.unsubscribe();
      console.log('[ContactComponent] Đã hủy reconnect subscription');
    }
    if (!this.tokenService.getUserInfo()) {
      localStorage.removeItem('userId');
    }
    this.processedMessages.clear();

    if (typeof window.Tawk_API !== 'undefined' && window.Tawk_API) {
      window.Tawk_API.endChat();
    }
  }
}