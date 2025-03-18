import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDetaiAdminComponent } from './order-detai-admin.component';

describe('OrderDetaiAdminComponent', () => {
  let component: OrderDetaiAdminComponent;
  let fixture: ComponentFixture<OrderDetaiAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDetaiAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderDetaiAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
