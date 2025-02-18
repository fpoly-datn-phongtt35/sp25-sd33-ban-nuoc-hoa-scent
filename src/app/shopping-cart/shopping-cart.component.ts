import { Component,OnInit } from '@angular/core';
// import { FooterComponent } from '../footer/footer.component';
// import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { CartService } from '../service/cart.Service';

import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss'] // Sửa thành "styleUrls"
})

export class ShoppingCartComponent implements OnInit{
  cartItems: any[] = [];

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.loadCartItems();
  }

  loadCartItems() {
    this.cartItems = this.cartService.getItems();
  }
  removeItem(itemToRemove: any) {
    this.cartItems = this.cartItems.filter(item => item !== itemToRemove);
    this.cartService.saveItems(this.cartItems);  // Update local storage or make API call
  }

  getTotal() {
    return this.cartItems.reduce((acc, item) => acc + (item.quantity * item.product.price), 0);
  }
  
  
}
