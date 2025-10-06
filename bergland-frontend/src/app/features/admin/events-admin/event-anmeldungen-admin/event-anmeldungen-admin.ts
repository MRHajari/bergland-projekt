// frontend/src/app/features/admin/event-anmeldungen-admin/event-anmeldungen-admin.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BelegungService } from '../../../../core/services/belegung.service';
import { EventService } from '../../../../core/services/event.service';

@Component({
  selector: 'app-event-anmeldungen-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './event-anmeldungen-admin.html',
  styleUrls: ['./event-anmeldungen-admin.css']
})
export class EventAnmeldungenAdmin implements OnInit {
  eventId!: string;
  event: any = null;

  loading = false;
  errorMessage: string | null = null;
  teilnehmer: Array<any> = [];

  search = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private belegungService: BelegungService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = null;

    // Event Info laden (Name etc.)
    this.eventService.getById(this.eventId).subscribe({
      next: (ev) => (this.event = ev),
      error: () => {}
    });

    // Teilnehmer laden
    this.belegungService.getByEvent(this.eventId).subscribe({
      next: (rows) => {
        // rows = [{ id_event, id_person, person: { first_name, last_name, email }, ... }]
        this.teilnehmer = rows;
        this.loading = false;
      },
      error: (err) => {
        console.error('Fehler beim Laden der Teilnehmer:', err);
        this.errorMessage = '❌ Konnte Teilnehmer nicht laden.';
        this.loading = false;
      }
    });
  }

  get filteredTeilnehmer() {
    if (!this.search.trim()) return this.teilnehmer;
    const q = this.search.toLowerCase();
    return this.teilnehmer.filter(t =>
      `${t.person?.first_name || ''} ${t.person?.last_name || ''} ${t.person?.email || ''}`
        .toLowerCase()
        .includes(q)
    );
  }

  goBack(): void {
    this.router.navigate(['/admin/events']);
  }
}
