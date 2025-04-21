import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhongCachComponent } from './phong-cach.component';

describe('PhongCachComponent', () => {
  let component: PhongCachComponent;
  let fixture: ComponentFixture<PhongCachComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhongCachComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhongCachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
