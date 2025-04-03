import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LichsuthaotacComponent } from './lichsuthaotac.component';

describe('LichsuthaotacComponent', () => {
  let component: LichsuthaotacComponent;
  let fixture: ComponentFixture<LichsuthaotacComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LichsuthaotacComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LichsuthaotacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
