import { Component } from '@angular/core';
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
  voucherForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private phieuGiamGiaService: PhieugiamgiaService
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
          this.activeModal.close(response);
        },
        (error: any) => {
          console.error('❌ Lỗi khi thêm voucher:', error);
        }
      );
    } else {
      console.warn('⚠️ Form không hợp lệ, kiểm tra lại:', this.voucherForm.errors);
    }
  }
  
  
  
  // Hàm ghép ngày & giờ thành `YYYY-MM-DDTHH:mm:ss`
  combineDateTime(date: string, time: string): string {
    if (!date || !time) return ''; // Tránh lỗi nếu thiếu dữ liệu
    return `${date}T${time}:00`; // Format `YYYY-MM-DDTHH:mm:ss`
  }
  
  
}
