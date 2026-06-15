import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { EventService, EventInterface } from '../../core/services/event.service';
import { RouteService, Route } from '../../core/services/route.service';
import { EventRegistrationService } from '../../core/services/event-registration.service';
import {
  RuntimeService,
  Runtime,
  RuntimeCreatePayload,
  RuntimeUpdatePayload
} from '../../core/services/runtime.service';

interface ParticipantRow {
  participantId: string;
  name: string;
}

@Component({
  selector: 'app-race-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './race-results.html',
  styleUrls: ['./race-results.css']
})
export class RaceResults implements OnInit {

  private eventService = inject(EventService);
  private routeService = inject(RouteService);
  private regService = inject(EventRegistrationService);
  private runtimeService = inject(RuntimeService);

  // STATE
  events = signal<EventInterface[]>([]);
  selectedEventId = signal<string | null>(null);

  routes = signal<Route[]>([]);
  participants = signal<ParticipantRow[]>([]);
  runtimes = signal<Runtime[]>([]);

  loading = signal(false);
  error = signal<string | null>(null);
  timeInputError = signal<string | null>(null);

  // INIT
  ngOnInit() {
    this.loadEvents();
  }

  private loadEvents() {
    this.loading.set(true);
    this.error.set(null);
    this.timeInputError.set(null);

    this.eventService.getAll().subscribe({
      next: data => {
        this.events.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Events konnten nicht geladen werden.');
        this.loading.set(false);
      }
    });
  }

  onSelectEvent(eventId: string) {
    if (!eventId) {
      this.selectedEventId.set(null);
      this.routes.set([]);
      this.participants.set([]);
      this.runtimes.set([]);
      this.timeInputError.set(null);
      return;
    }

    this.selectedEventId.set(eventId);
    this.loadEventData(eventId);
  }

  private loadEventData(eventId: string) {
    this.loading.set(true);
    this.error.set(null);
    this.timeInputError.set(null);

    forkJoin({
      routes: this.routeService.getByEvent(eventId),
      regs: this.regService.getGroupByEvent(eventId),
      runtimes: this.runtimeService.getByEvent(eventId)
    }).subscribe({
      next: ({ routes, regs, runtimes }) => {
        this.routes.set(routes ?? []);

        const flat: ParticipantRow[] = (regs ?? []).flatMap(reg =>
          (reg.participants ?? []).map(p => ({
            participantId: p.id!,
            name: p.person
              ? `${p.person.first_name} ${p.person.last_name}`
              : 'Unbekannt'
          }))
        );

        this.participants.set(flat);
        this.runtimes.set(runtimes ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        // Wenn du hier wieder 403 siehst: Interceptor fehlt oder Token falsch.
        console.error(err);
        this.error.set('Daten konnten nicht geladen werden.');
        this.loading.set(false);
      }
    });
  }

  // RUNTIME HELPERS
  private findRuntime(participantId: string, routeId: string): Runtime | undefined {
    return this.runtimes().find(r =>
      r.participant_id === participantId &&
      r.eventRoute?.route_id === routeId
    );
  }
  
  getTimeValue(participantId: string, routeId: string): string {
    const rt = this.findRuntime(participantId, routeId);
    if (!rt) return '';
    return this.secondsToHms(rt.duration_seconds);
  }

  /**
   * Speichern beim Blur.
   * - Wenn Wert leer: optional löschen (wenn Backend delete anbietet) ODER ignorieren
   * - Wenn Runtime existiert: update
   * - Sonst: create
   */
  onTimeBlur(participantId: string, routeId: string, raw: string) {
    const value = (raw ?? '').trim();
    this.timeInputError.set(null);

    // Leer -> wir lassen es leer. (Wenn du löschen willst: unten Kommentar lesen)
    if (!value) return;

    // "HH:MM" oder "HH:MM:SS" akzeptieren (als Dauer, nicht als Uhrzeit)
    const seconds = this.hmsToSeconds(value);
    if (seconds === null) {
      this.timeInputError.set('Ungültiges Zeitformat. Bitte HH:MM oder HH:MM:SS als Dauer eingeben.');
      return;
    }

    const existing = this.findRuntime(participantId, routeId);

    if (existing?.id) {
      const payload: RuntimeUpdatePayload = { duration_seconds: seconds };

      this.runtimeService.update(existing.id, payload).subscribe({
        next: updated => {
          this.timeInputError.set(null);
          this.replaceRuntime(updated);
        },
        error: err => console.error('Update Runtime fehlgeschlagen', err)
      });
    } else {
      const payload: RuntimeCreatePayload = {
        participant_id: participantId,
        event_route_id: routeId,
        duration_seconds: seconds
      };

      this.runtimeService.create(payload).subscribe({
        next: created => {
          this.timeInputError.set(null);
          this.runtimes.update(list => [...list, created]);
        },
        error: err => console.error('Create Runtime fehlgeschlagen', err)
      });
    }
  }

  private replaceRuntime(updated: Runtime) {
    this.runtimes.update(list => list.map(r => (r.id === updated.id ? updated : r)));
  }

  totalTime(participantId: string): string {
    const routes = this.routes();
    if (!routes.length) return '—';

    let total = 0;
    for (const r of routes) {
      const rt = this.findRuntime(participantId, r.id);
      if (!rt) return '—';
      total += rt.duration_seconds;
    }
    return this.secondsToHms(total);
  }

  // TIME UTILS
  private secondsToHms(total: number): string {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
  }

  private hmsToSeconds(hms: string): number | null {
    // erlaubt: "HH:MM" oder "HH:MM:SS"
    const parts = hms.split(':').map(p => p.trim());
    if (parts.length < 2 || parts.length > 3) return null;

    const h = Number(parts[0]);
    const m = Number(parts[1]);
    const s = parts.length === 3 ? Number(parts[2]) : 0;

    if ([h, m, s].some(n => Number.isNaN(n))) return null;
    if (h < 0 || m < 0 || m > 59 || s < 0 || s > 59) return null;

    return h * 3600 + m * 60 + s;
  }
}