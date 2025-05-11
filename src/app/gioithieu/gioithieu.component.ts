import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-gioithieu',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './gioithieu.component.html',
  styleUrl: './gioithieu.component.scss'
})
export class GioithieuComponent {

}
