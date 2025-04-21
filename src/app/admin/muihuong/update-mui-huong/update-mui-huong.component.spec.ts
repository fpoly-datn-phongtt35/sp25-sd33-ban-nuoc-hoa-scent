import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateMuiHuongComponent } from './update-mui-huong.component';

describe('UpdateMuiHuongComponent', () => {
  let component: UpdateMuiHuongComponent;
  let fixture: ComponentFixture<UpdateMuiHuongComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateMuiHuongComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateMuiHuongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
