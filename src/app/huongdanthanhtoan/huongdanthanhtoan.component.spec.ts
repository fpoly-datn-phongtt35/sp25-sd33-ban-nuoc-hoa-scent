import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HuongdanthanhtoanComponent } from './huongdanthanhtoan.component';

describe('HuongdanthanhtoanComponent', () => {
  let component: HuongdanthanhtoanComponent;
  let fixture: ComponentFixture<HuongdanthanhtoanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HuongdanthanhtoanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HuongdanthanhtoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
