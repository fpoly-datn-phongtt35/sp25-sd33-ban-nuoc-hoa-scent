import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { TokenService } from '../service/token.service';
import { TraHangService } from '../service/TraHangService';
import Swal from 'sweetalert2';
import { YeuCauTraHang } from '../service/response/YeuCauTraHang';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-tra-hang',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, ReactiveFormsModule, CommonModule, MatDialogModule],
  templateUrl: './tra-hang.component.html',
  styleUrls: ['./tra-hang.component.scss']
})
export class TraHangComponent implements OnInit {
  traHangForm: FormGroup;
  successMsg: string | null = null;
  errorMessage: string | null = null;
  spctList: any[] = [];
  idTaiKhoan: number | null;

  constructor(
    private fb: FormBuilder,
    private traHangService: TraHangService,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<TraHangComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { maDonHang: number }
  ) {
    this.idTaiKhoan = this.tokenService.getUserId();
    console.log('idtk lay token:', this.idTaiKhoan);
    this.traHangForm = this.fb.group({
      idDonHang: [{ value: data.maDonHang, disabled: true }, [Validators.required]],
      returnItems: this.fb.array([])
    });
  }

  ngOnInit(): void {
    if (!this.idTaiKhoan) {
      this.errorMessage = 'Vui lòng đăng nhập để thực hiện yêu cầu trả hàng.';
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: this.errorMessage,
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      }).then(() => {
        this.dialogRef.close(false);
      });
      return;
    }

    if (this.data.maDonHang) {
      this.loadSpctList();
    } else {
      this.errorMessage = 'Không tìm thấy mã đơn hàng.';
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: this.errorMessage,
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      }).then(() => {
        this.dialogRef.close(false);
      });
    }
  }

  get returnItems(): FormArray {
    return this.traHangForm.get('returnItems') as FormArray;
  }

  loadSpctList(): void {
    if (this.data.maDonHang) {
      this.traHangService.getSpctByDonHang(this.data.maDonHang.toString()).subscribe({
        next: (spctData) => {
          this.spctList = Array.isArray(spctData) ? spctData : [];
          console.log('spct', spctData);
          console.log('spct1', this.spctList);
          if (!this.spctList || this.spctList.length === 0) {
            this.errorMessage = 'Đơn hàng này không có sản phẩm để trả.';
            Swal.fire({
              icon: 'info',
              title: 'Thông báo',
              text: this.errorMessage,
              confirmButtonText: 'OK',
              confirmButtonColor: '#3b82f6'
            }).then(() => {
              this.dialogRef.close(false);
            });
          } else {
            this.returnItems.clear();
            this.spctList.forEach(spct => {
              const item = this.createReturnItem(spct);
              if (item) {
                this.returnItems.push(item);
              }
            });
            if (this.returnItems.length === 0) {
              this.errorMessage = 'Không có sản phẩm hợp lệ để trả hàng.';
              Swal.fire({
                icon: 'warning',
                title: 'Cảnh báo',
                text: this.errorMessage,
                confirmButtonText: 'OK',
                confirmButtonColor: '#f59e0b'
              }).then(() => {
                this.dialogRef.close(false);
              });
            }
          }
          this.cdr.detectChanges();
        },
        error: (err: Error) => {
          this.spctList = [];
          this.errorMessage = err.message || 'Lỗi khi tải danh sách sản phẩm.';
          Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: this.errorMessage,
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
          }).then(() => {
            this.dialogRef.close(false);
          });
        }
      });
    }
  }

  createReturnItem(spct: any): FormGroup | null {
    if (!spct || spct.idSpct == null || !spct.tenSanPham) {
      return null;
    }
    const maxQuantity = spct.maxQuantity != null ? spct.maxQuantity : 999;
    const item = this.fb.group({
      selected: [false],
      idSpct: [spct.idSpct, Validators.required],
      tenSanPham: [spct.tenSanPham || 'Sản phẩm không xác định', Validators.required],
      hasReturnRequest: [spct.hasReturnRequest || false],
      trangThai: [spct.trangThai],
      soLuong: ['', [Validators.min(1), Validators.max(maxQuantity)]],
      lyDoTraHang: [''],
      tinhTrangHang: [''],
      hinhThucTraHang: [''],
      ghiChu: [''],
      hinhAnhFiles: [[]],
      videoFile: [null],
      hinhAnhError: [true],
      videoError: [true]
    });

    console.log(`Created item for idSpct ${spct.idSpct}: hasReturnRequest = ${spct.hasReturnRequest}`);

    item.get('selected')?.valueChanges.subscribe(selected => {
      console.log(`Selected changed for ID ${spct.idSpct} to ${selected}`);
      if (!selected && (item.get('soLuong')?.value || item.get('lyDoTraHang')?.value)) {
        Swal.fire({
          icon: 'warning',
          title: 'Xác nhận',
          text: 'Bạn đã gửi yêu cầu trả hàng thành công ',
          showCancelButton: true,
          confirmButtonText: 'OK',
          cancelButtonText: 'Hủy'
        }).then(result => {
          if (result.isConfirmed) {
            this.resetItemValidators(item, maxQuantity);
            this.cdr.detectChanges();
          } else {
            item.get('selected')?.setValue(true, { emitEvent: false });
            this.cdr.detectChanges();
          }
        });
      } else {
        this.updateItemValidators(item, selected, maxQuantity);
        this.cdr.detectChanges();
      }
    });

    return item;
  }

  updateItemValidators(item: FormGroup, selected: boolean, maxQuantity: number): void {
    if (selected) {
      item.get('soLuong')?.setValidators([Validators.required, Validators.min(1), Validators.max(maxQuantity)]);
      item.get('lyDoTraHang')?.setValidators(Validators.required);
      item.get('tinhTrangHang')?.setValidators(Validators.required);
      item.get('hinhThucTraHang')?.setValidators(Validators.required);
    } else {
      this.resetItemValidators(item, maxQuantity);
    }
    item.get('soLuong')?.updateValueAndValidity({ emitEvent: true });
    item.get('lyDoTraHang')?.updateValueAndValidity({ emitEvent: true });
    item.get('tinhTrangHang')?.updateValueAndValidity({ emitEvent: true });
    item.get('hinhThucTraHang')?.updateValueAndValidity({ emitEvent: true });
    this.traHangForm.updateValueAndValidity();
  }

  resetItemValidators(item: FormGroup, maxQuantity: number): void {
    item.get('soLuong')?.clearValidators();
    item.get('lyDoTraHang')?.clearValidators();
    item.get('tinhTrangHang')?.clearValidators();
    item.get('hinhThucTraHang')?.clearValidators();
    item.get('hinhAnhFiles')?.setValue([]);
    item.get('videoFile')?.setValue(null);
    item.get('hinhAnhError')?.setValue(true);
    item.get('videoError')?.setValue(true);
    item.get('soLuong')?.setValue('');
    item.get('lyDoTraHang')?.setValue('');
    item.get('tinhTrangHang')?.setValue('');
    item.get('hinhThucTraHang')?.setValue('');
    item.get('ghiChu')?.setValue('');
    item.get('soLuong')?.updateValueAndValidity({ emitEvent: true });
    item.get('lyDoTraHang')?.updateValueAndValidity({ emitEvent: true });
    item.get('tinhTrangHang')?.updateValueAndValidity({ emitEvent: true });
    item.get('hinhThucTraHang')?.updateValueAndValidity({ emitEvent: true });
    this.traHangForm.updateValueAndValidity();
  }

  getMaxQuantity(idSpct: number): number {
    const spct = this.spctList.find(s => s.idSpct === idSpct);
    return spct && spct.maxQuantity != null ? spct.maxQuantity : 999;
  }

  restrictQuantity(event: Event, item: AbstractControl, index: number): void {
    const formGroupItem = item as FormGroup;
    if (!formGroupItem.get) {
      console.error(`Item at index ${index} is not a FormGroup`);
      return;
    }
    const input = event.target as HTMLInputElement;
    const maxQuantity = this.getMaxQuantity(formGroupItem.get('idSpct')?.value);
    const currentValue = parseInt(input.value);

    if (currentValue > maxQuantity) {
      formGroupItem.get('soLuong')?.setValue(maxQuantity);
      formGroupItem.get('soLuong')?.markAsTouched();
      formGroupItem.get('soLuong')?.markAsDirty();
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo!',
        text: `Số lượng không được vượt quá ${maxQuantity}. Đã đặt lại về giá trị tối đa.`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#f59e0b',
        timer: 2000
      });
    }
    formGroupItem.updateValueAndValidity();
    this.traHangForm.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  async onVideoChange(event: Event, index: number): Promise<void> {
    const input = event.target as HTMLInputElement;
    const item = this.returnItems.at(index) as FormGroup;

    if (input.files && input.files.length > 0) {
      if (input.files.length > 1) {
        item.get('videoError')?.setValue(true);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Chỉ được phép tải lên một video.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#ef4444'
        });
        item.get('videoFile')?.setValue(null);
        input.value = '';
      } else {
        const file = input.files[0];
        if (file.type !== 'video/mp4') {
          item.get('videoError')?.setValue(true);
          Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Video phải có định dạng MP4.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
          });
          item.get('videoFile')?.setValue(null);
          input.value = '';
        } else if (file.size > 50 * 1024 * 1024) {
          item.get('videoError')?.setValue(true);
          Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Kích thước video không được vượt quá 50MB.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ef4444'
          });
          item.get('videoFile')?.setValue(null);
          input.value = '';
        } else {
          const durationValid = await this.checkVideoDuration(file);
          if (!durationValid) {
            item.get('videoError')?.setValue(true);
            Swal.fire({
              icon: 'error',
              title: 'Lỗi!',
              text: 'Video không được dài quá 15 giây.',
              confirmButtonText: 'OK',
              confirmButtonColor: '#ef4444'
            });
            item.get('videoFile')?.setValue(null);
            input.value = '';
          } else {
            item.get('videoError')?.setValue(false);
            item.get('videoFile')?.setValue(file);
            console.log(`Video hợp lệ: ${file.name} for ID ${item.get('idSpct')?.value}, videoError: ${item.get('videoError')?.value}`);
          }
        }
      }
    } else {
      item.get('videoError')?.setValue(true);
      item.get('videoFile')?.setValue(null);
      console.log(`Không có video for ID ${item.get('idSpct')?.value}, videoError: true`);
    }
    item.updateValueAndValidity();
    this.traHangForm.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  private async checkVideoDuration(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        resolve(duration <= 15);
      };
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(false);
      };
      video.src = window.URL.createObjectURL(file);
    });
  }

  onHinhAnhChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const item = this.returnItems.at(index) as FormGroup;

    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      if (files.length > 2) {
        item.get('hinhAnhError')?.setValue(true);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Chỉ được phép tải lên tối đa 2 hình ảnh.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#ef4444'
        });
        item.get('hinhAnhFiles')?.setValue([]);
      } else if (files.some(file => !['image/jpeg', 'image/png'].includes(file.type))) {
        item.get('hinhAnhError')?.setValue(true);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Hình ảnh phải có định dạng JPEG hoặc PNG.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#ef4444'
        });
        item.get('hinhAnhFiles')?.setValue([]);
      } else if (files.some(file => file.size > 5 * 1024 * 1024)) {
        item.get('hinhAnhError')?.setValue(true);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Kích thước hình ảnh không được vượt quá 5MB.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#ef4444'
        });
        item.get('hinhAnhFiles')?.setValue([]);
      } else {
        item.get('hinhAnhError')?.setValue(false);
        item.get('hinhAnhFiles')?.setValue(files);
        console.log(`Hình ảnh hợp lệ: ${files.length} files uploaded for ID ${item.get('idSpct')?.value}, hinhAnhError: ${item.get('hinhAnhError')?.value}`);
      }
    } else {
      item.get('hinhAnhError')?.setValue(true);
      item.get('hinhAnhFiles')?.setValue([]);
      console.log(`Không có hình ảnh for ID ${item.get('idSpct')?.value}, hinhAnhError: true`);
    }
    item.updateValueAndValidity();
    this.traHangForm.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  onTinhTrangHangChange(index: number): void {
    const item = this.returnItems.at(index) as FormGroup;
    item.get('hinhAnhError')?.setValue(item.get('hinhAnhFiles')?.value.length === 0);
    item.get('videoError')?.setValue(!item.get('videoFile')?.value);
    item.updateValueAndValidity();
    this.traHangForm.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  onSelectionChange(event: any, index: number): void {
    const item = this.returnItems.at(index) as FormGroup;
    const isChecked = event.target.checked;
    if (!item.get('selected')) {
      console.error(`Selected control not found for index ${index}`);
      return;
    }
    item.get('selected')?.setValue(isChecked, { emitEvent: true });
    console.log(`Manually set selected for index ${index} to ${isChecked}, idSpct: ${item.get('idSpct')?.value}`);
    this.updateItemValidators(item, isChecked, this.getMaxQuantity(item.get('idSpct')?.value));
    item.updateValueAndValidity();
    this.traHangForm.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  isSubmitDisabled(): boolean {
    const hasSelectedItem = this.returnItems.controls.some(item => (item as FormGroup).get('selected')?.value);
    console.log('Has selected item:', hasSelectedItem);
    if (!hasSelectedItem) {
      console.log('No selected items, submit is disabled');
      return true;
    }

    const selectedItems = this.returnItems.controls.filter(item => (item as FormGroup).get('selected')?.value);
    console.log('Selected items count:', selectedItems.length);
    const selectedItemsInvalid = selectedItems.some((item: AbstractControl) => {
      const formGroupItem = item as FormGroup;
      const idSpct = formGroupItem.get('idSpct')?.value;
      const isInvalid = (
        formGroupItem.get('soLuong')?.invalid ||
        formGroupItem.get('lyDoTraHang')?.invalid ||
        formGroupItem.get('tinhTrangHang')?.invalid ||
        formGroupItem.get('hinhThucTraHang')?.invalid ||
        formGroupItem.get('hinhAnhError')?.value ||
        formGroupItem.get('videoError')?.value
      );
      console.log(`Item ${idSpct} invalid: ${isInvalid}`);
      console.log(`- soLuong invalid: ${formGroupItem.get('soLuong')?.invalid}, value: ${formGroupItem.get('soLuong')?.value}, required: ${formGroupItem.get('soLuong')?.hasError('required')}`);
      console.log(`- lyDoTraHang invalid: ${formGroupItem.get('lyDoTraHang')?.invalid}, value: ${formGroupItem.get('lyDoTraHang')?.value}, required: ${formGroupItem.get('lyDoTraHang')?.hasError('required')}`);
      console.log(`- tinhTrangHang invalid: ${formGroupItem.get('tinhTrangHang')?.invalid}, value: ${formGroupItem.get('tinhTrangHang')?.value}, required: ${formGroupItem.get('tinhTrangHang')?.hasError('required')}`);
      console.log(`- hinhThucTraHang invalid: ${formGroupItem.get('hinhThucTraHang')?.invalid}, value: ${formGroupItem.get('hinhThucTraHang')?.value}, required: ${formGroupItem.get('hinhThucTraHang')?.hasError('required')}`);
      console.log(`- hinhAnhError: ${formGroupItem.get('hinhAnhError')?.value}, videoError: ${formGroupItem.get('videoError')?.value}`);
      return isInvalid;
    });

    console.log('Selected items invalid:', selectedItemsInvalid);
    return !hasSelectedItem || selectedItemsInvalid;
  }

  closeModal(): void {
    const selectedItems = this.returnItems.controls.filter(item => (item as FormGroup).get('selected')?.value);
    if (selectedItems.length > 0 && selectedItems.some(item => {
      const formGroupItem = item as FormGroup;
      return (
        formGroupItem.get('soLuong')?.value ||
        formGroupItem.get('lyDoTraHang')?.value ||
        formGroupItem.get('tinhTrangHang')?.value ||
        formGroupItem.get('hinhThucTraHang')?.value ||
        formGroupItem.get('ghiChu')?.value ||
        formGroupItem.get('hinhAnhFiles')?.value.length > 0 ||
        formGroupItem.get('videoFile')?.value
      );
    })) {
     
          this.dialogRef.close(false);
        
     
    } else {
      this.dialogRef.close(false);
    }
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.successMsg = null;

    if (!this.idTaiKhoan) {
      this.errorMessage = 'Không thể xác định ID tài khoản. Vui lòng đăng nhập lại.';
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: this.errorMessage,
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      }).then(() => {
        this.dialogRef.close(false);
      });
      return;
    }

    const selectedItems = this.returnItems.controls.filter(item => (item as FormGroup).get('selected')?.value);
    if (selectedItems.length === 0) {
      this.errorMessage = 'Vui lòng chọn ít nhất một sản phẩm để trả hàng.';
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo!',
        text: this.errorMessage,
        confirmButtonText: 'OK',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    const selectedItemsInvalid = selectedItems.some((item: AbstractControl) => {
      const formGroupItem = item as FormGroup;
      const isInvalid = (
        formGroupItem.get('soLuong')?.invalid ||
        formGroupItem.get('lyDoTraHang')?.invalid ||
        formGroupItem.get('tinhTrangHang')?.invalid ||
        formGroupItem.get('hinhThucTraHang')?.invalid ||
        formGroupItem.get('hinhAnhError')?.value ||
        formGroupItem.get('videoError')?.value
      );
      return isInvalid;
    });

    if (selectedItemsInvalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin bắt buộc và tải lên hình ảnh/video minh chứng.';
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo!',
        text: this.errorMessage,
        confirmButtonText: 'OK',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    const hasFiles = selectedItems.every((item: AbstractControl) => {
      const formGroupItem = item as FormGroup;
      return (formGroupItem.get('hinhAnhFiles')?.value.length > 0 && formGroupItem.get('videoFile')?.value);
    });
    if (!hasFiles) {
      this.errorMessage = 'Vui lòng tải lên ít nhất một hình ảnh và một video minh chứng cho mỗi sản phẩm.';
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo!',
        text: this.errorMessage,
        confirmButtonText: 'OK',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    Swal.fire({
      title: 'Đang gửi yêu cầu trả hàng...',
      text: 'Vui lòng đợi trong giây lát.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const formData = new FormData();
    const yeuCauTraHangList: YeuCauTraHang[] = selectedItems.map((item: AbstractControl) => {
      const formGroupItem = item as FormGroup;
      return {
        idTaiKhoan: this.idTaiKhoan!,
        donHang: { id: this.data.maDonHang },
        spct: { idSpct: Number(formGroupItem.get('idSpct')?.value) },
        soLuong: Number(formGroupItem.get('soLuong')?.value),
        trangThai: 0,
        lyDoTraHang: formGroupItem.get('lyDoTraHang')?.value,
        tinhTrangHang: formGroupItem.get('tinhTrangHang')?.value,
        hinhThucTraHang: formGroupItem.get('hinhThucTraHang')?.value,
        ghiChu: formGroupItem.get('ghiChu')?.value || undefined,
        hinhAnhUrls: undefined,
        urlVideo: undefined
      };
    });

    formData.append('yeuCauRequest', JSON.stringify(yeuCauTraHangList));
    formData.append('idTaiKhoan', String(this.idTaiKhoan));

    selectedItems.forEach((item: AbstractControl) => {
      const formGroupItem = item as FormGroup;
      const hinhAnhFiles: File[] = formGroupItem.get('hinhAnhFiles')?.value || [];
      hinhAnhFiles.forEach(file => {
        formData.append('hinhAnh', file, file.name);
      });
      const videoFile: File = formGroupItem.get('videoFile')?.value;
      if (videoFile) {
        formData.append('video', videoFile, videoFile.name);
      }
    });

    console.log('idTaiKhoan:', formData.get('idTaiKhoan'));
    console.log('yeuCauRequest:', yeuCauTraHangList);
    for (const pair of formData.entries()) {
      console.log(`formData - ${pair[0]}: ${pair[1] instanceof File ? pair[1].name : pair[1]}`);
    }

    this.traHangService.createYeuCauTraHang(formData).subscribe({
      next: (response: YeuCauTraHang[]) => {
        response.forEach((item, index) => {
          const selectedItem = selectedItems[index] as FormGroup;
          if (item.urlVideo) selectedItem.get('urlVideo')?.setValue(item.urlVideo);
          if (item.hinhAnhUrls) selectedItem.get('hinhAnhUrls')?.setValue(item.hinhAnhUrls);
        });

        this.successMsg = 'Yêu cầu trả hàng đã được tạo thành công!';
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: this.successMsg,
          confirmButtonText: 'OK',
          confirmButtonColor: '#3b82f6',
          timer: 1500
        }).then(() => {
          this.dialogRef.close(true);
        });

        this.traHangForm.reset({
          idDonHang: this.data.maDonHang,
          returnItems: []
        });
        this.returnItems.clear();
        this.spctList.forEach(spct => {
          const item = this.createReturnItem(spct);
          if (item) {
            this.returnItems.push(item);
          }
        });
      },
      error: (err: any) => {
        this.errorMessage = err.message || 'Lỗi khi tạo yêu cầu trả hàng.';
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: this.errorMessage,
          confirmButtonText: 'OK',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }
}