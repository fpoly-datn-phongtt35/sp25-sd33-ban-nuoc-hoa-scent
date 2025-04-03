import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BanhangoffflineComponent } from './banhangofffline.component';

describe('BanhangoffflineComponent', () => {
  let component: BanhangoffflineComponent;
  let fixture: ComponentFixture<BanhangoffflineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BanhangoffflineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BanhangoffflineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
