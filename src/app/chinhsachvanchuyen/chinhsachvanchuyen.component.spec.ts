import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChinhsachvanchuyenComponent } from './chinhsachvanchuyen.component';

describe('ChinhsachvanchuyenComponent', () => {
  let component: ChinhsachvanchuyenComponent;
  let fixture: ComponentFixture<ChinhsachvanchuyenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChinhsachvanchuyenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChinhsachvanchuyenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
