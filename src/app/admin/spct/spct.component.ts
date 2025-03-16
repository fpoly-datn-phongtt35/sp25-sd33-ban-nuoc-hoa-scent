import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { SpctService } from './../../service/spct.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spct',
  standalone: true,
  imports:[CommonModule],
  templateUrl: './spct.component.html',
  styleUrls: ['./spct.component.scss']
})
export class SpctComponent implements OnInit {
  @Input() productId: number | null = null; // ✅ Nhận ID sản phẩm
  @Output() closeSpct = new EventEmitter<void>(); // ✅ Tạo sự kiện để báo về cha

  spct: any[] = [];

  constructor(private spctService: SpctService) {}

  ngOnInit(): void {
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

  // ✅ Hàm này sẽ gửi sự kiện về `ProductAdminComponent`
  closeDetail() {
    this.closeSpct.emit(); // 📌 Gửi sự kiện về component cha
  }
}
