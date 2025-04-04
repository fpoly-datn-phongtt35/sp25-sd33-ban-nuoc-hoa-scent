import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AccountService } from '../../../service/taikhoan.service';

@Component({
  selector: 'app-account-staff-update',
  standalone: true,
  imports: [CommonModule, FormsModule],  templateUrl: './account-staff-update.component.html',
  styleUrl: './account-staff-update.component.scss'
})
export class AccountStaffUpdateComponent {
  @Input() account: any; // Nhận dữ liệu tài khoản từ component cha
  @Output() accountUpdated = new EventEmitter<any>(); // Sự kiện thông báo khi cập nhật thành công

  accountData: any = {
    id: null,
    hoTen: '',
    email: '',
    sdt: ''
  };

  constructor(
    public activeModal: NgbActiveModal,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    if (this.account) {
      this.accountData = { ...this.account }; // Sao chép dữ liệu tài khoản để chỉnh sửa
    }
  }

  updateAccount(): void {
    const dto = {
      id: this.accountData.id,
      hoTen: this.accountData.hoTen,
      email: this.accountData.email,
      sdt: this.accountData.sdt
    };

    this.accountService.updateAccount(dto).subscribe({
      next: (response) => {
        console.log('✅ Cập nhật tài khoản thành công:', response);
        this.accountUpdated.emit(response); // Phát sự kiện cập nhật thành công
        this.activeModal.close(); // Đóng modal
      },
      error: (error) => {
        console.error('❌ Lỗi khi cập nhật tài khoản:', error);
        alert('Cập nhật tài khoản thất bại. Vui lòng thử lại.');
      }
    });
  }

  closeModal(): void {
    this.activeModal.dismiss();
  }
}
