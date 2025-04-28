import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraHangNhaSanXuatComponent } from './tra-hang-nha-san-xuat.component';

describe('TraHangNhaSanXuatComponent', () => {
  let component: TraHangNhaSanXuatComponent;
  let fixture: ComponentFixture<TraHangNhaSanXuatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraHangNhaSanXuatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TraHangNhaSanXuatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
