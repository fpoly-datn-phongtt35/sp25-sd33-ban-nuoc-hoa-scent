import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateNotHuongComponent } from './update-not-huong.component';

describe('UpdateNotHuongComponent', () => {
  let component: UpdateNotHuongComponent;
  let fixture: ComponentFixture<UpdateNotHuongComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateNotHuongComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateNotHuongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
