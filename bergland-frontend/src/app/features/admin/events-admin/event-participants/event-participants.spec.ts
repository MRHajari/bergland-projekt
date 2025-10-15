import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventParticipants } from './event-participants';

describe('EventParticipants', () => {
  let component: EventParticipants;
  let fixture: ComponentFixture<EventParticipants>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventParticipants]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventParticipants);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
