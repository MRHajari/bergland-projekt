import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { EventService, EventInterface } from '../../../core/services/event.service';
import { RouteService, Route } from '../../../core/services/route.service';
import { EventRouteService, EventRoute } from '../../../core/services/event-route.service';
import { EventRegistrationService } from '../../../core/services/event-registration.service';
import { RuntimeService, Runtime } from '../../../core/services/runtime.service';
import { AuthService } from '../../../core/auth.service';

interface OverviewRow {
  rowId: string;
  name: string;
  startNumber: number | null;
  isTeam: boolean;
  members: {
    participantId: string;
    name: string;
  }[];
}

@Component({
  selector: 'app-results-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './results-overview.html',
  styleUrls: ['./results-overview.css']
})
export class ResultsOverview implements OnInit {
  private eventService = inject(EventService);
  private routeService = inject(RouteService);
  private eventRouteService = inject(EventRouteService);
  private regService = inject(EventRegistrationService);
  private runtimeService = inject(RuntimeService);
  private activatedRoute = inject(ActivatedRoute);
  private authService = inject(AuthService);

  events = signal<EventInterface[]>([]);
  selectedEventId = signal<string | null>(null);
  isAdmin = signal(false);

  routes = signal<Route[]>([]);
  eventRoutes = signal<EventRoute[]>([]);
  rows = signal<OverviewRow[]>([]);
  runtimes = signal<Runtime[]>([]);

  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.isAdmin.set(this.authService.getUserRole() === 'admin');
    this.loadEvents();

    this.activatedRoute.queryParamMap.subscribe(params => {
      const eventId = params.get('eventId');
      if (!eventId) return;
      this.selectedEventId.set(eventId);
      this.loadOverview(eventId);
    });
  }

  private loadEvents() {
    this.eventService.getAll().subscribe({
      next: data => {
        this.events.set(data ?? []);
      },
      error: () => {
        this.error.set('Events konnten nicht geladen werden.');
      }
    });
  }

  onSelectEvent(eventId: string) {
    if (!eventId) {
      this.selectedEventId.set(null);
      this.routes.set([]);
      this.eventRoutes.set([]);
      this.rows.set([]);
      this.runtimes.set([]);
      this.error.set(null);
      return;
    }

    this.selectedEventId.set(eventId);
    this.loadOverview(eventId);
  }

  private loadOverview(eventId: string) {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      routes: this.routeService.getByEvent(eventId),
      eventRoutes: this.eventRouteService.getByEvent(eventId),
      regs: this.regService.getGroupByEvent(eventId),
      runtimes: this.runtimeService.getByEvent(eventId)
    }).subscribe({
      next: ({ routes, eventRoutes, regs, runtimes }) => {
        this.routes.set(routes ?? []);
        this.eventRoutes.set(eventRoutes ?? []);
        this.rows.set(this.buildRows(regs ?? []));
        this.runtimes.set(runtimes ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Übersicht konnte nicht geladen werden.');
        this.loading.set(false);
      }
    });
  }

  private buildRows(regs: any[]): OverviewRow[] {
    const rowsByKey = new Map<string, OverviewRow>();

    for (const reg of regs) {
      for (const participant of reg.participants ?? []) {
        const participantName = participant.person
          ? `${participant.person.first_name} ${participant.person.last_name}`
          : 'Unbekannt';

        const isTeamMember = participant.participation_type === 'staffel' && !!participant.squadron_id;
        const key = isTeamMember ? `team:${participant.squadron_id}` : `single:${participant.id}`;

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
    return this.runtimes().find(runtime =>
      runtime.participant_id === participantId &&
      (runtime.eventRoute?.route_id === routeId || runtime.route_id === routeId)
    );
  }

  private getRowRuntimes(row: OverviewRow, routeId: string): Runtime[] {
    return row.members
      .map(member => this.findRuntime(member.participantId, routeId))
      .filter((runtime): runtime is Runtime => !!runtime);
  }

  private getRowStartTime(row: OverviewRow, routeId: string): string | null {
    const starts = this.getRowRuntimes(row, routeId)
      .map(runtime => runtime.start_time)
      .filter((value): value is string => !!value)
      .sort();

    return starts[0] ?? null;
  }

  private getRowFinishTime(row: OverviewRow, routeId: string): string | null {
    const finishes = this.getRowRuntimes(row, routeId)
      .map(runtime => runtime.finish_time)
      .filter((value): value is string => !!value)
      .sort();

    return finishes[finishes.length - 1] ?? null;
  }

  private timeToSeconds(value: string | null): number | null {
    if (!value) return null;
    const [h, m, s] = value.split(':').map(Number);
    if ([h, m, s].some(Number.isNaN)) return null;
    return (h * 3600) + (m * 60) + s;
  }

  private getRowRouteSeconds(row: OverviewRow, routeId: string): number | null {
    const start = this.getRowStartTime(row, routeId);
    const finish = this.getRowFinishTime(row, routeId);
    if (!start || !finish) return null;

    const startSeconds = this.timeToSeconds(start);
    const finishSeconds = this.timeToSeconds(finish);
    if (startSeconds === null || finishSeconds === null) return null;

    return finishSeconds - startSeconds;
  }

  getRouteDuration(row: OverviewRow, routeId: string): string {
    const seconds = this.getRowRouteSeconds(row, routeId);
    if (seconds === null) return '—';
    return this.secondsToHms(seconds);
  }

  getTotalDuration(row: OverviewRow): string {
    let total = 0;
    let hasAny = false;

    for (const route of this.routes()) {
      const seconds = this.getRowRouteSeconds(row, route.id);
      if (seconds === null) continue;
      hasAny = true;
      total += seconds;
    }

    return hasAny ? this.secondsToHms(total) : '—';
  }

  getSortedRows(): OverviewRow[] {
    const withComputed = this.rows().map(row => {
      let total = 0;
      let hasAny = false;

      for (const route of this.routes()) {
        const seconds = this.getRowRouteSeconds(row, route.id);
        if (seconds === null) continue;
        hasAny = true;
        total += seconds;
      }

      return {
        row,
        total: hasAny ? total : Number.MAX_SAFE_INTEGER,
        hasAny
      };
    });

    return withComputed
      .sort((a, b) => {
        if (a.total !== b.total) return a.total - b.total;
        return a.row.name.localeCompare(b.row.name, 'de');
      })
      .map(item => item.row);
  }

  getRouteDate(routeId: string): string {
    const raw = this.eventRoutes().find(route => route.route_id === routeId)?.day_date;
    if (!raw) return 'Kein Datum';

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return 'Kein Datum';

    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  getSelectedEventName(): string {
    const eventId = this.selectedEventId();
    if (!eventId) return 'Event';
    return this.events().find(event => event.id === eventId)?.name ?? 'Event';
  }

  async downloadResultsPdf() {
    if (!this.isAdmin()) return;

    const rows = this.getSortedRows();
    if (!rows.length) return;

    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);

    const routes = this.routes();
    const head = [['Rang', 'Teilnehmer', 'Startnr.', ...routes.map(route => route.name), 'Gesamt']];
    const body = rows.map((row, index) => [
      String(index + 1),
      row.isTeam ? `${row.name} (Staffel)` : row.name,
      row.startNumber?.toString() ?? '-',
      ...routes.map(route => this.getRouteDuration(row, route.id)),
      this.getTotalDuration(row)
    ]);

    const doc = new jsPDF({ orientation: 'landscape' });
    const title = `Ergebnisse - ${this.getSelectedEventName()}`;
    const generatedAt = new Intl.DateTimeFormat('de-DE', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date());

    doc.setFontSize(14);
    doc.text(title, 14, 14);
    doc.setFontSize(10);
    doc.text(`Exportiert am: ${generatedAt}`, 14, 20);

    autoTable(doc, {
      head,
      body,
      startY: 26,
      styles: {
        fontSize: 8,
        cellPadding: 2.5
      },
      headStyles: {
        fillColor: [18, 62, 103]
      }
    });

    const safeEventName = this.getSelectedEventName().replace(/[^a-zA-Z0-9-_]/g, '_');
    doc.save(`ergebnisse_${safeEventName}.pdf`);
  }

  private secondsToHms(total: number): string {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return [h, m, s].map(value => String(value).padStart(2, '0')).join(':');
  }
}
