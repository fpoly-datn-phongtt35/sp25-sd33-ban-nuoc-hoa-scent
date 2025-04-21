import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMuiHuongComponent } from './add-mui-huong.component';

describe('AddMuiHuongComponent', () => {
  let component: AddMuiHuongComponent;
  let fixture: ComponentFixture<AddMuiHuongComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMuiHuongComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMuiHuongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
