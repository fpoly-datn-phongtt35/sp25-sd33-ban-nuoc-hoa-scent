interface TawkAPI {
  onLoad?: () => void;
  hideWidget: () => void;
  startChat: () => void;
  addMessage: (message: { message: string; sender: string }) => void;
  onMessageSent: (message: any) => void;
  onMessageReceived: (message: any) => void;
  endChat: () => void;
}

declare global {
  interface Window {
    Tawk_API?: TawkAPI;
    TestProperty?: string; // Thêm thuộc tính thử nghiệm
  }
}

export {};