import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDetailUserIDComponent } from './order-detail-user-id.component';

describe('OrderDetailUserIDComponent', () => {
  let component: OrderDetailUserIDComponent;
  let fixture: ComponentFixture<OrderDetailUserIDComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDetailUserIDComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderDetailUserIDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
