import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';

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
  rowId: string;
  name: string;
  startNumber: number | null;
  isTeam: boolean;
  members: {
    participantId: string;
    registrationId: string;
    name: string;
  }[];
}

interface CaptureTarget {
  participantId: string;
  registrationId: string;
  routeId: string;
  capturedTime: string;
}

type RuntimeField = 'start_time' | 'finish_time' | 'split_time';
type CaptureField = 'finish_time' | 'split_time';

@Component({
  selector: 'app-race-results',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
  selectedRouteId = signal<string | null>(null);

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
  captureField = signal<CaptureField>('finish_time');
  captureStartNumber = signal('');
  captureMatchedParticipants = signal<ParticipantRow[]>([]);
  captureMessage = signal<string | null>(null);
  inlineEditKey = signal<string | null>(null);
  inlineEditValue = signal('');

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
      this.selectedRouteId.set(null);
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

  onSelectRoute(routeId: string) {
    if (!routeId) {
      this.selectedRouteId.set(null);
      this.closeCaptureModal();
      return;
    }

    this.selectedRouteId.set(routeId);
    this.closeCaptureModal();
    this.timeInputError.set(null);
    this.timeCaptureSuccess.set(null);
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

        this.participants.set(this.buildParticipantRows(regs ?? []));
        this.runtimes.set(runtimes ?? []);

        const availableRoutes = routes ?? [];
        if (availableRoutes.length === 1) {
          this.selectedRouteId.set(availableRoutes[0].id);
        } else {
          this.selectedRouteId.set(null);
        }

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
  private buildParticipantRows(regs: any[]): ParticipantRow[] {
    const rowsByKey = new Map<string, ParticipantRow>();

    for (const reg of regs) {
      for (const participant of reg.participants ?? []) {
        const participantName = participant.person
          ? `${participant.person.first_name} ${participant.person.last_name}`
          : 'Unbekannt';

        const isTeamMember =
          participant.participation_type === 'staffel' &&
          !!participant.squadron_id;

        const key = isTeamMember
          ? `team:${participant.squadron_id}`
          : `single:${participant.id}`;

        if (!rowsByKey.has(key)) {
          const teamName = participant.squadron?.name
            ? `Team ${participant.squadron.name}`
            : `Team ${participant.start_number ?? ''}`.trim();

          rowsByKey.set(key, {
            rowId: key,
            name: isTeamMember ? teamName : participantName,
            startNumber: participant.start_number ?? null,
            isTeam: isTeamMember,
            members: []
          });
        }

        const row = rowsByKey.get(key)!;
        row.members.push({
          participantId: participant.id,
          registrationId: reg.id,
          name: participantName
        });

        if (row.startNumber === null && participant.start_number !== null && participant.start_number !== undefined) {
          row.startNumber = participant.start_number;
        }
      }
    }

    return Array.from(rowsByKey.values()).sort((a, b) => {
      const aNum = a.startNumber ?? Number.MAX_SAFE_INTEGER;
      const bNum = b.startNumber ?? Number.MAX_SAFE_INTEGER;
      if (aNum !== bNum) return aNum - bNum;
      return a.name.localeCompare(b.name, 'de');
    });
  }

  private findRuntime(participantId: string, routeId: string): Runtime | undefined {
    return this.runtimes().find(r =>
      r.participant_id === participantId &&
      (r.eventRoute?.route_id === routeId || r.route_id === routeId)
    );
  }

  private getRowRuntimes(row: ParticipantRow, routeId: string): Runtime[] {
    return row.members
      .map(member => this.findRuntime(member.participantId, routeId))
      .filter((runtime): runtime is Runtime => !!runtime);
  }

  private getRowStartTime(row: ParticipantRow, routeId: string): string | null {
    const starts = this.getRowRuntimes(row, routeId)
      .map(runtime => runtime.start_time)
      .filter((value): value is string => !!value)
      .sort();

    return starts[0] ?? null;
  }

  private getRowSplitTime(row: ParticipantRow, routeId: string): string | null {
    const splits = this.getRowRuntimes(row, routeId)
      .map(runtime => runtime.split_time)
      .filter((value): value is string => !!value)
      .sort();

    return splits[0] ?? null;
  }

  private getRowFinishTime(row: ParticipantRow, routeId: string): string | null {
    const finishes = this.getRowRuntimes(row, routeId)
      .map(runtime => runtime.finish_time)
      .filter((value): value is string => !!value)
      .sort();

    return finishes[finishes.length - 1] ?? null;
  }

  private getRowDurationSeconds(row: ParticipantRow, routeId: string): number | null {
    const start = this.getRowStartTime(row, routeId);
    const finish = this.getRowFinishTime(row, routeId);
    if (!start || !finish) return null;

    const startSeconds = this.timeToSeconds(start);
    const finishSeconds = this.timeToSeconds(finish);
    if (startSeconds === null || finishSeconds === null) return null;
    return finishSeconds - startSeconds;
  }

  private timeToSeconds(value: string | null): number | null {
    if (!value) return null;
    const [h, m, s] = value.split(':').map(Number);
    if ([h, m, s].some(Number.isNaN)) return null;
    return (h * 3600) + (m * 60) + s;
  }

  private getEventRoute(routeId: string): EventRoute | undefined {
    return this.eventRoutes().find(r => r.route_id === routeId);
  }

  getRouteStartTime(routeId: string): string {
    return this.normalizeTimeForInput(this.getEventRoute(routeId)?.start_time ?? null);
  }

  getSelectedRoute(): Route | null {
    const routeId = this.selectedRouteId();
    if (!routeId) return null;
    return this.routes().find(route => route.id === routeId) || null;
  }

  getRouteDate(routeId: string): string {
    const raw = this.getEventRoute(routeId)?.day_date;
    if (!raw) return 'Kein Datum';

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return 'Kein Datum';

    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  getDisplayStartTime(row: ParticipantRow, routeId: string): string {
    const runtimeStart = this.normalizeTimeForInput(this.getRowStartTime(row, routeId));
    if (runtimeStart) return runtimeStart;
    return this.getRouteStartTime(routeId);
  }

  hasStartReference(row: ParticipantRow, routeId: string): boolean {
    return !!this.getDisplayStartTime(row, routeId);
  }

  hasCapturedField(row: ParticipantRow, routeId: string, field: CaptureField): boolean {
    return !!this.getCapturedFieldValue(row, routeId, field);
  }

  getCapturedFieldValue(row: ParticipantRow, routeId: string, field: CaptureField): string {
    const value = field === 'split_time'
      ? this.getRowSplitTime(row, routeId)
      : this.getRowFinishTime(row, routeId);

    return this.normalizeTimeForInput(value);
  }

  private buildInlineEditKey(rowId: string, routeId: string, field: RuntimeField): string {
    return `${rowId}::${routeId}::${field}`;
  }

  isEditingField(row: ParticipantRow, routeId: string, field: RuntimeField): boolean {
    return this.inlineEditKey() === this.buildInlineEditKey(row.rowId, routeId, field);
  }

  startInlineEdit(row: ParticipantRow, routeId: string, field: RuntimeField) {
    const initialValue = field === 'start_time'
      ? this.getDisplayStartTime(row, routeId)
      : this.getCapturedFieldValue(row, routeId, field as CaptureField);

    this.inlineEditKey.set(this.buildInlineEditKey(row.rowId, routeId, field));
    this.inlineEditValue.set(initialValue);
    this.timeInputError.set(null);
    this.timeCaptureSuccess.set(null);
  }

  cancelInlineEdit() {
    this.inlineEditKey.set(null);
    this.inlineEditValue.set('');
  }

  onInlineEditInput(raw: string) {
    this.inlineEditValue.set(raw ?? '');
  }

  saveInlineEdit(
    row: ParticipantRow,
    routeId: string,
    field: RuntimeField
  ) {
    this.onTimeBlur(row, routeId, field, this.inlineEditValue());
    this.cancelInlineEdit();
  }

  onInlineEditEnter(
    event: Event,
    row: ParticipantRow,
    routeId: string,
    field: RuntimeField
  ) {
    event.preventDefault();
    this.saveInlineEdit(row, routeId, field);
  }

  captureFieldNow(
    row: ParticipantRow,
    routeId: string,
    field: CaptureField
  ) {
    this.onTimeBlur(row, routeId, field, this.getCurrentTimeString());
  }

  getCaptureRouteName(): string {
    const routeId = this.selectedRouteId();
    if (!routeId) return 'Strecke';
    return this.routes().find(r => r.id === routeId)?.name || 'Strecke';
  }

  getCaptureActionLabel(): string {
    return this.captureField() === 'split_time' ? 'Zwischenzeit erfassen' : 'Zielzeit erfassen';
  }

  getCaptureActionPastLabel(): string {
    return this.captureField() === 'split_time' ? 'Zwischenzeit' : 'Zielzeit';
  }

  getCapturePrimaryParticipant(): ParticipantRow | null {
    return this.captureMatchedParticipants()[0] || null;
  }

  openCaptureModal(field: CaptureField) {
    const routeId = this.selectedRouteId();
    if (!routeId) {
      this.timeInputError.set('Bitte zuerst eine Strecke auswählen.');
      return;
    }

    this.captureModalOpen.set(true);
    this.captureRouteId.set(routeId);
    this.captureField.set(field);
    this.captureStartNumber.set('');
    this.captureMatchedParticipants.set([]);
    this.captureMessage.set(null);
    this.timeInputError.set(null);
    this.timeCaptureSuccess.set(null);
  }

  closeCaptureModal() {
    this.captureModalOpen.set(false);
    this.captureRouteId.set(null);
    this.captureField.set('finish_time');
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

  captureRuntimeTime() {
    const routeId = this.selectedRouteId();
    const matchedParticipants = this.captureMatchedParticipants();
    const captureField = this.captureField();
    const capturedTime = this.getCurrentTimeString();

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
    const hasMissingStartTime = matchedParticipants.some(row => {
      const hasExistingRuntime = this.getRowRuntimes(row, routeId).length > 0;
      return !hasExistingRuntime && !eventRouteStartTime;
    });

    if (hasMissingStartTime) {
      this.captureMessage.set('Für diese Strecke ist keine Startzeit hinterlegt. Bitte im Admin bei der Strecke oder hier manuell eine Startzeit setzen.');
      return;
    }

    this.saveFieldForRows(
      matchedParticipants,
      routeId,
      captureField,
      capturedTime,
      eventRouteStartTime ?? null,
      true
    );
  }

  onCaptureEnter(event: Event) {
    event.preventDefault();
    this.captureRuntimeTime();
  }

  onCaptureBackdropKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeCaptureModal();
    }
  }

  private getMemberState(row: ParticipantRow, routeId: string) {
    return row.members.map((member, index) => ({
      member,
      index,
      runtime: this.findRuntime(member.participantId, routeId)
    }));
  }

  private selectMemberForField(
    row: ParticipantRow,
    routeId: string,
    field: RuntimeField
  ): { participantId: string; registrationId: string; name: string } {
    const states = this.getMemberState(row, routeId);
    if (states.length === 0) {
      throw new Error('Keine Team-Mitglieder gefunden.');
    }

    if (field === 'start_time') {
      return states[0].member;
    }

    if (field === 'split_time') {
      const active = states.find(state => state.runtime?.start_time && !state.runtime?.split_time);
      if (active) return active.member;

      const noRuntime = states.find(state => !state.runtime);
      if (noRuntime) return noRuntime.member;

      const withoutSplit = states.find(state => !state.runtime?.split_time);
      if (withoutSplit) return withoutSplit.member;

      return states[0].member;
    }

    const lastSplitIndex = [...states]
      .reverse()
      .find(state => !!state.runtime?.split_time)?.index;

    if (lastSplitIndex !== undefined && states[lastSplitIndex + 1]) {
      return states[lastSplitIndex + 1].member;
    }

    const running = states.find(state => state.runtime?.start_time && !state.runtime?.finish_time);
    if (running) return running.member;

    const noRuntime = states.find(state => !state.runtime);
    if (noRuntime) return noRuntime.member;

    const withoutFinish = states.find(state => !state.runtime?.finish_time);
    if (withoutFinish) return withoutFinish.member;

    return states[states.length - 1].member;
  }

  private getStartTimeForCreate(
    row: ParticipantRow,
    routeId: string,
    memberId: string,
    field: RuntimeField,
    value: string | null,
    eventRouteStartTime: string | null
  ): string | null {
    if (field === 'start_time') {
      return value;
    }

    if (field === 'split_time') {
      return eventRouteStartTime;
    }

    const memberIndex = row.members.findIndex(member => member.participantId === memberId);
    if (memberIndex > 0) {
      const previousMember = row.members[memberIndex - 1];
      const previousRuntime = this.findRuntime(previousMember.participantId, routeId);
      if (previousRuntime?.split_time) {
        return previousRuntime.split_time;
      }
    }

    return eventRouteStartTime;
  }

  private buildRuntimeRequest(
    row: ParticipantRow,
    routeId: string,
    field: RuntimeField,
    value: string | null,
    eventRouteStartTime: string | null
  ): Observable<Runtime> | null {
    const member = this.selectMemberForField(row, routeId, field);
    const existing = this.findRuntime(member.participantId, routeId);

    if (!existing && field !== 'start_time' && !value) {
      return null;
    }

    if (existing?.id) {
      const startFallback = this.getStartTimeForCreate(
        row,
        routeId,
        member.participantId,
        field,
        value,
        eventRouteStartTime
      );

      const payload: RuntimeUpdatePayload = {
        [field]: value,
        ...(existing.start_time ? {} : { start_time: startFallback ?? undefined })
      };
      return this.runtimeService.update(existing.id, payload);
    }

    const startTimeForCreate = this.getStartTimeForCreate(
      row,
      routeId,
      member.participantId,
      field,
      value,
      eventRouteStartTime
    );

    if (!startTimeForCreate) {
      return null;
    }

    const payload: RuntimeCreatePayload = {
      participant_id: member.participantId,
      registration_id: member.registrationId,
      route_id: routeId,
      start_time: startTimeForCreate,
      finish_time: field === 'finish_time' ? value : null,
      split_time: field === 'split_time' ? value : null
    };

    return this.runtimeService.create(payload);
  }

  private saveFieldForRows(
    rows: ParticipantRow[],
    routeId: string,
    field: RuntimeField,
    value: string | null,
    eventRouteStartTime: string | null,
    fromCapture = false
  ) {
    const requests = rows
      .map(row => this.buildRuntimeRequest(row, routeId, field, value, eventRouteStartTime))
      .filter((request): request is Observable<Runtime> => !!request);

    if (requests.length === 0) {
      if (field !== 'start_time') {
        this.timeInputError.set('Für diese Strecke fehlt eine Startzeit. Bitte zuerst Startzeit setzen.');
      }
      return;
    }

    forkJoin(requests).subscribe({
      next: saved => {
        saved.forEach(runtime => {
          const exists = this.runtimes().some(item => item.id === runtime.id);
          if (exists) {
            this.replaceRuntime(runtime);
            return;
          }
          this.runtimes.update(list => [...list, runtime]);
        });

        this.timeInputError.set(null);
        if (fromCapture) {
          const timeValue = value ?? this.getCurrentTimeString();
          this.timeCaptureSuccess.set(
            rows.length === 1
              ? `${this.getCaptureActionPastLabel()} für ${rows[0].name} auf ${timeValue} erfasst.`
              : `${this.getCaptureActionPastLabel()} für Startnummer ${this.captureStartNumber()} auf ${timeValue} erfasst.`
          );
          this.closeCaptureModal();
          return;
        }

        this.timeCaptureSuccess.set('Zeit gespeichert.');
      },
      error: err => {
        console.error('Runtime speichern fehlgeschlagen', err);
        if (fromCapture) {
          this.captureMessage.set(`${this.getCaptureActionPastLabel()} konnte nicht gespeichert werden.`);
          return;
        }
        this.timeInputError.set(err?.error?.error || 'Zeit konnte nicht gespeichert werden.');
      }
    });
  }
  
  getTimeValue(row: ParticipantRow, routeId: string): string {
    const seconds = this.getRowDurationSeconds(row, routeId);
    if (seconds === null) return '';
    return this.secondsToHms(seconds);
  }

  hasFinishedRuntime(row: ParticipantRow, routeId: string): boolean {
    return this.getRowDurationSeconds(row, routeId) !== null;
  }

  /**
   * Speichern beim Blur.
   * - Wenn Wert leer: optional löschen (wenn Backend delete anbietet) ODER ignorieren
   * - Wenn Runtime existiert: update
   * - Sonst: create
   */
  onTimeBlur(
    row: ParticipantRow,
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

    const routeStartTime = this.normalizeTimeForApi(this.getEventRoute(routeId)?.start_time ?? null);

    this.saveFieldForRows([row], routeId, field, value, routeStartTime, false);
  }

  private replaceRuntime(updated: Runtime) {
    this.runtimes.update(list => list.map(r => (r.id === updated.id ? updated : r)));
  }

  totalTime(row: ParticipantRow): string {
    const routes = this.routes();
    if (!routes.length) return '—';

    let total = 0;
    let hasAnyFinishedRuntime = false;

    for (const r of routes) {
      const seconds = this.getRowDurationSeconds(row, r.id);
      if (seconds === null) continue;

      hasAnyFinishedRuntime = true;
      total += seconds;
    }

    if (!hasAnyFinishedRuntime) return '—';

    return this.secondsToHms(total);
  }

  hasRuntime(row: ParticipantRow, routeId: string): boolean {
    return this.getRowRuntimes(row, routeId).length > 0;
  }

  getSelectedRouteDuration(row: ParticipantRow): string {
    const routeId = this.selectedRouteId();
    if (!routeId) return '—';
    if (!this.hasFinishedRuntime(row, routeId)) return '—';
    return this.getTimeValue(row, routeId);
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