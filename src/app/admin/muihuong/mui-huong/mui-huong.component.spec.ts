import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuiHuongComponent } from './mui-huong.component';

describe('MuiHuongComponent', () => {
  let component: MuiHuongComponent;
  let fixture: ComponentFixture<MuiHuongComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MuiHuongComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MuiHuongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
