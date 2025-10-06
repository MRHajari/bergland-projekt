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
        this.events = data.map((e: any) => ({
          ...e,
          start_date: e.start_date?.split('T')[0],
          end_date: e.end_date?.split('T')[0]
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
