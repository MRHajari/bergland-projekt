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
  registrationId: string;
  name: string;
}

type RuntimeField = 'start_time' | 'finish_time' | 'split_time';

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
            registrationId: reg.id!,
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

  getRuntimeFieldValue(participantId: string, routeId: string, field: RuntimeField): string {
    const rt = this.findRuntime(participantId, routeId);
    return this.normalizeTimeForInput(rt?.[field] ?? null);
  }

  /**
   * Speichern beim Blur.
   * - Wenn Wert leer: optional löschen (wenn Backend delete anbietet) ODER ignorieren
   * - Wenn Runtime existiert: update
   * - Sonst: create
   */
  onTimeBlur(
    participantId: string,
    registrationId: string,
    routeId: string,
    field: RuntimeField,
    raw: string
  ) {
    const value = this.normalizeTimeForApi(raw);
    this.timeInputError.set(null);

    if (value !== null && !this.isValidClockTime(value)) {
      this.timeInputError.set('Ungültiges Zeitformat. Bitte HH:MM:SS als Uhrzeit eingeben.');
      return;
    }

    const existing = this.findRuntime(participantId, routeId);

    if (!existing && field !== 'start_time' && !value) {
      return;
    }

    if (!existing && field !== 'start_time') {
      this.timeInputError.set('Bitte zuerst eine Startzeit erfassen.');
      return;
    }

    if (existing?.id) {
      const payload: RuntimeUpdatePayload = { [field]: value };

      this.runtimeService.update(existing.id, payload).subscribe({
        next: updated => {
          this.timeInputError.set(null);
          this.replaceRuntime(updated);
        },
        error: err => console.error('Update Runtime fehlgeschlagen', err)
      });
    } else {
      if (!value) {
        this.timeInputError.set('Für einen neuen Eintrag ist eine Startzeit erforderlich.');
        return;
      }

      const payload: RuntimeCreatePayload = {
        participant_id: participantId,
        registration_id: registrationId,
        route_id: routeId,
        start_time: field === 'start_time' ? value : '00:00:00',
        finish_time: field === 'finish_time' ? value : null,
        split_time: field === 'split_time' ? value : null
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
    let hasAnyRuntime = false;

    for (const r of routes) {
      const rt = this.findRuntime(participantId, r.id);
      if (!rt) continue;

      hasAnyRuntime = true;
      total += rt.duration_seconds;
    }

    if (!hasAnyRuntime) return '—';

    return this.secondsToHms(total);
  }

  hasRuntime(participantId: string, routeId: string): boolean {
    return !!this.findRuntime(participantId, routeId);
  }

  // TIME UTILS
  private secondsToHms(total: number): string {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
  }

  private isValidClockTime(value: string): boolean {
    return /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(value);
  }

  private normalizeTimeForApi(raw: string | null | undefined): string | null {
    const value = (raw ?? '').trim();
    if (!value) return null;

    if (/^\d{2}:\d{2}$/.test(value)) {
      return `${value}:00`;
    }

    return value;
  }

  private normalizeTimeForInput(value: string | null): string {
    if (!value) return '';
    return value.slice(0, 8);
  }
}