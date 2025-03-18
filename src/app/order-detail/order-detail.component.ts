import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DonhangService } from '../service/donhang.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule,FormsModule,HeaderComponent, FooterComponent],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  orderDetails: any; // Adjust the type based on your data model
  constructor(private donHangService: DonhangService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe((params: { [x: string]: string | number; }) => {
      const orderId = +params['id'];
      this.loadOrderDetails(orderId);
    });
  }

  loadOrderDetails(orderId: number) {
    this.donHangService.getOrderDetails(orderId).subscribe(
      (      data: any) => {
        console.log("Order details:", data);
        this.orderDetails = data;
      },
      (      error: any) => {
        console.error('Error loading the order details:', error);
      }
    );
  }
  
}
