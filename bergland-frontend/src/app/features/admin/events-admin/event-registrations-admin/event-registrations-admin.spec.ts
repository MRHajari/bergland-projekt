import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventRegistrationsAdmin } from './event-registrations-admin';

describe('EventRegistrationsAdmin', () => {
  let component: EventRegistrationsAdmin;
  let fixture: ComponentFixture<EventRegistrationsAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventRegistrationsAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventRegistrationsAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
