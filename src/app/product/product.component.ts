import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";


@Component({
  selector: 'app-product',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {


}
