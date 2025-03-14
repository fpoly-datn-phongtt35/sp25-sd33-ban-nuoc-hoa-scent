import { Component, EventEmitter, Output, ChangeDetectorRef, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomerService } from '../../service/customer.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-customer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-customer.component.html',
  styleUrl: './edit-customer.component.scss',
  providers: [NgbActiveModal]
})
export class EditCustomerComponent implements OnInit {
  @Output() customerUpdated = new EventEmitter<any>();
  @Input() customerData: any; // ✅ Nhận dữ liệu khách hàng từ component cha
  customerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef
  ) {
    this.customerForm = this.fb.group({
      id: ['', Validators.required], // ✅ Thêm ID để cập nhật
      tenKhachHang: ['', Validators.required],
      diaChi: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      sdt: ['', [Validators.required, Validators.pattern('^[0-9]{10,11}$')]]
    });
  }

  ngOnInit(): void {
    if (this.customerData) {
      this.customerForm.patchValue(this.customerData); // ✅ Nạp dữ liệu khách hàng vào form
    }
  }

  updateCustomer() {
    if (this.customerForm.valid) {
      this.customerService.updateCustomer(this.customerForm.value).subscribe(
        (response) => {
          alert('Cập nhật khách hàng thành công!');
          this.customerUpdated.emit(response); // ✅ Gửi dữ liệu mới về `CustomerComponent`
          this.closeModal(); // ✅ Đóng modal sau khi cập nhật thành công
        },
        (error) => {
          console.error('❌ Lỗi khi cập nhật khách hàng:', error);
          alert('❌ Không thể cập nhật khách hàng. Vui lòng thử lại!');
        }
      );
    } else {
      alert('⚠️ Vui lòng điền đầy đủ thông tin hợp lệ.');
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
