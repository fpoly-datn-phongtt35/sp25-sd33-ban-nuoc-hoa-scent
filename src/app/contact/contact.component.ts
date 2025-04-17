import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject, ChangeDetectorRef, AfterViewChecked, ViewChild, ElementRef, NgZone } from '@angular/core';
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
  isChatOpen: boolean = false;
  messages: any[] = [];
  newMessage: string = '';
  userId: number | null = null;
  errorMessage: string | null = null;
  isLoading: boolean = false;
  isSending: boolean = false;
  private chatSubscription: Subscription | null = null;
  private reconnectSubscription: Subscription | null = null;
  private lastScrollHeight: number = 0;
  private processedMessages: Set<string> = new Set(); // Theo dõi các tin nhắn đã xử lý
  private shouldScroll: boolean = false; // Kiểm soát việc cuộn khung chat

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
    }
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
      },
      error: (error) => {
        console.error('[ContactComponent] Lỗi khi tạo guest user:', error);
        this.errorMessage = 'Lỗi khi tạo tài khoản khách. Vui lòng thử lại sau.';
        this.isLoading = false;
      }
    });
  }

  private initializeChat(): void {
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
        this.subscribeToMessages();
        this.loadMessages();
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
        this.subscribeToMessages();
      } else {
        if (this.errorMessage === 'Mất kết nối chat. Đang thử kết nối lại...') {
          this.errorMessage = null;
          console.log('[ContactComponent] Đã khôi phục kết nối WebSocket');
        }
      }
    });
  }

  private subscribeToMessages(): void {
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

        // Xử lý tin nhắn mà user là sender hoặc receiver
        if (senderId === this.userId || receiverId === this.userId) {
          this.ngZone.run(() => {
            const normalizedMessage = {
              ...message,
              sender: message.sender || { id: senderId },
              receiver: message.receiver || (receiverId ? { id: receiverId } : null),
              senderId,
              receiverId,
            };

            // Sử dụng ID tin nhắn để kiểm tra trùng lặp
            const messageKey = normalizedMessage.id 
              ? normalizedMessage.id.toString()
              : `${normalizedMessage.content}-${senderId}-${normalizedMessage.timestamp}-${receiverId || 'null'}`;

            if (!this.processedMessages.has(messageKey)) {
              this.processedMessages.add(messageKey);
              this.messages.push(normalizedMessage);
              this.sortMessages();
              console.log('[ContactComponent] Đã thêm tin nhắn vào messages:', normalizedMessage);
              this.shouldScroll = true;
              this.cdr.detectChanges(); // Đảm bảo giao diện cập nhật
            } else {
              console.log('[ContactComponent] Tin nhắn đã được xử lý trước đó, bỏ qua:', normalizedMessage);
            }
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

  private loadMessages(): void {
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
    this.messages = []; // Reset messages để tránh trùng lặp
    this.processedMessages.clear(); // Xóa các tin nhắn đã xử lý

    this.http.get<any[]>(`http://localhost:8080/api/chat/messages/user/${this.userId}`).subscribe({
      next: (messages) => {
        console.log('[ContactComponent] Dữ liệu tin nhắn từ API:', messages);

        const uniqueMessages = new Map();
        messages.forEach(msg => {
          const senderId = msg.sender?.id ?? msg.senderId;
          const receiverId = msg.receiver?.id ?? msg.receiverId;
          if (senderId === this.userId || receiverId === this.userId) {
            const messageKey = msg.id 
              ? msg.id.toString()
              : `${msg.content}-${senderId}-${msg.timestamp}-${receiverId || 'null'}`;
            if (!uniqueMessages.has(messageKey)) {
              uniqueMessages.set(messageKey, {
                ...msg,
                senderId,
                receiverId,
              });
            }
          }
        });

        this.messages = Array.from(uniqueMessages.values());
        this.messages.forEach(msg => {
          const messageKey = msg.id 
            ? msg.id.toString()
            : `${msg.content}-${msg.senderId}-${msg.timestamp}-${msg.receiverId || 'null'}`;
          this.processedMessages.add(messageKey);
        });

        this.sortMessages();
        this.isLoading = false;
        console.log('[ContactComponent] Đã cập nhật tin nhắn cho khách hàng:', this.messages);
        if (this.messages.length > 0) {
          this.isChatOpen = true;
        }
        this.shouldScroll = true;
        this.cdr.detectChanges(); // Đảm bảo giao diện cập nhật
      },
      error: (error) => {
        console.error('[ContactComponent] Lỗi khi tải tin nhắn:', error);
        this.errorMessage = 'Lỗi khi tải tin nhắn. Vui lòng thử lại sau.';
        this.isLoading = false;
      }
    });
  }

  private sortMessages(): void {
    this.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    console.log('[ContactComponent] Đã sắp xếp tin nhắn:', this.messages.length);
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      this.shouldScroll = true;
    }
  }

  sendMessage(): void {
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
      // Gửi tin nhắn qua WebSocket
      this.webSocketService.sendChatMessage(this.userId, null, this.newMessage);
      console.log('[ContactComponent] Đã gửi tin nhắn, chờ WebSocket cập nhật');

      // Thêm tin nhắn tạm thời vào messages để hiển thị ngay lập tức
      const tempMessage = {
        id: null,
        sender: { id: this.userId },
        receiver: null,
        content: this.newMessage,
        timestamp: new Date().toISOString(),
        senderId: this.userId,
        receiverId: null,
      };
      const messageKey = tempMessage.id 
        ? tempMessage.id.toString()
        : `${tempMessage.content}-${tempMessage.senderId}-${tempMessage.timestamp}-${tempMessage.receiverId || 'null'}`;
      
      if (!this.processedMessages.has(messageKey)) {
        this.processedMessages.add(messageKey);
        this.messages.push(tempMessage);
        this.sortMessages();
        this.shouldScroll = true;
        this.cdr.detectChanges(); // Đảm bảo giao diện cập nhật
      }

      this.newMessage = '';
      this.isSending = false;
    } catch (error) {
      console.error('[ContactComponent] Lỗi khi gửi tin nhắn qua WebSocket:', error);
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
    if

 (this.chatSubscription) {
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
  }
}