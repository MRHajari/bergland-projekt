import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccommodationDetail } from './accommodation-detail';

describe('AccommodationDetail', () => {
  let component: AccommodationDetail;
  let fixture: ComponentFixture<AccommodationDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccommodationDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccommodationDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
