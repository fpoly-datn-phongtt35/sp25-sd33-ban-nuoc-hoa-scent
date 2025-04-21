import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPhongCachComponent } from './add-phong-cach.component';

describe('AddPhongCachComponent', () => {
  let component: AddPhongCachComponent;
  let fixture: ComponentFixture<AddPhongCachComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPhongCachComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPhongCachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
