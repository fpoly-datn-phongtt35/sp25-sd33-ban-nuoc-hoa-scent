interface CartItem {
    product: Product;  // Đảm bảo rằng bạn đã định nghĩa và nhập khẩu interface Product
    quantity: number;
  }
  
  private cartItems: CartItem[] = [];
  