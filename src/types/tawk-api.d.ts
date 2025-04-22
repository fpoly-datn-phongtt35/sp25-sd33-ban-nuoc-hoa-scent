interface TawkAPI {
  onLoad?: () => void;
  hide: () => void; // Thay hideWidget bằng hide
  show: () => void; // Thêm show để hiển thị widget
  toggleVisibility: (visible?: boolean) => void; // Phương thức chuyển đổi hiển thị
  startChat?: () => void; // Đánh dấu optional vì không phải lúc nào cũng được hỗ trợ
  onChatMessageVisitor: (callback: (message: any) => void) => void; // Sự kiện tin nhắn từ người dùng
  onChatMessageAgent: (callback: (message: any) => void) => void; // Sự kiện tin nhắn từ admin
  onMessageReceived: (message: any) => void;
  endChat: () => void;
  addMessage: (message: { message: string; sender: string }) => void;
  maximize: () => void;
  onMessageSent: (message: any) => void;
}

declare global {
  interface Window {
    Tawk_API?: TawkAPI;
    TestProperty?: string; // Giữ nguyên thuộc tính thử nghiệm
  }
}

export {};