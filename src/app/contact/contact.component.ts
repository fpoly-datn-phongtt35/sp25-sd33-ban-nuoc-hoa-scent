import { Component, OnInit, OnDestroy, AfterViewChecked, ViewChild, ChangeDetectorRef, ElementRef, PLATFORM_ID, Inject, NgZone, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TokenService } from '../service/token.service';
import { Subscription, interval } from 'rxjs';
import { WebSocketService } from '../service/WebSocketService';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { Nl2brPipe } from '../service/response/nl2br.pipe';
import { SafeHtmlPipe } from '../service/response/SafeHtmlPipe';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, Nl2brPipe, SafeHtmlPipe],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Output() onClose = new EventEmitter<void>();

  isChatOpen: boolean = true;
  messages: any[] = [];
  newMessage: string = '';
  private lastSentTime: number = 0;
  private readonly DEBOUNCE_TIME: number = 1000;
  userId: number | null = null;
  errorMessage: string | null = null;
  isLoading: boolean = false;
  isSending: boolean = false;
  private hasAddedInitialMessages: boolean = false;
  private chatSubscription: Subscription | null = null;
  private reconnectSubscription: Subscription | null = null;
  private lastScrollHeight: number = 0;
  private processedMessages: Set<string> = new Set();
  private shouldScroll: boolean = false;
  private conversationState: string = 'initial';
  private foundProducts: any[] = [];
  private selectedProduct: any = null;
  private foundBrands: any[] = [];
  private foundFragranceGroups: any[] = [];
  public isChattingWithAdmin: boolean = false;
  private sessionStartTime: string = new Date().toISOString(); // Thêm biến lưu thời gian bắt đầu phiên

  @ViewChild('chatMessages', { static: false }) chatMessagesRef!: ElementRef<HTMLDivElement>;

  constructor(
    private tokenService: TokenService,
    private webSocketService: WebSocketService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  closeChat(): void {
    this.isChatOpen = false;
    this.onClose.emit();
    console.log('[ContactComponent] Đã phát sự kiện đóng chat');
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('[ContactComponent] Đang chạy trên server-side, bỏ qua khởi tạo chat');
      return;
    }

    this.sessionStartTime = new Date().toISOString(); // Lưu thời gian bắt đầu phiên
    this.isChattingWithAdmin = false; // Đặt lại trạng thái khi khởi tạo

    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      this.userId = parseInt(storedUserId, 10);
      if (this.userId >= 1000) {
        this.initializeChat();
        this.initializeTawkTo();
        if (!this.hasAddedInitialMessages) {
          this.addInitialMessages();
          this.hasAddedInitialMessages = true;
        }
        this.shouldScroll = true;
        return;
      } else {
        localStorage.removeItem('userId');
      }
    }

    const userInfo = this.tokenService.getUserInfo();
    this.userId = userInfo?.UserID;
    if (!this.userId) {
      this.createGuestUser();
    } else {
      localStorage.setItem('userId', this.userId.toString());
      this.initializeChat();
      this.initializeTawkTo();
      this.addInitialMessages();
      this.hasAddedInitialMessages = true;
      this.shouldScroll = true;
    }
  }

  private normalizeTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    return date.toISOString();
  }

  private generateMessageKey(message: any): string {
    const senderId = message.sender?.id ?? message.senderId;
    return `${message.content}-${senderId}-${message.timestamp}`;
  }

  private addInitialMessages(): void {
    if (!this.userId) return;

    this.isChattingWithAdmin = false; // Đặt lại trạng thái khi thêm tin nhắn ban đầu

    const welcomeMessage = `Chào bạn! Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi sẽ hỗ trợ bạn ngay lập tức.`;
    const welcomeKey = `welcome-${this.userId}`;
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
      { content: 'Tôi cần tư vấn sản phẩm', key: `option-consult-${this.userId}` },
      { content: 'Top 10 sản phẩm bán chạy', key: `option-top10-${this.userId}` },
      { content: 'Tìm sản phẩm theo thương hiệu', key: `option-brand-${this.userId}` },
      { content: 'Tìm sản phẩm theo nhóm hương', key: `option-fragrance-${this.userId}` },
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
    this.cdr.detectChanges();
    this.shouldScroll = true;
  }

  private initializeTawkTo(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const checkTawkInterval = setInterval(() => {
      if (typeof window.Tawk_API !== 'undefined' && window.Tawk_API) {
        clearInterval(checkTawkInterval);
        this.setupTawkTo();
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
    if (!window.Tawk_API) return;

    this.notifyAdminOfNewChat();

    if (window.Tawk_API.onChatMessageVisitor) {
      window.Tawk_API.onChatMessageVisitor((message: any) => {
        this.handleTawkToMessage(message);
      });
    }

    if (window.Tawk_API.onChatMessageAgent) {
      window.Tawk_API.onChatMessageAgent((message: any) => {
        this.handleTawkToMessage(message);
      });
    }
  }

  private notifyAdminOfNewChat(): void {
    if (!this.userId || !this.webSocketService.isWebSocketConnected()) return;

    const notificationMessage = `Người dùng ${this.userId} đã bắt đầu phiên chat qua Tawk.to`;
    this.webSocketService.sendChatMessage(this.userId, null, notificationMessage);
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
      this.handleBotLogic(newMessage);
    }

    this.sortMessages();
    this.shouldScroll = true;
    this.cdr.detectChanges();
  }

  private createGuestUser(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.isLoading = true;
    this.errorMessage = null;

    this.http.post<{ userId: number }>('http://localhost:8080/api/chat/create-guest', {}).subscribe({
      next: (response) => {
        this.userId = response.userId;
        if (this.userId < 1000) {
          this.errorMessage = 'Không thể tạo tài khoản khách. Vui lòng thử lại sau.';
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }
        localStorage.setItem('userId', this.userId.toString());
        this.isLoading = false;
        this.initializeChat();
        this.initializeTawkTo();
        if (!this.hasAddedInitialMessages) {
          this.addInitialMessages();
          this.hasAddedInitialMessages = true;
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Lỗi khi tạo tài khoản khách. Vui lòng thử lại sau.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  initializeChat(): void {
    if (!isPlatformBrowser(this.platformId) || !this.userId || this.userId < 1000) {
      this.errorMessage = 'ID người dùng không hợp lệ. Vui lòng tải lại trang.';
      this.cdr.detectChanges();
      return;
    }

    this.webSocketService.disconnect();
    this.webSocketService.connect(this.userId);

    let retryCount = 0;
    const maxRetries = 5;
    const retryInterval = 2000;

    const checkConnection = setInterval(() => {
      if (this.webSocketService.isWebSocketConnected()) {
        clearInterval(checkConnection);
        this.loadMessages();
        this.subscribeToMessages();
        this.setupWebSocketReconnect();
      } else {
        retryCount++;
        this.errorMessage = 'Đang kết nối đến hệ thống chat. Vui lòng đợi...';
        if (retryCount >= maxRetries) {
          clearInterval(checkConnection);
          this.errorMessage = 'Không thể kết nối đến hệ thống chat. Vui lòng làm mới trang.';
          this.cdr.detectChanges();
        }
      }
    }, retryInterval * (retryCount + 1));
  }

  private setupWebSocketReconnect(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.reconnectSubscription) {
      this.reconnectSubscription.unsubscribe();
    }

    this.reconnectSubscription = interval(5000).subscribe(() => {
      if (!this.webSocketService.isWebSocketConnected()) {
        this.errorMessage = 'Mất kết nối chat. Đang thử kết nối lại...';
        this.webSocketService.connect(this.userId!);
        if (!this.chatSubscription || this.chatSubscription.closed) {
          this.subscribeToMessages();
        }
      } else {
        if (this.errorMessage === 'Mất kết nối chat. Đang thử kết nối lại...') {
          this.errorMessage = null;
        }
      }
    });
  }

  private searchProductsByName(productName: string): void {
    this.http.get<any[]>(`http://localhost:8080/api/chat/chat-search?name=${productName}`).subscribe({
      next: (products) => {
        this.foundProducts = products;
        if (products.length === 0) {
          this.addBotMessage('Rất tiếc, cửa hàng hiện không có sản phẩm này. Bạn có muốn tìm sản phẩm khác không ạ? (Nếu muốn nói chuyện trực tiếp, hãy nhập "admin")');
          this.conversationState = 'initial';
        } else {
          let botResponse = 'Cửa hàng hiện có các sản phẩm:\n';
          products.forEach((product: any, index: number) => {
            botResponse += `${index + 1}. ${product.name}\n`;
          });
          botResponse += 'Bạn muốn hỏi về sản phẩm nào ạ? Mời bạn nhập số thứ tự sản phẩm của bạn muốn hỏi';
          this.addBotMessage(botResponse, false);
          this.conversationState = 'selectingProduct';
        }
        this.shouldScroll = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.addBotMessage('Có lỗi xảy ra khi tìm kiếm sản phẩm. Vui lòng thử lại sau.');
        this.conversationState = 'initial';
        this.cdr.detectChanges();
      }
    });
  }

  private getTop10Products(): void {
    this.http.get<any[]>('http://localhost:8080/api/chat/top-10-products').subscribe({
      next: (products) => {
        this.foundProducts = products;
        if (products.length === 0) {
          this.addBotMessage('Hiện tại không có sản phẩm bán chạy nào. Bạn có muốn tìm sản phẩm khác không ạ? (Nếu muốn nói chuyện trực tiếp, hãy nhập "admin")');
          this.conversationState = 'initial';
        } else {
          let botResponse = 'Danh sách 10 sản phẩm bán chạy nhất:\n';
          products.forEach((product: any, index: number) => {
            botResponse += `${index + 1}. ${product.name}\n`;
          });
          botResponse += 'Bạn muốn hỏi về sản phẩm nào ạ? Mời bạn nhập số thứ tự sản phẩm bạn muốn hỏi';
          this.addBotMessage(botResponse, false);
          this.conversationState = 'selectingProduct';
        }
        this.shouldScroll = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.addBotMessage('Có lỗi xảy ra khi lấy danh sách sản phẩm bán chạy. Vui lòng thử lại sau.');
        this.conversationState = 'initial';
        this.cdr.detectChanges();
      }
    });
  }

  private getAllBrands(): void {
    this.http.get<any[]>('http://localhost:8080/api/chat/brands').subscribe({
      next: (brands) => {
        this.foundBrands = brands;
        if (brands.length === 0) {
          this.addBotMessage('Hiện tại không có thương hiệu nào. Bạn có muốn tìm sản phẩm khác không ạ? (Nếu muốn nói chuyện trực tiếp, hãy nhập "admin")');
          this.conversationState = 'initial';
        } else {
          let botResponse = 'Danh sách thương hiệu:\n';
          brands.forEach((brand: any, index: number) => {
            botResponse += `${index + 1}. ${brand.name}\n`;
          });
          botResponse += 'Bạn muốn xem sản phẩm của thương hiệu nào? Mời bạn nhập số thứ tự thương hiệu';
          this.addBotMessage(botResponse, false);
          this.conversationState = 'selectingBrand';
        }
        this.shouldScroll = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.addBotMessage('Có lỗi xảy ra khi lấy danh sách thương hiệu. Vui lòng thử lại sau.');
        this.conversationState = 'initial';
        this.cdr.detectChanges();
      }
    });
  }

  private getProductsByBrand(brandId: number): void {
    this.http.get<any[]>(`http://localhost:8080/api/chat/products-by-brand?brandId=${brandId}`).subscribe({
      next: (products) => {
        this.foundProducts = products;
        if (products.length === 0) {
          this.addBotMessage('Thương hiệu này hiện không có sản phẩm nào. Bạn có muốn tìm sản phẩm khác không ạ? (Nếu muốn nói chuyện trực tiếp, hãy nhập "admin")');
          this.conversationState = 'initial';
        } else {
          let botResponse = 'Danh sách sản phẩm của thương hiệu:\n';
          products.forEach((product: any, index: number) => {
            botResponse += `${index + 1}. ${product.name}\n`;
          });
          botResponse += 'Bạn muốn hỏi về sản phẩm nào ạ? Mời bạn nhập số thứ tự sản phẩm bạn muốn hỏi';
          this.addBotMessage(botResponse, false);
          this.conversationState = 'selectingProduct';
        }
        this.shouldScroll = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.addBotMessage('Có lỗi xảy ra khi lấy sản phẩm theo thương hiệu. Vui lòng thử lại sau.');
        this.conversationState = 'initial';
        this.cdr.detectChanges();
      }
    });
  }

  private getAllFragranceGroups(): void {
    this.http.get<any[]>('http://localhost:8080/api/chat/fragrance-groups').subscribe({
      next: (groups) => {
        this.foundFragranceGroups = groups;
        if (groups.length === 0) {
          this.addBotMessage('Hiện tại không có nhóm hương nào. Bạn có muốn tìm sản phẩm khác không ạ? (Nếu muốn nói chuyện trực tiếp, hãy nhập "admin")');
          this.conversationState = 'initial';
        } else {
          let botResponse = 'Danh sách nhóm hương:\n';
          groups.forEach((group: any, index: number) => {
            botResponse += `${index + 1}. ${group.name}\n`;
          });
          botResponse += 'Bạn muốn xem sản phẩm thuộc nhóm hương nào? Mời bạn nhập số thứ tự nhóm hương';
          this.addBotMessage(botResponse, false);
          this.conversationState = 'selectingFragranceGroup';
        }
        this.shouldScroll = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.addBotMessage('Có lỗi xảy ra khi lấy danh sách nhóm hương. Vui lòng thử lại sau.');
        this.conversationState = 'initial';
        this.cdr.detectChanges();
      }
    });
  }

  private getProductsByFragranceGroup(groupId: number): void {
    this.http.get<any[]>(`http://localhost:8080/api/chat/products-by-fragrance-group?groupId=${groupId}`).subscribe({
      next: (products) => {
        this.foundProducts = products;
        if (products.length === 0) {
          this.addBotMessage('Nhóm hương này hiện không có sản phẩm nào. Bạn có muốn tìm sản phẩm khác không ạ? (Nếu muốn nói chuyện trực tiếp, hãy nhập "admin")');
          this.conversationState = 'initial';
        } else {
          let botResponse = 'Danh sách sản phẩm thuộc nhóm hương:\n';
          products.forEach((product: any, index: number) => {
            botResponse += `${index + 1}. ${product.name}\n`;
          });
          botResponse += 'Bạn muốn hỏi về sản phẩm nào ạ? Mời bạn nhập số thứ tự sản phẩm bạn muốn hỏi';
          this.addBotMessage(botResponse, false);
          this.conversationState = 'selectingProduct';
        }
        this.shouldScroll = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.addBotMessage('Có lỗi xảy ra khi lấy sản phẩm theo nhóm hương. Vui lòng thử lại sau.');
        this.conversationState = 'initial';
        this.cdr.detectChanges();
      }
    });
  }

  private getProductDetails(productId: number, infoType: string): void {
    this.http.get<any>(`http://localhost:8080/api/chat/${productId}/details?infoType=${infoType}`).subscribe({
      next: (details) => {
        let botResponse = `Thông tin về ${details.productName}:\n`;
        switch (infoType) {
          case 'volume_price':
            if (details.volumePriceList && details.volumePriceList.length > 0) {
              botResponse += details.volumePriceList
                .map((vp: any) => `Dung tích: ${vp.volume} ml - Giá: ${vp.price} VNĐ`)
                .join('\n');
            } else {
              botResponse += 'Không có thông tin dung tích và giá.';
            }
            break;
          case 'price':
            botResponse += `Giá: ${details.price} VNĐ`;
            break;
          case 'stock':
            botResponse += `Số lượng tồn kho: ${details.stock}`;
            break;
          case 'volume':
            botResponse += `Dung tích: ${details.volume} ml`;
            break;
          case 'description':
            botResponse += `Mô tả: ${details.description}`;
            break;
          case 'top_notes':
            botResponse += `Hương đầu: ${details.topNotes}`;
            break;
          case 'middle_notes':
            botResponse += `Hương giữa: ${details.middleNotes}`;
            break;
          case 'base_notes':
            botResponse += `Hương cuối: ${details.baseNotes}`;
            break;
          case 'concentration':
            botResponse += `Nồng độ: ${details.concentration}`;
            break;
          case 'images':
            botResponse += `Hình ảnh: ${details.images.join(', ')}`;
            break;
          default:
            botResponse += 'Không có thông tin phù hợp.';
        }
        botResponse += '\nBạn có muốn biết thêm thông tin khác không ạ? (Nếu muốn nói chuyện trực tiếp, hãy nhập "admin")';
        this.addBotMessage(botResponse);
        this.conversationState = 'askingDetail';
        this.shouldScroll = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.addBotMessage('Có lỗi xảy ra khi lấy thông tin sản phẩm. Vui lòng thử lại sau.');
        this.conversationState = 'initial';
        this.cdr.detectChanges();
      }
    });
  }

  private addBotMessage(content: string, isOption: boolean = false): void {
    const timestamp = new Date().toISOString();
    const message = {
      id: null,
      sender: { id: 0, hoTen: 'Bot', tenDangNhap: 'Bot' },
      receiver: { id: this.userId },
      content: content,
      timestamp: timestamp,
      senderId: 0,
      receiverId: this.userId,
      source: 'bot',
      isOption: isOption,
    };
    const messageKey = this.generateMessageKey(message);
    if (!this.processedMessages.has(messageKey)) {
      this.processedMessages.add(messageKey);
      this.messages.push(message);
    }
    this.sortMessages();
    this.shouldScroll = true;
    this.cdr.detectChanges();
  }

  private handleBotLogic(message: any): void {
    if (message.senderId !== this.userId) return;

    const content = message.content.toLowerCase().trim();

    // Kiểm tra nếu người dùng đang trò chuyện với admin
    if (this.isChattingWithAdmin) {
      console.log('[ContactComponent] Người dùng đang trò chuyện với admin, bot sẽ không trả lời.');
      return; // Bỏ qua logic bot
    }

    // Kiểm tra nếu người dùng muốn thoát luồng bot
    const exitKeywords = ['admin', 'thoát', 'nói chuyện với admin', 'người thật'];
    if (exitKeywords.some(keyword => content.includes(keyword))) {
      this.isChattingWithAdmin = true; // Cập nhật trạng thái
      this.conversationState = 'initial';
      this.foundProducts = [];
      this.foundBrands = [];
      this.foundFragranceGroups = [];
      this.selectedProduct = null;
      this.addBotMessage('Yêu cầu của bạn đã được gửi đến admin. Vui lòng chờ trong giây lát.');
      return; // Backend sẽ xử lý logic thoát bot
    }

    // Kiểm tra các trigger từ người dùng
    if (content === 'tôi cần tư vấn sản phẩm') {
      this.addBotMessage('Bạn cần tư vấn về sản phẩm nào ạ? Mời bạn nhập tên sản phẩm.');
      this.conversationState = 'askingProductName';
      return;
    }

    if (content === 'top 10 sản phẩm bán chạy') {
      this.getTop10Products();
      return;
    }

    if (content === 'tìm sản phẩm theo thương hiệu') {
      this.getAllBrands();
      return;
    }

    if (content === 'tìm sản phẩm theo nhóm hương') {
      this.getAllFragranceGroups();
      return;
    }

    // Xử lý các trạng thái hội thoại
    if (this.conversationState === 'askingProductName') {
      this.searchProductsByName(content);
      return;
    }

    if (this.conversationState === 'selectingProduct') {
      const selectedIndex = parseInt(content, 10) - 1;
      if (selectedIndex >= 0 && selectedIndex < this.foundProducts.length) {
        this.selectedProduct = this.foundProducts[selectedIndex];
        const botResponse = `Bạn muốn biết thông tin gì về ${this.selectedProduct.name}?\n` +
          '- Số lượng tồn kho\n' +
          '- Dung tích và giá\n' +
          '- Mô tả\n' +
          '- Hương đầu, giữa, cuối\n' +
          '- Nồng độ\n' +
          '- Hình ảnh\n' +
          'Vui lòng chọn hoặc ghi rõ yêu cầu nhé! (Nếu muốn nói chuyện trực tiếp, hãy nhập "admin")';
        this.addBotMessage(botResponse);
        this.conversationState = 'askingDetail';
      } else {
        this.addBotMessage('Sản phẩm bạn chọn không hợp lệ. Vui lòng chọn lại số thứ tự sản phẩm. (Nếu muốn tìm sản phẩm khác, hãy nhập "khác"; hoặc nhập "admin" để nói chuyện trực tiếp)');
        // Giữ trạng thái để người dùng chọn lại
        this.conversationState = 'selectingProduct';
      }
      return;
    }

    if (this.conversationState === 'selectingBrand') {
      const selectedIndex = parseInt(content, 10) - 1;
      if (selectedIndex >= 0 && selectedIndex < this.foundBrands.length) {
        const selectedBrand = this.foundBrands[selectedIndex];
        this.getProductsByBrand(selectedBrand.id);
      } else {
        this.addBotMessage('Thương hiệu bạn chọn không hợp lệ. Vui lòng chọn lại số thứ tự thương hiệu. (Nếu muốn tìm sản phẩm khác, hãy nhập "khác"; hoặc nhập "admin" để nói chuyện trực tiếp)');
        // Giữ trạng thái để người dùng chọn lại
        this.conversationState = 'selectingBrand';
      }
      return;
    }

    if (this.conversationState === 'selectingFragranceGroup') {
      const selectedIndex = parseInt(content, 10) - 1;
      if (selectedIndex >= 0 && selectedIndex < this.foundFragranceGroups.length) {
        const selectedGroup = this.foundFragranceGroups[selectedIndex];
        this.getProductsByFragranceGroup(selectedGroup.id);
      } else {
        this.addBotMessage('Nhóm hương bạn chọn không hợp lệ. Vui lòng chọn lại số thứ tự nhóm hương. (Nếu muốn tìm sản phẩm khác, hãy nhập "khác"; hoặc nhập "admin" để nói chuyện trực tiếp)');
        // Giữ trạng thái để người dùng chọn lại
        this.conversationState = 'selectingFragranceGroup';
      }
      return;
    }

    if (this.conversationState === 'askingDetail') {
      // Kiểm tra nếu người dùng muốn tìm sản phẩm khác
      if (content === 'khác') {
        this.addBotMessage('Bạn muốn tiếp tục với tùy chọn nào?\n' +
          '- Tôi cần tư vấn sản phẩm\n' +
          '- Top 10 sản phẩm bán chạy\n' +
          '- Tìm sản phẩm theo thương hiệu\n' +
          '- Tìm sản phẩm theo nhóm hương\n' +
          '(Nếu muốn nói chuyện trực tiếp, hãy nhập "admin")');
        this.conversationState = 'initial';
        return;
      }

      let infoType = '';
      switch (content.toLowerCase()) {
        case 'số lượng tồn kho':
          infoType = 'stock';
          break;
        case 'dung tích':
        case 'giá':
        case 'dung tích và giá':
          infoType = 'volume_price';
          break;
        case 'mô tả':
          infoType = 'description';
          break;
        case 'hương đầu':
          infoType = 'top_notes';
          break;
        case 'hương giữa':
          infoType = 'middle_notes';
          break;
        case 'hương cuối':
          infoType = 'base_notes';
          break;
        case 'nồng độ':
          infoType = 'concentration';
          break;
        case 'hình ảnh':
          infoType = 'images';
          break;
        default:
          this.addBotMessage('Yêu cầu không hợp lệ. Vui lòng chọn lại từ danh sách:\n' +
            '- Số lượng tồn kho\n' +
            '- Dung tích và giá\n' +
            '- Mô tả\n' +
            '- Hương đầu, giữa, cuối\n' +
            '- Nồng độ\n' +
            '- Hình ảnh\n' +
            '(Nếu muốn tìm sản phẩm khác, hãy nhập "khác"; hoặc nhập "admin" để nói chuyện trực tiếp)');
          // Giữ trạng thái để người dùng chọn lại
          this.conversationState = 'askingDetail';
          return;
      }
      this.getProductDetails(this.selectedProduct.id, infoType);
    }

    // Xử lý trường hợp không xác định được yêu cầu
    if (this.conversationState === 'initial') {
      this.addBotMessage('Tôi chưa hiểu yêu cầu của bạn. Bạn muốn tiếp tục với tùy chọn nào?\n' +
        '- Tôi cần tư vấn sản phẩm\n' +
        '- Top 10 sản phẩm bán chạy\n' +
        '- Tìm sản phẩm theo thương hiệu\n' +
        '- Tìm sản phẩm theo nhóm hương\n' +
        '(Nếu muốn nói chuyện trực tiếp, hãy nhập "admin")');
    }
  }

  selectOption(optionContent: string): void {
    const currentTime = Date.now();
    if (currentTime - this.lastSentTime < this.DEBOUNCE_TIME) return;

    if (!this.userId) return;

    const timestamp = new Date().toISOString();
    const message = {
      content: optionContent,
      senderId: this.userId,
      receiverId: null,
      timestamp: timestamp,
    };
    const messageKey = this.generateMessageKey(message);

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
        source: 'user',
        isOption: false,
      });
    }

    this.sortMessages();
    this.shouldScroll = true;
    this.cdr.detectChanges();

    this.webSocketService.sendChatMessage(this.userId, null, optionContent);
    this.handleBotLogic({ senderId: this.userId, content: optionContent, timestamp });
    this.lastSentTime = currentTime;
  }

  isAskingDetails(message: any): boolean {
    if (!message || message.senderId !== 0 || message.sender?.tenDangNhap !== 'Bot') {
      return false;
    }

    return (
      this.conversationState === 'askingProductName' ||
      this.conversationState === 'selectingProduct' ||
      this.conversationState === 'askingDetail' ||
      this.conversationState === 'selectingBrand' ||
      this.conversationState === 'selectingFragranceGroup' ||
      message.content.includes('Vui lòng chọn hoặc ghi rõ yêu cầu nhé!') ||
      message.content.includes('Bạn có muốn biết thêm thông tin khác không ạ?') ||
      message.content.includes('Bạn cần tư vấn về sản phẩm nào ạ? Mời bạn nhập tên sản phẩm') ||
      message.content.includes('Bạn muốn hỏi về sản phẩm nào ạ?') ||
      message.content.includes('Bạn muốn xem sản phẩm của thương hiệu nào?') ||
      message.content.includes('Bạn muốn xem sản phẩm thuộc nhóm hương nào?')
    );
  }

  switchToAdmin(): void {
    if (!this.userId) return;

    const timestamp = new Date().toISOString();
    const message = {
        id: null,
        sender: { id: this.userId, tenDangNhap: `Khách ${this.userId}` },
        receiver: null,
        content: 'admin',
        timestamp: timestamp,
        senderId: this.userId,
        receiverId: null,
        source: 'user',
        isOption: false,
    };
    const messageKey = this.generateMessageKey(message);

    if (!this.processedMessages.has(messageKey)) {
        this.processedMessages.add(messageKey);
        this.messages.push(message);
    }

    this.sortMessages();
    this.shouldScroll = true;
    this.cdr.detectChanges();

    this.webSocketService.sendChatMessage(this.userId, null, 'admin');
    console.log('[ContactComponent] Đã gửi yêu cầu chuyển sang admin qua WebSocket: admin');

    this.isChattingWithAdmin = true;
    this.conversationState = 'initial';
    this.foundProducts = [];
    this.foundBrands = [];
    this.foundFragranceGroups = [];
    this.selectedProduct = null;

    // Thêm tin nhắn giả lập từ admin sau 1 giây
    setTimeout(() => {
        const adminMessage = {
            id: null,
            sender: { id: 0, hoTen: 'Admin', tenDangNhap: 'Admin' },
            receiver: { id: this.userId },
            content: 'Chào bạn! Bạn cần tư vấn về sản phẩm nào ?',
            timestamp: new Date().toISOString(),
            senderId: 0,
            receiverId: this.userId,
            source: 'admin',
            isOption: false,
        };
        const adminMessageKey = this.generateMessageKey(adminMessage);

        if (!this.processedMessages.has(adminMessageKey)) {
            this.processedMessages.add(adminMessageKey);
            this.messages.push(adminMessage);
        }

        this.sortMessages();
        this.shouldScroll = true;
        this.cdr.detectChanges();
    }, 1000); // Độ trễ 1 giây
}

  subscribeToMessages(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }

    this.chatSubscription = this.webSocketService.getChatMessages().subscribe({
      next: (message: any) => {
        if (!message || (!message.sender && !message.senderId)) return;

        if (message.type === 'error') {
          this.errorMessage = message.message;
          this.cdr.detectChanges();
          return;
        }

        const senderId = message.sender?.id ?? message.senderId;
        const receiverId = message.receiver?.id ?? message.receiverId;

        if (senderId !== this.userId && receiverId === this.userId) {
          this.ngZone.run(() => {
            console.log('Received WebSocket message content:', message.content);
            console.log('Contains \\n:', message.content.includes('\n'));
            const normalizedMessage = {
              ...message,
              sender: message.sender || { id: senderId, tenDangNhap: 'Admin' },
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

              // Chỉ cập nhật trạng thái nếu tin nhắn nằm trong phiên hiện tại
              if (new Date(normalizedMessage.timestamp).getTime() >= new Date(this.sessionStartTime).getTime()) {
                if (senderId !== this.userId && senderId !== 0) {
                  this.isChattingWithAdmin = true;
                  console.log('[ContactComponent] Đã nhận tin nhắn từ admin trong phiên hiện tại, chuyển sang trạng thái trò chuyện với admin.');
                }
              }
            }

            this.sortMessages();
            this.shouldScroll = true;
            this.cdr.detectChanges();
          });
        }
      },
      error: (error) => {
        this.errorMessage = 'Lỗi khi nhận tin nhắn. Vui lòng kiểm tra kết nối.';
        this.cdr.detectChanges();
      }
    });
  }

  loadMessages(): void {
    if (!isPlatformBrowser(this.platformId) || !this.userId) {
      this.errorMessage = 'ID người dùng không hợp lệ. Vui lòng tải lại trang.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.http.get<any[]>(`http://localhost:8080/api/chat/messages/user/${this.userId}`).subscribe({
      next: (messages) => {
        const processedMessages = messages.map(msg => {
          const senderId = msg.sender?.id ?? msg.senderId;
          const receiverId = msg.receiver?.id ?? msg.receiverId;
          return {
            ...msg,
            sender: { id: senderId, tenDangNhap: senderId === this.userId ? `Khách ${this.userId}` : (msg.sender?.tenDangNhap || 'Admin') },
            receiver: msg.receiver || (receiverId ? { id: receiverId } : null),
            senderId,
            receiverId,
            content: msg.content ? msg.content.trim() : '[Nội dung trống]',
            timestamp: this.normalizeTimestamp(msg.timestamp || new Date().toISOString()),
            isOption: false,
            source: 'backend',
          };
        });

        processedMessages.forEach(msg => {
          const messageKey = `backend-${msg.id}`;
          if (!this.processedMessages.has(messageKey)) {
            this.processedMessages.add(messageKey);
            this.messages.push(msg);

            // Chỉ kiểm tra các tin nhắn sau thời gian bắt đầu phiên
            if (new Date(msg.timestamp).getTime() >= new Date(this.sessionStartTime).getTime()) {
              const content = msg.content.toLowerCase().trim();
              const exitKeywords = ['admin', 'thoát', 'nói chuyện với admin', 'người thật'];
              if (msg.senderId === this.userId && exitKeywords.some(keyword => content.includes(keyword))) {
                this.isChattingWithAdmin = true;
                console.log('[ContactComponent] Phát hiện từ khóa "admin" trong phiên hiện tại, chuyển sang trạng thái trò chuyện với admin.');
              } else if (msg.senderId !== this.userId && msg.senderId !== 0) {
                this.isChattingWithAdmin = true;
                console.log('[ContactComponent] Phát hiện tin nhắn từ admin trong phiên hiện tại, chuyển sang trạng thái trò chuyện với admin.');
              }
            }
          }
        });

        this.sortMessages();
        this.isLoading = false;
        this.shouldScroll = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Lỗi khi tải tin nhắn. Vui lòng thử lại sau.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  sendMessage(): void {
    const currentTime = Date.now();
    if (currentTime - this.lastSentTime < this.DEBOUNCE_TIME) return;

    if (!isPlatformBrowser(this.platformId) || !this.newMessage || !this.userId || this.userId < 1000) {
      this.errorMessage = 'Không thể gửi tin nhắn: Thiếu nội dung hoặc ID người dùng không hợp lệ.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.webSocketService.isWebSocketConnected()) {
      this.errorMessage = 'Kết nối WebSocket đang bị gián đoạn. Tin nhắn sẽ được gửi khi kết nối được khôi phục.';
      return;
    }

    if (this.isSending) return;

    this.isSending = true;

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

    if (!this.processedMessages.has(messageKey)) {
      this.processedMessages.add(messageKey);
      this.messages.push(message);
    }

    this.sortMessages();
    this.shouldScroll = true;
    this.cdr.detectChanges();

    this.webSocketService.sendChatMessage(this.userId, null, this.newMessage);
    this.handleBotLogic(message);

    this.newMessage = '';
    this.isSending = false;
    this.lastSentTime = currentTime;
  }

  formatMessageContent(content: string): string {
    return content.replace(/\n/g, '<br>');
  }

  private sortMessages(): void {
    this.messages.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      if (timeA !== timeB) return timeA - timeB;
      const senderIdA = a.sender?.id ?? a.senderId;
      const senderIdB = b.sender?.id ?? b.senderId;
      if (senderIdA === this.userId && senderIdB !== this.userId) return -1;
      if (senderIdB === this.userId && senderIdA !== this.userId) return 1;
      return 0;
    });
    this.cdr.detectChanges();
  }

  ngAfterViewChecked(): void {
    if (isPlatformBrowser(this.platformId) && this.chatMessagesRef && this.shouldScroll) {
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          const chatMessages = this.chatMessagesRef.nativeElement;
          if (chatMessages.scrollHeight > chatMessages.clientHeight) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }
          this.shouldScroll = false;
        }, 100);
      });
    }
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.webSocketService.disconnect();
    if (this.chatSubscription) this.chatSubscription.unsubscribe();
    if (this.reconnectSubscription) this.reconnectSubscription.unsubscribe();
    if (!this.tokenService.getUserInfo()) localStorage.removeItem('userId');
    this.processedMessages.clear();

    if (typeof window.Tawk_API !== 'undefined' && window.Tawk_API && typeof window.Tawk_API.endChat === 'function') {
      window.Tawk_API.endChat();
    }

    this.onClose.emit();
  }
}