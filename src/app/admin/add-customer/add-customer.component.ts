import { Component, EventEmitter, Output,ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomerService } from '../../service/customer.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-add-customer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // ✅ Đã thêm ReactiveFormsModule
  templateUrl: './add-customer.component.html',
  styleUrl: './add-customer.component.scss',
  providers: [NgbActiveModal]
})
export class AddCustomerComponent {
  @Output() customerAdded = new EventEmitter<any>();
  customerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef
  ) {
    this.customerForm = this.fb.group({
      tenKhachHang: ['', Validators.required],
      diaChi: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      sdt: ['', [Validators.required, Validators.pattern('^[0-9]{10,11}$')]]
    });
  }

  addCustomer() {
    if (this.customerForm.valid) {
      this.customerService.addCustomer(this.customerForm.value).subscribe(
        (response) => {
          alert('Thêm khách hàng thành công!');
          this.customerAdded.emit(response); // ✅ Gửi dữ liệu mới về `CustomerComponent`
          this.activeModal.dismiss(); // ✅ Đóng modal sau khi thêm thành công
        },
        (error) => {
          console.error('Lỗi khi thêm khách hàng:', error);
        }
      );
    } else {
      alert('Vui lòng điền đầy đủ thông tin hợp lệ.');
    }
  }
  closeModal() {
    console.log('🛑 Attempting to close modal...', this.activeModal);

    // 🟢 Gọi dismiss() trước
    if (this.activeModal) {
        this.activeModal.dismiss('cancel');
        console.log('✅ Dismiss method called');
    } else {
        console.error('❌ ActiveModal is not available');
    }

    // 🟠 Backup plan: Xóa modal bằng Bootstrap
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

        // 🔥 Kích hoạt Change Detection để cập nhật UI
        this.cdr.detectChanges();
    }, 100);
}
}
