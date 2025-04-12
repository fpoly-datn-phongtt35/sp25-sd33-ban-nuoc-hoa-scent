import { Component, EventEmitter, Output, ChangeDetectorRef, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { SpctService } from '../../../../service/spct.service';

@Component({
  selector: 'app-edit-spct',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [NgbActiveModal],
  templateUrl: './edit-spct.component.html',
  styleUrls: ['./edit-spct.component.scss'] // Fixed typo: `styleUrl` → `styleUrls`
})
export class EditSpctComponent implements OnInit {
  @Output() customerUpdated = new EventEmitter<any>();
  @Input() spctdata: any;
  spctForm: FormGroup;
  showProminenceModal: boolean = false;
  constructor(
    private fb: FormBuilder,
    private spctService: SpctService,
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef
  ) {

    this.spctForm = this.fb.group({
      idSpct: [''], // ID để cập nhật, không cần validate required vì đây là trường tự động
      donGia: ['', [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/) // Số và tối đa 2 chữ số thập phân
      ]],
      soLuongTonKho: ['', [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^[0-9]+$/) // Số nguyên
      ]],
      dungTich: ['', [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/) // Số và tối đa 2 chữ số thập phân
      ]],
      idSanPham: [''],
      trangThai: ['', Validators.required] // Add trangThai field
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
        trangThai: this.spctdata.trangThai // Patch trangThai from spctdata
      });
    } else {
      console.error('spctdata is undefined');
    }
    console.log('spctForm:', this.spctForm.value); // Debug form values
  }

  saveProductDetail() {
    if (this.spctForm.valid) {
      const payload = this.spctForm.value;
      console.log('📤 Payload gửi đi:', payload); // Debug payload
      this.spctService.updateSpctOnAdmin(payload).subscribe(
        (response) => {
          alert('✅ Cập nhật spct thành công!');
          this.customerUpdated.emit(response);
          this.closeModal();
        },
        (error) => {
          console.error('❌ Lỗi khi cập nhật spct:', error);
          alert('❌ Không thể cập nhật spct. Vui lòng thử lại!');
        }
      );
    } else {
      console.log('⚠️ Form không hợp lệ:', this.spctForm.errors);
      alert('⚠️ Vui lòng điền đầy đủ thông tin hợp lệ.');
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
