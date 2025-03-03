import { Component } from '@angular/core';
import { DonhangService } from '../../service/donhang.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss'
})
export class InvoiceComponent {
  orders: any[] = [];

  constructor(private donHangService: DonhangService) {}
  ngOnInit(): void {
    this.donHangService.getDonhang().subscribe(
      ( data: any[]) => {
        this.orders = data;
        console.log('Ok đã lấy đc hóa đơn',data);
      },
      (       error: any) => {
        console.error('Có lỗi xảy ra khi lấy dữ liệu tài khoản:', error);
      }
    );

}
}
