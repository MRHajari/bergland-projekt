import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonService } from '../../core/services/person.service';
import { BookingService } from '../../core/services/booking.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  user: any = null;
  bookings: any[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private personService: PersonService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    // Hier nehmen wir an, dass der User im JWT oder LocalStorage eine userId hat
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.errorMessage = 'No user found. Please login again.';
      this.loading = false;
      return;
    }

    // Lade User-Daten
    this.personService.getById(String(userId)).subscribe({
      next: (data) => {
        this.user = data;
        this.loadBookings(userId);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load profile';
        this.loading = false;
      }
    });
  }

  loadBookings(userId: string) {
    this.bookingService.getAll().subscribe({
      next: (data) => {
        // Filter nur Buchungen von diesem User
        this.bookings = data.filter((b: any) => String(b.personId) === userId);
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load bookings';
        this.loading = false;
      }
    });
  }
}
