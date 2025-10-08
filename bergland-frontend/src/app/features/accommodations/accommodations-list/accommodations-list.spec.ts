import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccommodationsList } from './accommodations-list';

describe('AccommodationsList', () => {
  let component: AccommodationsList;
  let fixture: ComponentFixture<AccommodationsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccommodationsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccommodationsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
