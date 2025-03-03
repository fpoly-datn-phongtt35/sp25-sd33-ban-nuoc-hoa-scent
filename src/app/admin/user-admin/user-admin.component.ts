import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../service/taikhoan.service';
@Component({
  selector: 'app-user-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-admin.component.html',
  styleUrl: './user-admin.component.scss'
})
export class UserAdminComponent{
  accounts: any[] = [];

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.accountService.getAccounts().subscribe(
      ( data: any[]) => {
        this.accounts = data;
        console.log('Tài khoản',data);
      },
      (       error: any) => {
        console.error('Có lỗi xảy ra khi lấy dữ liệu tài khoản:', error);
      }
    );

  }
}
