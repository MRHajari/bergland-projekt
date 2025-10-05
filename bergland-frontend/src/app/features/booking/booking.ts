import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../core/services/booking.service';
import { EventService } from '../../core/services/event.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking.html',
  styleUrls: ['./booking.css']
})
export class Booking implements OnInit {
  events: any[] = [];
  selectedEventId: number | null = null;
  guestCount: number = 1;
  message = '';
  errorMessage = '';

  constructor(
    private bookingService: BookingService,
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load events for selection
    this.eventService.getAll().subscribe({
      next: (data) => (this.events = data),
      error: (err) => (this.errorMessage = err.error?.message || 'Failed to load events')
    });
  }

  submitBooking() {
    if (!this.selectedEventId) {
      this.errorMessage = 'Please select an event.';
      return;
    }

    const bookingData = {
      eventId: this.selectedEventId,
      guestCount: this.guestCount
    };

    this.bookingService.create(bookingData).subscribe({
      next: () => {
        this.message = 'Booking successful!';
        this.errorMessage = '';
        setTimeout(() => this.router.navigate(['/profile']), 1500);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Booking failed';
        this.message = '';
      }
    });
  }
}
