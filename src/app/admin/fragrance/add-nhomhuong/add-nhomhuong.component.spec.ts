import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNhomhuongComponent } from './add-nhomhuong.component';

describe('AddNhomhuongComponent', () => {
  let component: AddNhomhuongComponent;
  let fixture: ComponentFixture<AddNhomhuongComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNhomhuongComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNhomhuongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
