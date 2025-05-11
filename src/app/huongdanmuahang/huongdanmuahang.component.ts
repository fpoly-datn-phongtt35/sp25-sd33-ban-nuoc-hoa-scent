import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-huongdanmuahang',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './huongdanmuahang.component.html',
  styleUrl: './huongdanmuahang.component.scss'
})
export class HuongdanmuahangComponent {

}
