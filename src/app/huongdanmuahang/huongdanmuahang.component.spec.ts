import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HuongdanmuahangComponent } from './huongdanmuahang.component';

describe('HuongdanmuahangComponent', () => {
  let component: HuongdanmuahangComponent;
  let fixture: ComponentFixture<HuongdanmuahangComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HuongdanmuahangComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HuongdanmuahangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
