import { Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../../service/taikhoan.service';

@Component({
  selector: 'app-add-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-staff-account.component.html',
  styleUrls: ['./add-staff-account.component.scss'],
  providers: [NgbActiveModal]
})
export class AddStaffAccountComponent {
  @Output() accountAdded = new EventEmitter<any>(); // Emit event when account is added
  accountForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private accountService: AccountService, // Service to interact with backend
    private cdr: ChangeDetectorRef
  ) {
    // Initialize the form group with SDT validation for 10 or 11 digits starting with 0
    this.accountForm = this.fb.group({
      hoTen: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      sdt: ['', [Validators.required, Validators.pattern(/^0\d{9,10}$/)]],  // Validate phone number
      tenDangNhap: ['', Validators.required],
      matKhau: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Lưu tài khoản
  saveAccount() {
    console.log('📌 Dữ liệu trong form:', this.accountForm.value);

    if (this.accountForm.valid) {
      const formData = { ...this.accountForm.value }; // Tạo bản sao để tránh lỗi
      formData.vaiTro = 'STAFF'; // Đặt vai trò mặc định là STAFF

      // Gửi yêu cầu API để thêm tài khoản
      this.accountService.register(formData).subscribe(
        (response: any) => {
          console.log('✅ API Response:', response);
          alert('Thêm tài khoản thành công!');
          this.accountAdded.emit(response); // Gửi dữ liệu mới về parent component
          this.closeModal(); // Đóng modal sau khi thành công
        },
        (error: any) => {
          console.error('❌ Lỗi khi thêm tài khoản:', error);
        }
      );
    } else {
      console.warn('⚠️ Form không hợp lệ:', this.accountForm.errors);
    }
  }

  // Đóng modal
  closeModal() {
    console.log('🛑 Attempting to close modal...');
    if (this.activeModal) {
      this.activeModal.dismiss('cancel'); // Dismiss the modal
      console.log('✅ Dismiss method called');
    } else {
      console.error('❌ ActiveModal is not available');
    }

    // Backup plan: Remove modal manually using Bootstrap classes
    setTimeout(() => {
      const modalElement = document.querySelector('.modal');
      if (modalElement) {
        modalElement.remove();
      }
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
      document.body.classList.remove('modal-open');
      console.log('✅ Forced modal removal executed');
      this.cdr.detectChanges(); // Trigger change detection to update UI
    }, 100);
  }
}
