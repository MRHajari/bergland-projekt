import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // ✅ HINZUGEFÜGT!
import { EventService } from '../../core/services/event.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule], // ✅ RouterModule hier einfügen
  templateUrl: './events.html',
  styleUrls: ['./events.css']
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
          return date.toLocaleDateString('de-DE'); // z.B. 25.04.2024
        };
  
        this.events = data.map((e: any) => ({
          ...e,
          start_date: formatDate(e.start_date),
          end_date: formatDate(e.end_date),
          registration_deadline: formatDate(e.registration_deadline)
        }));
  
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Fehler beim Laden der Events';
        this.loading = false;
      }
    });
  }
  
  
}
