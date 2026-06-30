import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { EventService, EventInterface } from '../../../core/services/event.service';
import { RouteService, Route } from '../../../core/services/route.service';
import { EventRouteService, EventRoute } from '../../../core/services/event-route.service';
import { EventRegistrationService } from '../../../core/services/event-registration.service';
import { RuntimeService, Runtime, RuntimeStatus } from '../../../core/services/runtime.service';
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

type OverviewSortOption = 'rankAsc' | 'rankDesc' | 'startNumberAsc' | 'startNumberDesc' | 'nameAsc' | 'nameDesc';
type OverviewSortMetric = 'rank' | 'startNumber' | 'name';

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
  filterQuery = signal('');
  sortOption = signal<OverviewSortOption>('rankAsc');

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
      this.filterQuery.set('');
      this.sortOption.set('rankAsc');
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
      for (const participant of (reg.participants ?? []) as any[]) {
        const participantName = participant.person
          ? `${participant.person.first_name} ${participant.person.last_name}`
          : 'Unbekannt';

        const squadron = participant['squadron'];

        const isTeamMember = participant.participation_type === 'staffel' && !!participant.squadron_id;
        const key = isTeamMember ? `team:${participant.squadron_id}` : `single:${participant.id}`;

        if (!rowsByKey.has(key)) {
          const teamName = squadron?.name
            ? `Team ${squadron.name}`
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

  getStatusLabel(status: RuntimeStatus): string {
    return status === 'did_not_start' ? 'Did not start' : 'Did not finish';
  }

  private getRowStatus(row: OverviewRow, routeId: string): RuntimeStatus | null {
    const runtimes = this.getRowRuntimes(row, routeId);
    if (!runtimes.length) return null;

    const hasFinish = runtimes.some(runtime => !!runtime.finish_time);
    const hasStarted = runtimes.some(runtime => !!runtime.start_time || !!runtime.split_time);

    if (!hasFinish && runtimes.some(runtime => runtime.status === 'did_not_finish')) {
      return 'did_not_finish';
    }

    if (!hasStarted && runtimes.some(runtime => runtime.status === 'did_not_start')) {
      return 'did_not_start';
    }

    return null;
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
    if (this.getRowStatus(row, routeId)) return null;

    const start = this.getRowStartTime(row, routeId);
    const finish = this.getRowFinishTime(row, routeId);
    if (!start || !finish) return null;

    const startSeconds = this.timeToSeconds(start);
    const finishSeconds = this.timeToSeconds(finish);
    if (startSeconds === null || finishSeconds === null) return null;

    return finishSeconds - startSeconds;
  }

  getRouteDuration(row: OverviewRow, routeId: string): string {
    const status = this.getRowStatus(row, routeId);
    if (status) return this.getStatusLabel(status);

    const seconds = this.getRowRouteSeconds(row, routeId);
    if (seconds === null) return '—';
    return this.secondsToHms(seconds);
  }

  getRowStatusBadge(row: OverviewRow): RuntimeStatus | null {
    const outcome = this.getRowOutcome(row);
    if (outcome.kind === 'did_not_start' || outcome.kind === 'did_not_finish') {
      return outcome.kind;
    }

    return null;
  }

  private getRowOutcome(row: OverviewRow): {
    kind: 'finished' | 'did_not_start' | 'did_not_finish' | 'pending';
    totalSeconds: number | null;
  } {
    const routes = this.routes();
    if (!routes.length) {
      return { kind: 'pending', totalSeconds: null };
    }

    let total = 0;
    let finishedRoutes = 0;
    let hasDidNotFinish = false;
    let hasDidNotStart = false;

    for (const route of routes) {
      const status = this.getRowStatus(row, route.id);
      if (status === 'did_not_finish') {
        hasDidNotFinish = true;
        continue;
      }

      if (status === 'did_not_start') {
        hasDidNotStart = true;
        continue;
      }

      const seconds = this.getRowRouteSeconds(row, route.id);
      if (seconds === null) {
        continue;
      }

      finishedRoutes += 1;
      total += seconds;
    }

    if (finishedRoutes === routes.length) {
      return { kind: 'finished', totalSeconds: total };
    }

    if (hasDidNotFinish) {
      return { kind: 'did_not_finish', totalSeconds: null };
    }

    if (hasDidNotStart) {
      return { kind: 'did_not_start', totalSeconds: null };
    }

    return { kind: 'pending', totalSeconds: null };
  }

  getTotalDuration(row: OverviewRow): string {
    const outcome = this.getRowOutcome(row);
    if (outcome.kind === 'finished' && outcome.totalSeconds !== null) {
      return this.secondsToHms(outcome.totalSeconds);
    }

    if (outcome.kind === 'did_not_finish' || outcome.kind === 'did_not_start') {
      return this.getStatusLabel(outcome.kind);
    }

    return '—';
  }

  getSortedRows(): OverviewRow[] {
    const withComputed = this.rows().map(row => {
      const outcome = this.getRowOutcome(row);

      let sortGroup = 3;
      if (outcome.kind === 'finished') sortGroup = 0;
      if (outcome.kind === 'did_not_finish') sortGroup = 1;
      if (outcome.kind === 'did_not_start') sortGroup = 2;

      return {
        row,
        sortGroup,
        total: outcome.totalSeconds ?? Number.MAX_SAFE_INTEGER
      };
    });

    return withComputed
      .sort((a, b) => {
        if (a.sortGroup !== b.sortGroup) return a.sortGroup - b.sortGroup;
        if (a.total !== b.total) return a.total - b.total;
        return a.row.name.localeCompare(b.row.name, 'de');
      })
      .map(item => item.row);
  }

  onFilterInput(raw: string) {
    this.filterQuery.set((raw ?? '').trim().toLowerCase());
  }

  onSortChange(value: string) {
    const allowed: OverviewSortOption[] = [
      'rankAsc',
      'rankDesc',
      'startNumberAsc',
      'startNumberDesc',
      'nameAsc',
      'nameDesc'
    ];

    if (allowed.includes(value as OverviewSortOption)) {
      this.sortOption.set(value as OverviewSortOption);
    }
  }

  setOverviewSort(metric: OverviewSortMetric) {
    const current = this.sortOption();

    if (metric === 'rank') {
      this.sortOption.set(current === 'rankAsc' ? 'rankDesc' : 'rankAsc');
      return;
    }

    if (metric === 'startNumber') {
      this.sortOption.set(current === 'startNumberAsc' ? 'startNumberDesc' : 'startNumberAsc');
      return;
    }

    this.sortOption.set(current === 'nameAsc' ? 'nameDesc' : 'nameAsc');
  }

  isOverviewSortActive(metric: OverviewSortMetric): boolean {
    const current = this.sortOption();
    if (metric === 'rank') return current === 'rankAsc' || current === 'rankDesc';
    if (metric === 'startNumber') return current === 'startNumberAsc' || current === 'startNumberDesc';
    return current === 'nameAsc' || current === 'nameDesc';
  }

  getOverviewSortLabel(metric: OverviewSortMetric): string {
    const current = this.sortOption();

    if (metric === 'rank') {
      return current === 'rankDesc' ? 'Rang ▼' : 'Rang ▲';
    }

    if (metric === 'startNumber') {
      return current === 'startNumberDesc' ? 'Startnr. ▼' : 'Startnr. ▲';
    }

    return current === 'nameDesc' ? 'Name ▼' : 'Name ▲';
  }

  getOverallRank(row: OverviewRow): number | null {
    if (this.getRowOutcome(row).kind !== 'finished') return null;

    const ranked = this.getSortedRows().filter(item => this.getRowOutcome(item).kind === 'finished');
    const idx = ranked.findIndex(item => item.rowId === row.rowId);
    return idx >= 0 ? idx + 1 : null;
  }

  getDisplayRows(): OverviewRow[] {
    const query = this.filterQuery();
    let visible = this.getSortedRows();

    if (query) {
      visible = visible.filter(row => {
        const inName = row.name.toLowerCase().includes(query);
        const inMembers = row.members.some(member => member.name.toLowerCase().includes(query));
        const inStart = (row.startNumber?.toString() ?? '').includes(query);
        return inName || inMembers || inStart;
      });
    }

    const sorted = [...visible];
    const sort = this.sortOption();

    sorted.sort((a, b) => {
      switch (sort) {
        case 'rankDesc': {
          const aRank = this.getOverallRank(a);
          const bRank = this.getOverallRank(b);
          if (aRank === null && bRank === null) return a.name.localeCompare(b.name, 'de');
          if (aRank === null) return 1;
          if (bRank === null) return -1;
          return bRank - aRank;
        }
        case 'startNumberAsc': {
          const aNum = a.startNumber ?? Number.MAX_SAFE_INTEGER;
          const bNum = b.startNumber ?? Number.MAX_SAFE_INTEGER;
          if (aNum !== bNum) return aNum - bNum;
          return a.name.localeCompare(b.name, 'de');
        }
        case 'startNumberDesc': {
          const aNum = a.startNumber ?? -1;
          const bNum = b.startNumber ?? -1;
          if (aNum !== bNum) return bNum - aNum;
          return a.name.localeCompare(b.name, 'de');
        }
        case 'nameAsc':
          return a.name.localeCompare(b.name, 'de');
        case 'nameDesc':
          return b.name.localeCompare(a.name, 'de');
        case 'rankAsc':
        default:
        {
          const aRank = this.getOverallRank(a);
          const bRank = this.getOverallRank(b);
          if (aRank === null && bRank === null) return a.name.localeCompare(b.name, 'de');
          if (aRank === null) return 1;
          if (bRank === null) return -1;
          return aRank - bRank;
        }
      }
    });

    return sorted;
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

    const rows = this.getDisplayRows();
    if (!rows.length) return;

    const jsPdfModule: any = await import('jspdf');
    const autoTableModule: any = await import('jspdf-autotable');
    const jsPDF: any = jsPdfModule.default;
    const autoTable: any = autoTableModule.default;

    const routes = this.routes();
    const head = [['Rang', 'Teilnehmer', 'Startnr.', ...routes.map(route => route.name), 'Gesamt']];
    const body = rows.map((row) => [
      this.getOverallRank(row)?.toString() ?? '—',
      row.isTeam ? `${row.name} (Staffel)` : row.name,
      row.startNumber?.toString() ?? '-',
      ...routes.map(route => this.getRouteDuration(row, route.id)),
      this.getTotalDuration(row)
    ]);

    const JsPdfCtor: any = jsPDF;
    const doc = new JsPdfCtor({ orientation: 'landscape' });
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
