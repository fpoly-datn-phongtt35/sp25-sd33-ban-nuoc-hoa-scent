import { Component,EventEmitter,Output,ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule,FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PhieugiamgiaService } from '../../service/phieugiamgia.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-voucher',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-voucher.component.html',
  styleUrl: './add-voucher.component.scss',
  providers: [NgbActiveModal]
})
export class AddVoucherComponent {
  @Output() voucherAdded = new EventEmitter<any>();
  voucherForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private phieuGiamGiaService: PhieugiamgiaService,
    private cdr: ChangeDetectorRef
  ) {
    this.voucherForm = this.fb.group({
      maGiamGia: ['', Validators.required],
      giaTriGiam: [0, Validators.required],
      ngayBatDau: ['', Validators.required],
      gioPhutBatDau: ['', Validators.required],  // ✅ Gộp giờ & phút vào 1 trường
      ngayHetHan: ['', Validators.required],
      gioPhutHetHan: ['', Validators.required]   // ✅ Gộp giờ & phút vào 1 trường
    });
  }

  saveVoucher() {
    console.log('📌 Dữ liệu trong form:', this.voucherForm.value);
  
    if (this.voucherForm.valid) {
      const formData = { ...this.voucherForm.value }; // 🔥 Tạo bản sao để tránh lỗi
  
      // ✅ Chuyển đổi ngày + giờ đúng định dạng
      formData.ngayBatDau = this.combineDateTime(formData.ngayBatDau, formData.gioPhutBatDau);
      formData.ngayHetHan = this.combineDateTime(formData.ngayHetHan, formData.gioPhutHetHan);
  
      // 🚀 Xóa dữ liệu thừa trước khi gửi API
      delete formData.gioPhutBatDau;
      delete formData.gioPhutHetHan;
  
      console.log('📤 Dữ liệu gửi đi:', formData);
  
      this.phieuGiamGiaService.addVoucher(formData).subscribe(
        (response: any) => {
          console.log('✅ API Response:', response);
         alert('Thêm voucher thành công!');
         this.voucherAdded.emit(response); // ✅ Gửi dữ liệu mới về `VoucherComponent`
         console.log('🔴 Đang đóng modal KK...');
         this.closeModal();
        },
        (error: any) => {
          console.error('❌ Lỗi khi thêm voucher:', error);
        }
      );
    } else {
      console.warn('⚠️ Form không hợp lệ, kiểm tra lại:', this.voucherForm.errors);
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
    }, 300);
}




  
  
  // Hàm ghép ngày & giờ thành `YYYY-MM-DDTHH:mm:ss`
  combineDateTime(date: string, time: string): string {
    if (!date || !time) return ''; // Tránh lỗi nếu thiếu dữ liệu
    return `${date}T${time}:00`; // Format `YYYY-MM-DDTHH:mm:ss`
  }
  
  reloadTable() {
    const event = new CustomEvent('reloadTable'); // 🔥 Tạo sự kiện reload
    window.dispatchEvent(event); // 📢 Gửi sự kiện reload table
  }
}
