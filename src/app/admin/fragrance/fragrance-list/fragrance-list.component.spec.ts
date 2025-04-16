import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FragranceListComponent } from './fragrance-list.component';

describe('FragranceListComponent', () => {
  let component: FragranceListComponent;
  let fixture: ComponentFixture<FragranceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FragranceListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FragranceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
