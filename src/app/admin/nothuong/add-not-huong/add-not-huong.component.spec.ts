import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNotHuongComponent } from './add-not-huong.component';

describe('AddNotHuongComponent', () => {
  let component: AddNotHuongComponent;
  let fixture: ComponentFixture<AddNotHuongComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNotHuongComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNotHuongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
