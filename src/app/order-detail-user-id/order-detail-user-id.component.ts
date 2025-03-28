import { Component,OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { UserService } from '../service/user.service';
import { TokenService } from '../service/token.service';

@Component({
  selector: 'app-order-detail-user-id',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-detail-user-id.component.html',
  styleUrl: './order-detail-user-id.component.scss'
})
export class OrderDetailUserIDComponent implements OnInit{
  orders: any[] = [];
  userId: number=0;

  constructor(private userService: UserService,private tokenService: TokenService) {
   
  }

  ngOnInit(): void {
    // Lấy userId từ TokenService
    this.userId = this.tokenService.getUserId(); 

    if (this.userId) {
      this.userService.getOrders(this.userId).subscribe({
        next: (data) => {
          this.orders = data;
          console.log('UserID là : ',this.userId);
        },
        error: (error) => {
          console.error('Lỗi khi lấy đơn hàng', error);
        }
      });
    } else {
      console.error('Không tìm thấy userId từ token');
    }
  }
}
