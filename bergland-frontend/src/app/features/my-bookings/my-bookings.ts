import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../core/auth.service';
import { BookingService, BookingInterface } from '../../core/services/booking.service';
import { EventService, EventInterface } from '../../core/services/event.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-bookings.html',
  styleUrls: ['./my-bookings.css'],
})
export class MyBookings implements OnInit {
  private authService = inject(AuthService);
  private bookingService = inject(BookingService);
  private eventService = inject(EventService);
  private router = inject(Router);

  userId: string | null = null;
  bookings = signal<BookingInterface[]>([]);
  groupedBookings = signal<
    { eventId: string; event?: EventInterface; bookings: BookingInterface[] }[]
  >([]);
  loading = signal(true);
  errorMessage = signal('');

  async ngOnInit(): Promise<void> {
    this.userId = this.authService.getUserId();

    if (!this.userId) {
      this.errorMessage.set('Bitte logge dich ein, um deine Buchungen zu sehen.');
      this.loading.set(false);
      return;
    }

    try {
      const allBookings = await firstValueFrom(this.bookingService.getByUser(this.userId));
      this.bookings.set(allBookings);

      // Gruppiere Buchungen nach Event
      const groupedMap = new Map<string, BookingInterface[]>();
      for (const b of allBookings) {
        const eventId = b.eventRegistration?.event_id;
        if (!eventId) continue;
        if (!groupedMap.has(eventId)) groupedMap.set(eventId, []);
        groupedMap.get(eventId)!.push(b);
      }

      // Lade Event-Infos
      const groupedList: { eventId: string; event?: EventInterface; bookings: BookingInterface[] }[] = [];
      for (const [eventId, bookings] of groupedMap.entries()) {
        let event: EventInterface | undefined;
        try {
          event = await firstValueFrom(this.eventService.getById(eventId));
        } catch {
          console.warn(`⚠️ Event ${eventId} konnte nicht geladen werden.`);
        }
        groupedList.push({ eventId, event, bookings });
      }

      this.groupedBookings.set(groupedList);
      this.loading.set(false);
    } catch (err: any) {
      console.error('❌ Fehler beim Laden der Buchungen:', err);
      this.errorMessage.set(err?.error?.message || 'Fehler beim Laden der Buchungen.');
      this.loading.set(false);
    }
  }

  getEventDates(event?: EventInterface): string {
    if (!event?.start_date) return '';
    const start = new Date(event.start_date).toLocaleDateString();
    const end = event.end_date && event.end_date !== event.start_date
      ? ` – ${new Date(event.end_date).toLocaleDateString()}`
      : '';
    return `${start}${end}`;
  }

  goToBooking(eventId?: string, registrationId?: string): void {
    if (!eventId || !registrationId) return;
    this.router.navigate(['/booking-accommodation'], {
      queryParams: { eventId, registrationId },
    });
  }
  
}
