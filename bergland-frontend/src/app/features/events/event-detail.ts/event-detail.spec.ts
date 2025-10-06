import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventDetailTs } from './event-detail.ts';

describe('EventDetailTs', () => {
  let component: EventDetailTs;
  let fixture: ComponentFixture<EventDetailTs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventDetailTs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventDetailTs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
