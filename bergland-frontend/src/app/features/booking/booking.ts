import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { BookingService, BookingInterface } from '../../core/services/booking.service';
import { AccommodationService, AccommodationInterface } from '../../core/services/accommodation.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking.html',
  styleUrls: ['./booking.css'],
})
export class Booking implements OnInit {
  // === Daten ===
  bookings: BookingInterface[] = [];
  accommodations: AccommodationInterface[] = [];

  // === UI-Zustände ===
  loading = true;
  errorMessage = '';
  eventId: string | null = null;

  // === Services ===
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);
  private accommodationService = inject(AccommodationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // ==============================================================
  // 🔹 Initialisierung
  // ==============================================================
  ngOnInit(): void {
    this.eventId = this.route.snapshot.queryParamMap.get('eventId');
    const userId = this.authService.getUserId();

    if (!userId) {
      this.errorMessage = 'Bitte logge dich ein, um deine Buchungen zu sehen.';
      this.loading = false;
      return;
    }

    if (this.eventId) {
      // Wenn von Event-Seite mit eventId gekommen → Unterkünfte laden
      this.loadAccommodations(this.eventId);
    } else {
      // Wenn kein Event → persönliche Buchungen anzeigen
      this.loadBookings(userId);
    }
  }

  // ==============================================================
  // 🔹 Buchungen des Benutzers laden
  // ==============================================================
  private loadBookings(userId: string): void {
    this.bookingService.getByUser(userId).subscribe({
      next: (data) => {
        this.bookings = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Fehler beim Laden der Buchungen:', err);
        this.errorMessage = '❌ Buchungen konnten nicht geladen werden.';
        this.loading = false;
      },
    });
  }

  // ==============================================================
  // 🔹 Unterkünfte für das aktuelle Event laden
  // ==============================================================
  private loadAccommodations(eventId: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.accommodationService.getByEvent(eventId).subscribe({
      next: (data) => {
        this.accommodations = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Fehler beim Laden der Unterkünfte:', err);

        if (err.status === 403) {
          this.errorMessage =
            '⚠️ Du bist für dieses Event nicht registriert und kannst keine Unterkünfte sehen.';
        } else {
          this.errorMessage = '❌ Unterkünfte konnten nicht geladen werden.';
        }

        this.loading = false;
      },
    });
  }

  // ==============================================================
  // 🔹 Unterkunft buchen
  // ==============================================================
  async bookAccommodation(acc: AccommodationInterface): Promise<void> {
    const userId = this.authService.getUserId();

    if (!userId) {
      alert('⚠️ Kein gültiger Benutzer gefunden.');
      return;
    }

    if (!this.eventId) {
      alert('❌ Event-ID fehlt – Buchung nicht möglich.');
      return;
    }

    const payload: BookingInterface = {
      user_id: userId,              // ✅ statt person_id
      event_id: this.eventId,
      accommodation_id: acc.id!,
      single_beds: 1,
      double_beds: 0,
      multi_beds: 0,
    };

    try {
      await this.bookingService.create(payload).toPromise();
      alert(`✅ Unterkunft "${acc.name}" wurde erfolgreich gebucht.`);
    } catch (err: any) {
      console.error('❌ Fehler bei der Buchung:', err);
      if (err.status === 409) {
        alert(`⚠️ Diese Unterkunft ist bereits ausgebucht.`);
      } else {
        alert('❌ Buchung konnte nicht abgeschlossen werden.');
      }
    }
  }

  // ==============================================================
  // 🔹 Navigation
  // ==============================================================
  goToEvents(): void {
    this.router.navigate(['/events']);
  }
}
