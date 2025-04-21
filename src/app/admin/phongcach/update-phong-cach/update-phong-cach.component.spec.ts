import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePhongCachComponent } from './update-phong-cach.component';

describe('UpdatePhongCachComponent', () => {
  let component: UpdatePhongCachComponent;
  let fixture: ComponentFixture<UpdatePhongCachComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdatePhongCachComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdatePhongCachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
