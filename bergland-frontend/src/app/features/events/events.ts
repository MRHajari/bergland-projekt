import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService } from '../../core/services/event.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './events.html',
  styleUrls: ['./events.css'],
})
export class Events implements OnInit {
  events: any[] = [];
  loading = true;
  errorMessage = '';

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  private loadEvents(): void {
    this.eventService.getAll().subscribe({
      next: (data) => {
        const formatDate = (dateStr?: string) => {
          if (!dateStr) return '';
          const date = new Date(dateStr);
          return date.toLocaleDateString('de-DE');
        };

        this.events = data.map((e: any) => ({
          ...e,
          start_date: formatDate(e.start_date),
          end_date: formatDate(e.end_date),
          registration_deadline: formatDate(e.registration_deadline),
          relay_count: e.relayTeams?.length || 0,
          registration_count: e.eventRegistrations?.length || 0,
        }));

        this.loading = false;
      },
      error: (err) => {
        this.errorMessage =
          err.error?.message || 'Fehler beim Laden der Events';
        this.loading = false;
      },
    });
  }
}
