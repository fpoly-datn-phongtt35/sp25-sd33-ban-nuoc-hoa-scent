import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateNhomhuongComponent } from './update-nhomhuong.component';

describe('UpdateNhomhuongComponent', () => {
  let component: UpdateNhomhuongComponent;
  let fixture: ComponentFixture<UpdateNhomhuongComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateNhomhuongComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateNhomhuongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
