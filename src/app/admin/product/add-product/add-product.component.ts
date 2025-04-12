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
import { ToastrService } from 'ngx-toastr';

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
  prominenceForm: FormGroup; // Thêm FormGroup cho modal
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
  loadingMuiHuong: boolean = true;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private danhMucService: DanhMucService,
    private nhomHuongService: NhomHuongService,
    private thuongHieuService: ThuongHieuService,
    private sanPhamService: SanPhamService,
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
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
      muiHuongIds: [[]]
    });

    // Khởi tạo FormGroup cho modal
    this.prominenceForm = this.fb.group({
      prominenceLevel: [0.5, [Validators.required, Validators.min(0), Validators.max(1)]]
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
      this.danhMucList = data || [];
    } catch (err) {
      console.error('Lỗi lấy danh mục:', err);
    }
  }

  async getAllThuongHieu() {
    try {
      const data = await firstValueFrom(this.thuongHieuService.getThuonghieu());
      this.thuongHieuList = data || [];
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
      this.nhomHuongList = data || [];
      this.productForm.get('idNhomHuong')?.valueChanges.subscribe(val => {
        if (val === '-1') this.handleAddNhomHuong();
      });
    } catch (err) {
      console.error('Lỗi lấy nhóm hương:', err);
    }
  }

  async getAllNotHuong() {
    try {
      const data = await firstValueFrom(this.sanPhamService.getNotHuong());
      this.notHuongList = data || [];
      this.notHuongList.push({ id: -1, tenNotHuong: 'Thêm nốt hương mới...' });
    } catch (err) {
      console.error('Lỗi lấy nốt hương:', err);
    }
  }

  async getAllMuiHuong() {
    try {
      const data = await firstValueFrom(this.sanPhamService.getMuiHuong());
      this.muiHuongList = data || [];
      this.muiHuongList = this.muiHuongList.filter(item => typeof item.id === 'number' && item.id > 0);
      console.log('muiHuongList loaded:', this.muiHuongList);
      if (!data || data.length === 0) {
        console.warn('No muiHuong data returned');
      }
      this.muiHuongList.push({ id: -1, tenMuiHuong: 'Thêm mùi hương mới...' });
      this.loadingMuiHuong = false;
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Lỗi lấy mùi hương:', err);
      this.loadingMuiHuong = false;
      this.cdr.detectChanges();
    }
  }

  async getAllPhongCach() {
    try {
      const data = await firstValueFrom(this.sanPhamService.getPhongCach());
      this.phongCachList = data || [];
      this.phongCachList.push({ id: -1, tenPhongCach: 'Thêm phong cách mới...' });
    } catch (err) {
      console.error('Lỗi lấy phong cách:', err);
    }
  }

  async handleAddThuongHieu() {
    const tenThuongHieu = prompt('📝 Nhập tên thương hiệu mới:');
    if (!tenThuongHieu || tenThuongHieu.trim().length < 2) {
      this.toastr.warning('Tên thương hiệu không hợp lệ!', 'Cảnh báo');
      this.productForm.get('idThuongHieu')?.setValue('');
      return;
    }
    const quocGia = prompt('🌍 Nhập quốc gia của thương hiệu:') || '';
    const moTa = prompt('📄 Nhập mô tả cho thương hiệu (nếu có):') || '';
    const body = { tenThuongHieu: tenThuongHieu.trim(), quocGia: quocGia.trim(), moTa: moTa.trim() };
    try {
      const response = (await firstValueFrom(this.thuongHieuService.addThuongHieu(body))) as { id: number };
      this.toastr.success('Đã thêm thương hiệu mới!', 'Thành công');
      await this.getAllThuongHieu();
      this.productForm.get('idThuongHieu')?.setValue(response.id);
    } catch (err) {
      console.error('❌ Lỗi khi thêm thương hiệu:', err);
      this.toastr.error('Không thể thêm thương hiệu mới!', 'Lỗi');
      this.productForm.get('idThuongHieu')?.setValue('');
    }
  }

  async handleAddNhomHuong() {
    const tenNhomHuong = prompt('📝 Nhập tên nhóm hương mới:');
    if (!tenNhomHuong || tenNhomHuong.trim().length < 2) {
      this.toastr.warning('Tên nhóm hương không hợp lệ!', 'Cảnh báo');
      this.productForm.get('idNhomHuong')?.setValue('');
      return;
    }
    const moTa = prompt('📄 Nhập mô tả cho nhóm hương (nếu có):') || '';
    const body = { tenNhomHuong: tenNhomHuong.trim(), moTa: moTa.trim() };
    try {
      const response = (await firstValueFrom(this.nhomHuongService.createnhomHuong(body))) as { id: number };
      this.toastr.success('Đã thêm nhóm hương mới!', 'Thành công');
      await this.getAllNhomHuong();
      this.productForm.get('idNhomHuong')?.setValue(response.id);
    } catch (err) {
      console.error('❌ Lỗi khi thêm nhóm hương:', err);
      this.toastr.error('Không thể thêm nhóm hương mới!', 'Lỗi');
      this.productForm.get('idNhomHuong')?.setValue('');
    }
  }

  async handleAddNotHuong(controlName: string) {
    const tenNotHuong = prompt('📝 Nhập tên nốt hương mới:');
    if (!tenNotHuong || tenNotHuong.trim().length < 2) {
      this.toastr.warning('Tên nốt hương không hợp lệ!', 'Cảnh báo');
      this.removeNotHuongSelection(controlName, -1);
      return;
    }
    const moTa = prompt('📄 Nhập mô tả cho nốt hương (nếu có):') || '';
    const body = { tenNotHuong: tenNotHuong.trim(), moTa: moTa.trim() };
    try {
      const response = (await firstValueFrom(this.sanPhamService.addNotHuong(body))) as { id: number };
      this.toastr.success('Đã thêm nốt hương mới!', 'Thành công');
      await this.getAllNotHuong();
      const currentIds = this.productForm.get(controlName)?.value || [];
      if (!currentIds.includes(response.id)) {
        this.productForm.get(controlName)?.setValue([...currentIds, response.id]);
      }
    } catch (err) {
      console.error('❌ Lỗi khi thêm nốt hương:', err);
      this.toastr.error('Không thể thêm nốt hương mới!', 'Lỗi');
      this.removeNotHuongSelection(controlName, -1);
    }
  }

  async handleAddMuiHuong() {
    const tenMuiHuong = prompt('📝 Nhập tên mùi hương mới:');
    if (!tenMuiHuong || tenMuiHuong.trim().length < 2) {
      this.toastr.warning('Tên mùi hương không hợp lệ!', 'Cảnh báo');
      const currentMuiHuongIds = this.productForm.get('muiHuongIds')?.value || [];
      this.productForm.get('muiHuongIds')?.setValue(currentMuiHuongIds.filter((id: number) => id !== -1));
      return;
    }
    const moTa = prompt('📄 Nhập mô tả cho mùi hương (nếu có):') || '';
    const body = { tenMuiHuong: tenMuiHuong.trim(), moTa: moTa.trim() };
    try {
      const response = (await firstValueFrom(this.sanPhamService.addMuiHuong(body))) as { id: number };
      this.toastr.success('Đã thêm mùi hương mới!', 'Thành công');
      await this.getAllMuiHuong();
      const currentMuiHuongIds = this.productForm.get('muiHuongIds')?.value || [];
      if (!currentMuiHuongIds.includes(response.id)) {
        this.productForm.get('muiHuongIds')?.setValue([...currentMuiHuongIds, response.id]);
        this.onMuiHuongAdd(response.id);
      }
    } catch (err) {
      console.error('❌ Lỗi khi thêm mùi hương:', err);
      this.toastr.error('Không thể thêm mùi hương mới!', 'Lỗi');
      const currentMuiHuongIds = this.productForm.get('muiHuongIds')?.value || [];
      this.productForm.get('muiHuongIds')?.setValue(currentMuiHuongIds.filter((id: number) => id !== -1));
    }
  }

  async handleAddPhongCach() {
    const tenPhongCach = prompt('📝 Nhập tên phong cách mới:');
    if (!tenPhongCach || tenPhongCach.trim().length < 2) {
      this.toastr.warning('Tên phong cách không hợp lệ!', 'Cảnh báo');
      const currentPhongCachIds = this.productForm.get('phongCachIds')?.value || [];
      this.productForm.get('phongCachIds')?.setValue(currentPhongCachIds.filter((id: number) => id !== -1));
      return;
    }
    const moTa = prompt('📄 Nhập mô tả cho phong cách (nếu có):') || '';
    const body = { tenPhongCach: tenPhongCach.trim(), moTa: moTa.trim() };
    try {
      const response = (await firstValueFrom(this.sanPhamService.addPhongCach(body))) as { id: number };
      this.toastr.success('Đã thêm phong cách mới!', 'Thành công');
      await this.getAllPhongCach();
      const currentPhongCachIds = this.productForm.get('phongCachIds')?.value || [];
      if (!currentPhongCachIds.includes(response.id)) {
        this.productForm.get('phongCachIds')?.setValue([...currentPhongCachIds, response.id]);
      }
    } catch (err) {
      console.error('❌ Lỗi khi thêm phong cách:', err);
      this.toastr.error('Không thể thêm phong cách mới!', 'Lỗi');
      const currentPhongCachIds = this.productForm.get('phongCachIds')?.value || [];
      this.productForm.get('phongCachIds')?.setValue(currentPhongCachIds.filter((id: number) => id !== -1));
    }
  }

  onNotHuongChange(controlName: string, event: any) {
    const selectedIds = this.productForm.get(controlName)?.value || [];
    if (selectedIds.includes(-1)) {
      this.handleAddNotHuong(controlName);
    }
  }

  onMuiHuongChange(event: any) {
    const selectedIds = this.productForm.get('muiHuongIds')?.value || [];
    if (selectedIds.includes(-1)) {
      this.handleAddMuiHuong();
    }
  }

  onPhongCachChange(event: any) {
    const selectedIds = this.productForm.get('phongCachIds')?.value || [];
    if (selectedIds.includes(-1)) {
      this.handleAddPhongCach();
    }
  }

  private removeNotHuongSelection(controlName: string, idToRemove: number) {
    const currentIds = this.productForm.get(controlName)?.value || [];
    this.productForm.get(controlName)?.setValue(currentIds.filter((id: number) => id !== idToRemove));
  }

  onMuiHuongAdd(event: any) {
    console.log('onMuiHuongAdd triggered with event:', event);

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
      this.prominenceForm.get('prominenceLevel')?.setValue(0.5); // Đặt giá trị mặc định
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

    const prominenceLevel = this.prominenceForm.get('prominenceLevel')?.value;
    if (isNaN(prominenceLevel) || prominenceLevel < 0 || prominenceLevel > 1) {
      this.toastr.warning('Độ nổi hương phải từ 0 đến 1!', 'Cảnh báo');
      return;
    }

    this.muiHuongSelections = this.muiHuongSelections.filter((s) => s.id !== this.tempMuiHuongId);
    this.muiHuongSelections.push({ id: this.tempMuiHuongId, prominenceLevel });

    console.log('muiHuongSelections sau khi lưu:', this.muiHuongSelections);

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
    this.prominenceForm.get('prominenceLevel')?.setValue(0.5); // Reset giá trị
    this.closeProminenceModal();
  }

  closeProminenceModal() {
    console.log('🔄 Đóng modal con (prominenceModal)...');

    this.showProminenceModal = false;
    this.tempMuiHuongId = null;

    const backdrops = document.querySelectorAll('.modal-backdrop');
    if (backdrops.length > 1) {
      console.log('🗑️ Xóa backdrop của modal con:', backdrops[backdrops.length - 1]);
      backdrops[backdrops.length - 1].remove();
    }

    const openModals = document.querySelectorAll('.modal.show:not(.prominence-modal)');
    if (openModals.length === 0) {
      console.log('🔄 Không còn modal nào mở, xóa lớp modal-open');
      document.body.classList.remove('modal-open');
      const remainingBackdrops = document.querySelectorAll('.modal-backdrop');
      remainingBackdrops.forEach(backdrop => {
        console.log('🗑️ Xóa backdrop còn lại:', backdrop);
        backdrop.remove();
      });
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '';
    }

    this.cdr.detectChanges();
    console.log('✅ Đã đóng modal con');
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
      this.toastr.warning('Vui lòng điền đầy đủ thông tin hợp lệ!', 'Cảnh báo');
      return;
    }

    if (this.muiHuongSelections.length === 0) {
      this.toastr.warning('Vui lòng chọn ít nhất một mùi hương và nhập độ nổi hương!', 'Cảnh báo');
      return;
    }

    if (this.selectedFiles.length === 0) {
      this.toastr.warning('Vui lòng chọn ít nhất một hình ảnh!', 'Cảnh báo');
      return;
    }

    const formValues = this.productForm.value;

    // Kiểm tra dữ liệu đầu vào
    if (!this.thuongHieuList.some((th: any) => th.id === formValues.idThuongHieu)) {
      this.toastr.warning('Thương hiệu không hợp lệ!', 'Cảnh báo');
      return;
    }
    if (!this.danhMucList.some((dm: any) => dm.id === formValues.idDanhMuc)) {
      this.toastr.warning('Danh mục không hợp lệ!', 'Cảnh báo');
      return;
    }
    if (!this.nhomHuongList.some((nh: any) => nh.id === formValues.idNhomHuong)) {
      this.toastr.warning('Nhóm hương không hợp lệ!', 'Cảnh báo');
      return;
    }

    const validateNotHuong = (ids: number[], type: string) => {
      if (!ids || ids.length === 0) {
        this.toastr.warning(`Vui lòng chọn ít nhất một nốt ${type}!`, 'Cảnh báo');
        return false;
      }
      return ids.every((id: number) => this.notHuongList.some((nh: any) => nh.id === id));
    };

    if (!validateNotHuong(formValues.notHuongDauIds, 'hương đầu')) return;
    if (!validateNotHuong(formValues.notHuongGiuaIds, 'hương giữa')) return;
    if (!validateNotHuong(formValues.notHuongCuoiIds, 'hương cuối')) return;

    if (formValues.phongCachIds && formValues.phongCachIds.length > 0) {
      const invalidPhongCach = formValues.phongCachIds.some(
        (id: number) => !this.phongCachList.some((pc: any) => pc.id === id)
      );
      if (invalidPhongCach) {
        this.toastr.warning('Một số phong cách không hợp lệ!', 'Cảnh báo');
        return;
      }
    }

    const invalidMuiHuong = this.muiHuongSelections.some(
      (selection: any) => !this.muiHuongList.some((mh: any) => mh.id === selection.id)
    );
    if (invalidMuiHuong) {
      this.toastr.warning('Một số mùi hương không hợp lệ!', 'Cảnh báo');
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();

    formData.append('ten', formValues.ten || '');
    formData.append('moTa', formValues.moTa || '');
    formData.append('idThuongHieu', String(formValues.idThuongHieu));
    formData.append('idDanhMuc', String(formValues.idDanhMuc));
    formData.append('idNhomHuong', String(formValues.idNhomHuong));

    formValues.notHuongDauIds.forEach((id: number, index: number) => {
      formData.append(`notHuongDauIds[${index}]`, String(id));
    });

    formValues.notHuongGiuaIds.forEach((id: number, index: number) => {
      formData.append(`notHuongGiuaIds[${index}]`, String(id));
    });

    formValues.notHuongCuoiIds.forEach((id: number, index: number) => {
      formData.append(`notHuongCuoiIds[${index}]`, String(id));
    });

    if (formValues.phongCachIds && formValues.phongCachIds.length > 0) {
      formValues.phongCachIds.forEach((id: number, index: number) => {
        formData.append(`phongCachIds[${index}]`, String(id));
      });
    }

    this.muiHuongSelections.forEach((selection: any, index: number) => {
      const muiHuong = this.muiHuongList.find((mh: any) => mh.id === selection.id);
      if (muiHuong) {
        formData.append(`muiHuongSelections[${index}].id`, String(selection.id));
        formData.append(`muiHuongSelections[${index}].tenMuiHuong`, muiHuong.tenMuiHuong);
        formData.append(`muiHuongSelections[${index}].prominenceLevel`, String(selection.prominenceLevel));
      }
    });

    this.selectedFiles.forEach((file) => formData.append('images', file));

    console.log('FormData gửi lên API:');
    for (let pair of (formData as any).entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    try {
      const response = await firstValueFrom(this.sanPhamService.addProductOnAdmin(formData));
      this.toastr.success('Thêm sản phẩm thành công!', 'Thành công');
      this.productAdd.emit(response);
      this.closeModal();
    } catch (err: any) {
      console.error('❌ Lỗi khi thêm sản phẩm:', err);
      let errorMessage = 'Thêm sản phẩm thất bại!';
      if (err.status === 400) {
        errorMessage += ' Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
      } else if (err.status === 500) {
        errorMessage += ' Lỗi server. Vui lòng thử lại sau.';
      }
      if (err.error?.message) {
        errorMessage += ` Chi tiết: ${err.error.message}`;
      }
      this.toastr.error(errorMessage, 'Lỗi');
      this.closeModal();
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
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
    console.log('🛑 Đang cố đóng modal chính...');

    if (this.showProminenceModal) {
      console.log('🔄 Đóng modal con (prominenceModal) trước...');
      this.closeProminenceModal();
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
