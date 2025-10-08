// frontend/src/app/features/accommodations/accommodations-list.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AccommodationService } from '../../../core/services/accommodation.service';

@Component({
  selector: 'app-accommodations-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './accommodations-list.html',
  styleUrls: ['./accommodations-list.css'],
})
export class AccommodationsList implements OnInit {
  accommodations: any[] = [];
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private accommodationService: AccommodationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAccommodations();
  }

  loadAccommodations(): void {
    this.loading = true;
    this.accommodationService.getAll().subscribe({
      next: (data) => {
        this.accommodations = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Fehler beim Laden der Unterkünfte:', err);
        this.errorMessage = '❌ Konnte Unterkünfte nicht laden.';
        this.loading = false;
      },
    });
  }

  viewDetails(id: string): void {
    this.router.navigate(['/accommodations', id]);
  }
}
