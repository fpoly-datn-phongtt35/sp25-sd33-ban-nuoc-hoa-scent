import { Component, EventEmitter, Output, ChangeDetectorRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { SanPhamService } from '../../../service/product.service';
import { ThuongHieuService } from '../../../service/thuonghieu.service';
import { DanhMucService } from '../../../service/danhmuc.service';
import { NhomHuongService } from '../../../service/nhomhuong.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule, NgSelectComponent } from '@ng-select/ng-select';

// Định nghĩa interface cho dữ liệu
interface MuiHuong {
  id: number;
  tenMuiHuong: string;
}

interface NhomHuong {
  id: number;
  tenNhomHuong: string;
}

interface ThuongHieu {
  id: number;
  tenThuongHieu: string;
}

interface DanhMuc {
  id: number;
  tenDanhMuc: string;
}

interface NotHuong {
  id: number;
  tenNotHuong: string;
}

interface PhongCach {
  id: number;
  tenPhongCach: string;
}

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule],
  providers: [NgbActiveModal],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent implements OnInit {
  @Output() productAdd = new EventEmitter<any>();
  @ViewChild('muiHuongSelect') muiHuongSelect!: NgSelectComponent;

  productForm: FormGroup;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  danhMucList: DanhMuc[] = [];
  nhomHuongList: NhomHuong[] = [];
  thuongHieuList: ThuongHieu[] = [];
  muiHuongList: MuiHuong[] = [];
  notHuongList: NotHuong[] = [];
  phongCachList: PhongCach[] = [];
  muiHuongSelections: { id: number; prominenceLevel: number }[] = [];
  showProminenceModal: boolean = false;
  tempMuiHuongId: number | null = null;
  tempProminenceLevel: number = 0.5;
  loadingMuiHuong: boolean = true;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private danhMucService: DanhMucService,
    private nhomHuongService: NhomHuongService,
    private thuongHieuService: ThuongHieuService,
    private sanPhamService: SanPhamService,
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef
  ) {
    this.productForm = this.fb.group({
      ten: ['', [Validators.required, Validators.minLength(3)]],
      moTa: ['', [Validators.maxLength(1000)]],
      idThuongHieu: ['', Validators.required],
      idDanhMuc: ['', Validators.required],
      idNhomHuong: ['', Validators.required],
      notHuongDauIds: [[], Validators.required],
      notHuongGiuaIds: [[], Validators.required],
      notHuongCuoiIds: [[], Validators.required],
      phongCachIds: [[], Validators.required],
      muiHuongIds: [[]] // Không bắt buộc để tránh lỗi ban đầu
    });
  }

  async ngOnInit() {
    this.muiHuongSelections = [];
    try {
      await Promise.all([
        this.getAllDanhMuc(),
        this.getAllThuongHieu(),
        this.getAllNhomHuong(),
        this.getAllMuiHuong(),
        this.getAllNotHuong(),
        this.getAllPhongCach()
      ]);
      this.loadingMuiHuong = false;
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error in ngOnInit:', err);
      this.loadingMuiHuong = false;
      this.cdr.detectChanges();
    }
  }

  async getAllDanhMuc() {
    try {
      const data = await firstValueFrom(this.danhMucService.getAllDanhMucDanhMuc());
      this.danhMucList = data;
    } catch (err) {
      console.error('Lỗi lấy danh mục:', err);
    }
  }

  async getAllThuongHieu() {
    try {
      const data = await firstValueFrom(this.thuongHieuService.getThuonghieu());
      this.thuongHieuList = data;
      this.productForm.get('idThuongHieu')?.valueChanges.subscribe(val => {
        if (val === '-1') this.handleAddThuongHieu();
      });
    } catch (err) {
      console.error('Lỗi lấy thương hiệu:', err);
    }
  }

  async getAllNhomHuong() {
    try {
      const data = await firstValueFrom(this.nhomHuongService.getnhomHuong());
      this.nhomHuongList = data;
      this.productForm.get('idNhomHuong')?.valueChanges.subscribe(val => {
        if (val === '-1') this.handleAddNhomHuong();
      });
    } catch (err) {
      console.error('Lỗi lấy nhóm hương:', err);
    }
  }

  async getAllMuiHuong() {
    try {
      const data = await firstValueFrom(this.sanPhamService.getMuiHuong());
      this.muiHuongList = data || [];
      // Kiểm tra và lọc dữ liệu không hợp lệ
      this.muiHuongList = this.muiHuongList.filter(item => typeof item.id === 'number' && item.id > 0);
      console.log('muiHuongList loaded:', this.muiHuongList);
      if (!data || data.length === 0) {
        console.warn('No muiHuong data returned');
      }
      this.loadingMuiHuong = false;
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Lỗi lấy mùi hương:', err);
      this.loadingMuiHuong = false;
      this.cdr.detectChanges();
    }
  }

  async getAllNotHuong() {
    try {
      const data = await firstValueFrom(this.sanPhamService.getNotHuong());
      this.notHuongList = data;
    } catch (err) {
      console.error('Lỗi lấy nốt hương:', err);
    }
  }

  async getAllPhongCach() {
    try {
      const data = await firstValueFrom(this.sanPhamService.getPhongCach());
      this.phongCachList = data;
    } catch (err) {
      console.error('Lỗi lấy phong cách:', err);
    }
  }

  async handleAddThuongHieu() {
    const tenThuongHieu = prompt('📝 Nhập tên thương hiệu mới:');
    if (!tenThuongHieu || tenThuongHieu.trim().length < 2) {
      alert('⚠️ Tên thương hiệu không hợp lệ!');
      this.productForm.get('idThuongHieu')?.setValue('');
      return;
    }
    const quocGia = prompt('🌍 Nhập quốc gia của thương hiệu:') || '';
    const moTa = prompt('📄 Nhập mô tả cho thương hiệu (nếu có):') || '';
    const body = { tenThuongHieu: tenThuongHieu.trim(), quocGia: quocGia.trim(), moTa: moTa.trim() };
    try {
      const response = (await firstValueFrom(this.thuongHieuService.addThuongHieu(body))) as { id: number };
      alert('✅ Đã thêm thương hiệu mới!');
      await this.getAllThuongHieu();
      this.productForm.get('idThuongHieu')?.setValue(response.id);
    } catch (err) {
      console.error('❌ Lỗi khi thêm thương hiệu:', err);
      alert('❌ Không thể thêm thương hiệu mới!');
      this.productForm.get('idThuongHieu')?.setValue('');
    }
  }

  async handleAddNhomHuong() {
    const tenNhomHuong = prompt('📝 Nhập tên nhóm hương mới:');
    if (!tenNhomHuong || tenNhomHuong.trim().length < 2) {
      alert('⚠️ Tên nhóm hương không hợp lệ!');
      this.productForm.get('idNhomHuong')?.setValue('');
      return;
    }
    const moTa = prompt('📄 Nhập mô tả cho nhóm hương (nếu có):') || '';
    const body = { tenNhomHuong: tenNhomHuong.trim(), moTa: moTa.trim() };
    try {
      const response = (await firstValueFrom(this.nhomHuongService.createnhomHuong(body))) as { id: number };
      alert('✅ Đã thêm nhóm hương mới!');
      await this.getAllNhomHuong();
      this.productForm.get('idNhomHuong')?.setValue(response.id);
    } catch (err) {
      console.error('❌ Lỗi khi thêm nhóm hương:', err);
      alert('❌ Không thể thêm nhóm hương mới!');
      this.productForm.get('idNhomHuong')?.setValue('');
    }
  }

  onMuiHuongAdd(event: any) {
    console.log('onMuiHuongAdd triggered with event:', event);

    // Xử lý event để lấy ID
    let id: number;
    if (typeof event === 'object' && event !== null && 'id' in event) {
      id = Number(event.id);
    } else {
      id = Number(event);
    }

    if (isNaN(id) || id <= 0) {
      console.error('Invalid ID:', id);
      const currentMuiHuongIds = this.productForm.get('muiHuongIds')?.value || [];
      this.productForm.get('muiHuongIds')?.setValue(currentMuiHuongIds.filter((sId: number) => sId !== id));
      return;
    }

    if (!this.muiHuongSelections.some((s) => s.id === id)) {
      this.tempMuiHuongId = id;
      this.tempProminenceLevel = 0.5;
      this.showProminenceModal = true;
      console.log('showProminenceModal set to true:', this.showProminenceModal);
      document.body.classList.add('modal-open');
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);
      this.cdr.detectChanges();
    }
  }

  onMuiHuongRemove(event: any) {
    console.log('onMuiHuongRemove triggered with event:', event);

    // Xử lý event để lấy ID
    let id: number;
    if (typeof event === 'object' && event !== null && 'id' in event) {
      id = Number(event.id);
    } else {
      id = Number(event);
    }

    if (isNaN(id) || id <= 0) {
      console.error('Invalid ID:', id);
      return;
    }

    this.muiHuongSelections = this.muiHuongSelections.filter((s) => s.id !== id);
    const currentMuiHuongIds = this.productForm.get('muiHuongIds')?.value || [];
    this.productForm.get('muiHuongIds')?.setValue(currentMuiHuongIds.filter((sId: number) => sId !== id));
    this.cdr.detectChanges();
  }

  confirmProminence() {
    if (this.tempMuiHuongId === null) return;

    const prominenceLevel = Number(this.tempProminenceLevel);
    if (isNaN(prominenceLevel) || prominenceLevel < 0 || prominenceLevel > 1) {
      alert('Độ nổi hương phải từ 0 đến 1!');
      return;
    }

    this.muiHuongSelections = this.muiHuongSelections.filter((s) => s.id !== this.tempMuiHuongId);
    this.muiHuongSelections.push({ id: this.tempMuiHuongId, prominenceLevel });

    const currentMuiHuongIds = this.productForm.get('muiHuongIds')?.value || [];
    if (!currentMuiHuongIds.includes(this.tempMuiHuongId)) {
      this.productForm.get('muiHuongIds')?.setValue([...currentMuiHuongIds, this.tempMuiHuongId]);
    }

    this.closeProminenceModal();
    this.cdr.detectChanges();
  }

  cancelProminenceModal() {
    if (this.tempMuiHuongId !== null) {
      const currentMuiHuongIds = this.productForm.get('muiHuongIds')?.value || [];
      this.productForm.get('muiHuongIds')?.setValue(currentMuiHuongIds.filter((id: number) => id !== this.tempMuiHuongId));
    }
    this.closeProminenceModal();
  }

  closeProminenceModal() {
    this.showProminenceModal = false;
    this.tempMuiHuongId = null;
    this.tempProminenceLevel = 0.5;
    document.body.classList.remove('modal-open');
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
    this.cdr.detectChanges();
  }

  getMuiHuongName(item: number | MuiHuong): string {
    const id = typeof item === 'number' ? item : item.id;
    const muiHuong = this.muiHuongList.find((mh) => mh.id === id);
    return muiHuong ? muiHuong.tenMuiHuong : `Không tìm thấy (ID: ${id})`;
  }

  getProminenceLevel(item: number | MuiHuong): number {
    const id = typeof item === 'number' ? item : item.id;
    const selection = this.muiHuongSelections.find((s) => s.id === id);
    return selection ? Number(selection.prominenceLevel) : 0;
  }

  hasProminenceLevel(item: number | MuiHuong): boolean {
    const id = typeof item === 'number' ? item : item.id;
    return this.muiHuongSelections.some(s => s.id === id);
  }

  async addProduct() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    if (this.muiHuongSelections.length === 0) {
      alert('Vui lòng chọn ít nhất một mùi hương và nhập độ nổi hương!');
      return;
    }

    if (this.selectedFiles.length === 0) {
      alert('Vui lòng chọn ít nhất một hình ảnh!');
      return;
    }

    this.isSubmitting = true;
    const formValues = this.productForm.value;
    const formData = new FormData();

    formData.append('ten', formValues.ten || '');
    formData.append('moTa', formValues.moTa || '');
    formData.append('idThuongHieu', String(formValues.idThuongHieu));
    formData.append('idDanhMuc', String(formValues.idDanhMuc));
    formData.append('idNhomHuong', String(formValues.idNhomHuong));

    formValues.notHuongDauIds?.forEach((id: number) => formData.append('notHuongDauIds', String(id)));
    formValues.notHuongGiuaIds?.forEach((id: number) => formData.append('notHuongGiuaIds', String(id)));
    formValues.notHuongCuoiIds?.forEach((id: number) => formData.append('notHuongCuoiIds', String(id)));
    formValues.phongCachIds?.forEach((id: number) => formData.append('phongCachIds', String(id)));

    formData.append('muiHuongSelections', JSON.stringify(this.muiHuongSelections));
    this.selectedFiles.forEach((file) => formData.append('images', file));

    this.sanPhamService.addProductOnAdmin(formData).subscribe({
      next: (response) => {
        alert('✅ Thêm sản phẩm thành công!');
        this.productAdd.emit(response);
        this.closeModal();
      },
      error: (err) => {
        console.error('❌ Lỗi khi thêm sản phẩm:', err);
        alert('❌ Thêm sản phẩm thất bại!');
      },
      complete: () => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFileChange(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file: File) => {
        this.selectedFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrls.push(e.target.result);
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      });
    }
    event.target.value = '';
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
    this.cdr.detectChanges();
  }

  closeModal() {
    if (this.activeModal) {
      this.activeModal.dismiss('cancel');
    }
    const modalElement = document.querySelector('.modal');
    if (modalElement) modalElement.remove();
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
    document.body.classList.remove('modal-open');
    this.cdr.detectChanges();
  }
}