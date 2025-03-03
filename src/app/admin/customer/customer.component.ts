import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../service/customer.service';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss'
})
export class CustomerComponent {
  customers: any[] = [];

  constructor(private customerService: CustomerService) {}
  ngOnInit(): void {
    this.customerService.getCustomers().subscribe(
      ( data: any[]) => {
        this.customers = data;
        console.log('Tài khoản',data);
      },
      (       error: any) => {
        console.error('Có lỗi xảy ra khi lấy dữ liệu tài khoản:', error);
      }
    );

}
}
