import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { EventService, EventInterface } from '../../core/services/event.service';
import { RouteService, Route } from '../../core/services/route.service';
import { EventRouteService, EventRoute } from '../../core/services/event-route.service';
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
  startNumber: number | null;
}

interface CaptureTarget {
  participantId: string;
  registrationId: string;
  routeId: string;
  finishTime: string;
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
  private eventRouteService = inject(EventRouteService);
  private regService = inject(EventRegistrationService);
  private runtimeService = inject(RuntimeService);

  // STATE
  events = signal<EventInterface[]>([]);
  selectedEventId = signal<string | null>(null);

  routes = signal<Route[]>([]);
  eventRoutes = signal<EventRoute[]>([]);
  participants = signal<ParticipantRow[]>([]);
  runtimes = signal<Runtime[]>([]);

  loading = signal(false);
  error = signal<string | null>(null);
  timeInputError = signal<string | null>(null);
  timeCaptureSuccess = signal<string | null>(null);

  captureModalOpen = signal(false);
  captureRouteId = signal<string | null>(null);
  captureStartNumber = signal('');
  captureMatchedParticipants = signal<ParticipantRow[]>([]);
  captureMessage = signal<string | null>(null);

  // INIT
  ngOnInit() {
    this.loadEvents();
  }

  private loadEvents() {
    this.loading.set(true);
    this.error.set(null);
    this.timeInputError.set(null);
    this.timeCaptureSuccess.set(null);

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
      this.eventRoutes.set([]);
      this.participants.set([]);
      this.runtimes.set([]);
      this.timeInputError.set(null);
      this.timeCaptureSuccess.set(null);
      this.closeCaptureModal();
      return;
    }

    this.selectedEventId.set(eventId);
    this.loadEventData(eventId);
  }

  private loadEventData(eventId: string) {
    this.loading.set(true);
    this.error.set(null);
    this.timeInputError.set(null);
    this.timeCaptureSuccess.set(null);

    forkJoin({
      routes: this.routeService.getByEvent(eventId),
      eventRoutes: this.eventRouteService.getByEvent(eventId),
      regs: this.regService.getGroupByEvent(eventId),
      runtimes: this.runtimeService.getByEvent(eventId)
    }).subscribe({
      next: ({ routes, eventRoutes, regs, runtimes }) => {
        this.routes.set(routes ?? []);
        this.eventRoutes.set(eventRoutes ?? []);

        const flat: ParticipantRow[] = (regs ?? []).flatMap(reg =>
          (reg.participants ?? []).map(p => ({
            participantId: p.id!,
            registrationId: reg.id!,
            startNumber: typeof p.start_number === 'number' ? p.start_number : Number(p.start_number ?? null),
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

  private getEventRoute(routeId: string): EventRoute | undefined {
    return this.eventRoutes().find(r => r.route_id === routeId);
  }

  getRouteStartTime(routeId: string): string {
    return this.normalizeTimeForInput(this.getEventRoute(routeId)?.start_time ?? null);
  }

  getCaptureRouteName(): string {
    const routeId = this.captureRouteId();
    if (!routeId) return 'Strecke';
    return this.routes().find(r => r.id === routeId)?.name || 'Strecke';
  }

  getCapturePrimaryParticipant(): ParticipantRow | null {
    return this.captureMatchedParticipants()[0] || null;
  }

  openCaptureModal(routeId: string) {
    this.captureModalOpen.set(true);
    this.captureRouteId.set(routeId);
    this.captureStartNumber.set('');
    this.captureMatchedParticipants.set([]);
    this.captureMessage.set(null);
    this.timeInputError.set(null);
    this.timeCaptureSuccess.set(null);
  }

  closeCaptureModal() {
    this.captureModalOpen.set(false);
    this.captureRouteId.set(null);
    this.captureStartNumber.set('');
    this.captureMatchedParticipants.set([]);
    this.captureMessage.set(null);
  }

  onCaptureStartNumberInput(raw: string) {
    const normalized = (raw ?? '').trim();
    this.captureStartNumber.set(normalized);
    this.captureMatchedParticipants.set([]);
    this.captureMessage.set(null);

    if (!normalized) {
      return;
    }

    const startNumber = Number(normalized);
    if (!Number.isInteger(startNumber) || startNumber < 1) {
      this.captureMessage.set('Bitte eine gültige Startnummer eingeben.');
      return;
    }

    const matches = this.participants().filter(p => p.startNumber === startNumber);
    this.captureMatchedParticipants.set(matches);

    if (matches.length === 0) {
      this.captureMessage.set('Keine Teilnehmer mit dieser Startnummer gefunden.');
      return;
    }

    if (matches.length > 1) {
      this.captureMessage.set('Team erkannt. Die Zeit wird für alle Teilnehmer mit dieser Startnummer erfasst.');
    }
  }

  captureFinishTime() {
    const routeId = this.captureRouteId();
    const matchedParticipants = this.captureMatchedParticipants();
    const finishTime = this.getCurrentTimeString();

    if (!routeId) {
      this.captureMessage.set('Keine Strecke ausgewählt.');
      return;
    }

    if (matchedParticipants.length === 0) {
      this.captureMessage.set('Bitte zuerst eine gültige Startnummer eingeben.');
      return;
    }

    const eventRoute = this.getEventRoute(routeId);
    const eventRouteStartTime = this.normalizeTimeForApi(eventRoute?.start_time ?? null);
    const hasMissingStartTime = matchedParticipants.some(participant => {
      const existing = this.findRuntime(participant.participantId, routeId);
      return !existing && !eventRouteStartTime;
    });

    if (hasMissingStartTime) {
      this.captureMessage.set('Für diese Strecke ist keine Startzeit hinterlegt. Bitte im Admin bei der Strecke oder hier manuell eine Startzeit setzen.');
      return;
    }

    const targets: CaptureTarget[] = matchedParticipants.map(participant => ({
      participantId: participant.participantId,
      registrationId: participant.registrationId,
      routeId,
      finishTime
    }));

    this.captureFinishTimeForTargets(targets, eventRouteStartTime ?? null, matchedParticipants.map(p => p.name));
  }

  onCaptureEnter(event: Event) {
    event.preventDefault();
    this.captureFinishTime();
  }

  private captureFinishTimeForTargets(
    targets: CaptureTarget[],
    eventRouteStartTime: string | null,
    participantNames: string[]
  ) {
    const requests = targets.map(target => {
      const existing = this.findRuntime(target.participantId, target.routeId);

      if (existing?.id) {
        const payload: RuntimeUpdatePayload = {
          finish_time: target.finishTime,
          ...(existing.start_time ? {} : { start_time: eventRouteStartTime ?? undefined })
        };

        return this.runtimeService.update(existing.id, payload);
      }

      const payload: RuntimeCreatePayload = {
        participant_id: target.participantId,
        registration_id: target.registrationId,
        route_id: target.routeId,
        start_time: eventRouteStartTime!,
        finish_time: target.finishTime,
        split_time: null
      };

      return this.runtimeService.create(payload);
    });

    forkJoin(requests).subscribe({
      next: savedRuntimes => {
        savedRuntimes.forEach(runtime => {
          const existing = this.runtimes().some(item => item.id === runtime.id);
          if (existing) {
            this.replaceRuntime(runtime);
            return;
          }

          this.runtimes.update(list => [...list, runtime]);
        });

        this.timeInputError.set(null);
        this.timeCaptureSuccess.set(
          participantNames.length === 1
            ? `Zielzeit für ${participantNames[0]} auf ${targets[0].finishTime} erfasst.`
            : `Zielzeit für Team ${this.captureStartNumber()} auf ${targets[0].finishTime} erfasst.`
        );
        this.closeCaptureModal();
      },
      error: err => {
        console.error('Zielzeit erfassen fehlgeschlagen', err);
        this.captureMessage.set('Zielzeit konnte nicht gespeichert werden.');
      }
    });
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
    this.timeCaptureSuccess.set(null);

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

  private getCurrentTimeString(): string {
    const now = new Date();
    return [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map(v => String(v).padStart(2, '0'))
      .join(':');
  }
}