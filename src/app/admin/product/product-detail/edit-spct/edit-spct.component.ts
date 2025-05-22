import { Component, EventEmitter, Input, ChangeDetectorRef, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { SpctService } from '../../../../service/spct.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-spct',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [NgbActiveModal],
  templateUrl: './edit-spct.component.html',
  styleUrls: ['./edit-spct.component.scss']
})
export class EditSpctComponent implements OnInit {
  @Input() spctdata: any;
  @Input() spctList: any[] = [];
  @Output() customerUpdated = new EventEmitter<any>();
  spctForm: FormGroup;
  showProminenceModal: boolean = false;

  constructor(
    private fb: FormBuilder,
    private spctService: SpctService,
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef
  ) {
    this.spctForm = this.fb.group({
      idSpct: [{ value: '', disabled: true }],
      donGia: ['', [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)
      ]],
      soLuongTonKho: ['', [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^[0-9]+$/)
      ]],
      dungTich: ['', [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)
      ]],
      idSanPham: [{ value: '', disabled: true }],
      trangThai: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.spctdata) {
      this.spctForm.patchValue({
        idSpct: this.spctdata.idSpct,
        donGia: this.spctdata.donGia,
        soLuongTonKho: this.spctdata.soLuongTonKho,
        dungTich: this.spctdata.dungTich,
        idSanPham: this.spctdata.sanPham?.idSanPham,
        trangThai: this.spctdata.trangThai
      });
      console.log('📋 Dữ liệu form sau khi patch:', this.spctForm.value);
    } else {
      console.error('❌ spctdata is undefined');
      Swal.fire({
        title: 'Lỗi',
        text: 'Dữ liệu sản phẩm chi tiết không tồn tại!',
        icon: 'error',
        confirmButtonText: 'OK',
        position: 'center',
        customClass: {
          popup: 'swal2-centered',
          icon: 'swal2-icon',
          title: 'swal2-title',
          htmlContainer: 'swal2-content',
          confirmButton: 'swal2-confirm',
        },
        timer: 3000,
        timerProgressBar: true,
        backdrop: true,
        allowOutsideClick: true,
      });
    }
    console.log('📋 Danh sách spctList nhận được:', JSON.stringify(this.spctList, null, 2)); // Log chi tiết spctList
  }

  // Kiểm tra trùng lặp dungTich (trừ bản ghi hiện tại)
  isDungTichDuplicate(): boolean {
    const currentId = this.spctdata?.idSpct;
    const dungTich = Number(this.spctForm.get('dungTich')?.value); // Chuyển đổi thành số
    const isDuplicate = this.spctList.some(spct => 
      spct.idSpct !== currentId && Number(spct.dungTich) === dungTich
    );
    console.log('🔍 Kiểm tra trùng lặp - currentId:', currentId, 'dungTich:', dungTich, 'spctList:', JSON.stringify(this.spctList, null, 2), 'Kết quả:', isDuplicate);
    return isDuplicate;
  }

  saveProductDetail() {
    console.log('🔧 Bắt đầu saveProductDetail - Form valid:', this.spctForm.valid, 'isDungTichDuplicate:', this.isDungTichDuplicate());
    if (this.spctForm.valid && !this.isDungTichDuplicate()) {
      const formData = {
        idSpct: this.spctForm.get('idSpct')?.value,
        donGia: this.spctForm.get('donGia')?.value,
        soLuongTonKho: this.spctForm.get('soLuongTonKho')?.value,
        dungTich: this.spctForm.get('dungTich')?.value,
        idSanPham: this.spctForm.get('idSanPham')?.value,
        trangThai: this.spctForm.get('trangThai')?.value
      };
      console.log('📤 Payload gửi đi:', formData);

      this.spctService.updateSpctOnAdmin(formData).subscribe(
        (response) => {
          console.log('✅ API Response:', response);
          Swal.fire({
            title: 'Thành công',
            text: 'Cập nhật sản phẩm chi tiết thành công!',
            icon: 'success',
            confirmButtonText: 'OK',
            position: 'center',
            customClass: {
              popup: 'swal2-centered',
              icon: 'swal2-icon',
              title: 'swal2-title',
              htmlContainer: 'swal2-content',
              confirmButton: 'swal2-confirm',
            },
            timer: 3000,
            timerProgressBar: true,
            backdrop: true,
            allowOutsideClick: true,
          }).then(() => {
            this.customerUpdated.emit(response);
            this.closeModal();
          });
        },
        (error) => {
          console.error('❌ Lỗi khi cập nhật spct:', error);
          const errorMessage = error.error?.message || 'Không thể cập nhật sản phẩm chi tiết. Vui lòng thử lại!';
          Swal.fire({
            title: 'Lỗi',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'OK',
            position: 'center',
            customClass: {
              popup: 'swal2-centered',
              icon: 'swal2-icon',
              title: 'swal2-title',
              htmlContainer: 'swal2-content',
              confirmButton: 'swal2-confirm',
            },
            timer: 3000,
            timerProgressBar: true,
            backdrop: true,
            allowOutsideClick: true,
          });
        }
      );
    } else {
      console.log('⚠️ Form không hợp lệ hoặc dung tích trùng lặp:', this.spctForm.errors);
      Swal.fire({
        title: 'Lỗi',
        text: this.isDungTichDuplicate() ? `Dung tích ${this.spctForm.get('dungTich')?.value}ml đã tồn tại!` : 'Vui lòng điền đầy đủ thông tin hợp lệ!',
        icon: 'warning',
        confirmButtonText: 'OK',
        position: 'center',
        customClass: {
          popup: 'swal2-centered',
          icon: 'swal2-icon',
          title: 'swal2-title',
          htmlContainer: 'swal2-content',
          confirmButton: 'swal2-confirm',
        },
        timer: 3000,
        timerProgressBar: true,
        backdrop: true,
        allowOutsideClick: true,
      });
    }
  }

  closeModal() {
    console.log('🛑 Đang cố đóng modal chính...');

    if (this.showProminenceModal) {
      console.log('🔄 Đóng modal con (prominenceModal) trước...');
    }

    if (this.activeModal) {
      this.activeModal.dismiss('cancel');
      console.log('✅ Đã gọi dismiss trên modal chính');
    } else {
      console.error('❌ ActiveModal không khả dụng');
    }

    this.finalizeModalClose();
  }

  private finalizeModalClose() {
    console.log('🧹 Dọn dẹp trạng thái modal...');

    document.body.classList.remove('modal-open');

    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => {
      console.log('🗑️ Xóa backdrop:', backdrop);
      backdrop.remove();
    });

    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
      console.log('🗑️ Xóa lớp show khỏi modal:', modal);
      modal.classList.remove('show');
      modal.remove();
    });

    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '';

    this.cdr.detectChanges();
    console.log('✅ Đã dọn dẹp trạng thái modal');
  }
}