import { Component, Input, OnInit, Output, EventEmitter,ChangeDetectorRef } from '@angular/core';
import { SpctService } from './../../service/spct.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddSpctComponent } from '../add-spct/add-spct.component'; // Import modal AddSpctComponent
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EditSpctComponent } from '../edit-spct/edit-spct.component';

@Component({
  selector: 'app-spct',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spct.component.html',
  styleUrls: ['./spct.component.scss'],
  providers: [NgbActiveModal]
})
export class SpctComponent implements OnInit {
  @Input() productId: number | null = null; // ✅ Nhận ID sản phẩm
  @Output() closeSpct = new EventEmitter<void>(); // ✅ Tạo sự kiện để báo về cha
  spct: any[] = [];
  spctUpdate:any[]=[];
  constructor(
    private spctService: SpctService,
    private modalService: NgbModal // Thêm modalService
    ,private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    console.log("ID sản phẩm trong modal:", this.productId);
    this.loadSpct();
  }

  ngOnChanges(): void {
    this.loadSpct();
  }

  loadSpct(): void {
    if (this.productId !== null) {
      console.log(`🔎 Đang tải chi tiết sản phẩm ID: ${this.productId}`);
      this.spctService.geSpctByIdProduct(this.productId).subscribe(data => {
        this.spct = data;
        console.log("✅ Dữ liệu sản phẩm:", this.spct);
      });
    }
  }

  // ✅ Mở modal thêm sản phẩm chi tiết và truyền productId
  openModalAddSpct(): void {
    const modalRef = this.modalService.open(AddSpctComponent, { backdrop: 'static', keyboard: false });
    modalRef.componentInstance.productId = this.productId; // Truyền productId vào modal
    console.log('🎉 IdSpIdSp:', this.productId);

    modalRef.componentInstance.SpctAdded.subscribe((newSpct: any) => {
      console.log('🎉 Spct mới nhận được:', newSpct);

      // ✅ Thêm voucher mới vào đầu danh sách mà không cần load lại trang
this.loadSpct();    });
  }

  openUpdateSpctModal(spct:any):void{
    const modalRef = this.modalService.open(EditSpctComponent, { backdrop: 'static', keyboard: false })
    modalRef.componentInstance.spctdata = spct; // Truyền productId vào modal

    console.log('🎉 IdSpIdSp:', spct);

    modalRef.componentInstance.customerUpdated.subscribe((newSpct: any) => {
      console.log('🎉 Spct mới nhận được:', newSpct);

      // ✅ Thêm voucher mới vào đầu danh sách mà không cần load lại trang
this.loadSpct();    });
  }

  closeDetail() {
    this.closeSpct.emit(); // 📌 Gửi sự kiện về component cha
  }
}
