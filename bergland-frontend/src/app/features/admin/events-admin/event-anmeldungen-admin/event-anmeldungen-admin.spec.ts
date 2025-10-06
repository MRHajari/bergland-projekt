import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventAnmeldungenAdmin } from './event-anmeldungen-admin';

describe('EventAnmeldungenAdmin', () => {
  let component: EventAnmeldungenAdmin;
  let fixture: ComponentFixture<EventAnmeldungenAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventAnmeldungenAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventAnmeldungenAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});



