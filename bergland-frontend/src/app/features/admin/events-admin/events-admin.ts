import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { EventRegistrationService } from '../../../core/services/event-registration.service';
import { AccommodationService } from '../../../core/services/accommodation.service';
import { OccupancyService } from '../../../core/services/occupancy.service';
import { Location } from '@angular/common';
import { RouteService } from '../../../core/services/route.service';
import { EventRouteService } from '../../../core/services/event-route.service';

interface RouteAssignmentForm {
  assigned: boolean;
  day_date: string;
  start_time: string;
  id?: string;
}


@Component({
  selector: 'app-events-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './events-admin.html',
  styleUrls: ['./events-admin.css']
})
export class EventsAdmin implements OnInit {
  private eventService = inject(EventService);
  private eventRegistrationService = inject(EventRegistrationService);
  private router = inject(Router);
  private accommodationService = inject(AccommodationService);
  private occupancyService = inject(OccupancyService);
  private location = inject(Location);
  private routeService = inject(RouteService);
  private eventRouteService = inject(EventRouteService);

  showRouteModal = false;
  routes: any[] = [];
  eventRoutesMap: Record<string, RouteAssignmentForm> = {};
  selectedRouteEventId: string | null = null;
  selectedRouteEvent: any = null;
  routeModalError: string | null = null;


  events: any[] = [];
  countsMap: Record<string, number> = {};

  loading = false;
  errorMessage: string | null = null;
  searchTerm = '';

  editingEvent: any = null;
  newEvent = {
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    registration_deadline: ''
  };

  // Pagination
  page = 1;
  pageSize = 8;

  ngOnInit(): void {
    this.loadEvents();
  }

  // =====================================================
  // 🔹 Events laden
  // =====================================================
  loadEvents(): void {
    this.loading = true;
    this.eventService.getAll().subscribe({
      next: (data) => {
        this.events = (data || []).map((e: any) => ({
          ...e,
          start_date: this.formatDate(e.start_date),
          end_date: this.formatDate(e.end_date),
          registration_deadline: this.formatDate(e.registration_deadline)
        }));
        this.loadCounts();
        this.loading = false;
      },
      error: (err) => {
        console.error('Fehler beim Laden der Events:', err);
        this.errorMessage = '❌ Fehler beim Laden der Events.';
        this.loading = false;
      }
    });
  }

  // =====================================================
  // 🔹 Teilnehmerzahlen laden
  // =====================================================
  loadCounts(): void {
    this.countsMap = {};
    this.eventRegistrationService.getCountByEvent().subscribe({
      next: (data) => {
        console.log("📊 Counts empfangen:", data);
        data.forEach((row) => {
          this.countsMap[row.event_id] = row.count;
        });
      },
      error: (err) => {
        console.error("❌ Fehler beim Laden der Counts:", err);
      },
    });
  }
  
  

  // =====================================================
  // ➕ Neues Event anlegen
  // =====================================================
  addEvent(): void {
    if (!this.newEvent.name.trim()) {
      alert('Bitte gib einen Namen für das Event ein.');
      return;
    }

    this.loading = true;
    this.eventService.create(this.newEvent).subscribe({
      next: () => {
        alert(`✅ Event "${this.newEvent.name}" wurde hinzugefügt.`);
        this.newEvent = { name: '', description: '', start_date: '', end_date: '', registration_deadline: '' };
        this.loadEvents();
      },
      error: (err) => {
        console.error('Fehler beim Erstellen:', err);
        alert('❌ Fehler beim Erstellen des Events.');
        this.loading = false;
      }
    });
  }

  // =====================================================
  // ✏️ Event bearbeiten / speichern / löschen
  // =====================================================
  editEvent(e: any) {
    this.editingEvent = { ...e };
  }

  cancelEdit() {
    this.editingEvent = null;
  }

  saveEvent() {
    if (!this.editingEvent) return;
  
    // Stelle sicher, dass alle Felder existieren
    const payload = {
      name: this.editingEvent.name || '',
      description: this.editingEvent.description || '',
      start_date: this.editingEvent.start_date || new Date().toISOString().split('T')[0],
      end_date: this.editingEvent.end_date || new Date().toISOString().split('T')[0],
      registration_deadline: this.editingEvent.registration_deadline || new Date().toISOString().split('T')[0],
    };
  
    this.eventService.update(this.editingEvent.id, payload).subscribe({
      next: () => {
        alert(`💾 Änderungen an "${this.editingEvent.name}" gespeichert.`);
        this.editingEvent = null;
        this.loadEvents();
      },
      error: (err) => {
        console.error('Fehler beim Speichern:', err);
        alert('❌ Fehler beim Speichern.');
      }
    });
  }
  

  deleteEvent(id: string, name: string) {
    if (!confirm(`Willst du das Event "${name}" wirklich löschen?`)) return;

    this.eventService.delete(id).subscribe({
      next: () => {
        alert(`🗑️ Event "${name}" gelöscht.`);
        this.loadEvents();
      },
      error: (err) => {
        console.error('Fehler beim Löschen:', err);
        alert('❌ Fehler beim Löschen des Events.');
      }
    });
  }

  // =====================================================
  // 🔹 Teilnehmerliste öffnen
  // =====================================================
  viewRegistrations(eventId: string) {
    this.router.navigate(['/admin/events', eventId, 'registrations']);
  }

// =====================================================
// 🏨 Unterkunftszuordnung (Modal)
// =====================================================
showAccommodationModal = false;
accommodations: any[] = [];
eventOccupancies: Record<string, boolean> = {}; // { accommodationId: true|false }
selectedEventId: string | null = null;


// Modal öffnen
openAccommodationModal(event: any) {
  this.selectedEventId = event.id;
  this.showAccommodationModal = true;

  // Alle Unterkünfte laden
  this.accommodationService.getAll().subscribe({
    next: (data) => {
      // Kein Filter – alle anzeigen
      this.accommodations = data || [];
      this.loadEventOccupancies(event.id);
    },
    error: (err) => {
      console.error('Fehler beim Laden der Unterkünfte:', err);
    },
  });
}

// Bestehende Zuordnungen für Event laden
loadEventOccupancies(eventId: string) {
  this.occupancyService.getByEvent(eventId).subscribe({
    next: (data) => {
      this.eventOccupancies = {};
      data.forEach((o) => (this.eventOccupancies[o.accommodation_id] = true));
    },
    error: (err) => {
      console.error('Fehler beim Laden der Belegungen:', err);
    },
  });
}

// Auswahl ändern (Checkbox)
toggleAccommodation(accId: string, checked: boolean) {
  this.eventOccupancies[accId] = checked;
}

onAccommodationToggle(accId: string, event: Event) {
  const checked = (event.target as HTMLInputElement | null)?.checked ?? false;
  this.toggleAccommodation(accId, checked);
}

// Änderungen speichern
saveAccommodationAssignments() {
  if (!this.selectedEventId) return;

  const assignments: { accommodation_id: string; event_id: string }[] = [];

  for (const accommodation_id in this.eventOccupancies) {
    const assigned = this.eventOccupancies[accommodation_id];
    if (!assigned) continue;

    assignments.push({
      accommodation_id,
      event_id: this.selectedEventId!,
    });
  }

  this.occupancyService.updateAssignments(this.selectedEventId!, assignments).subscribe({
    next: () => {
      this.showAccommodationModal = false;
      this.selectedEventId = null;
      this.loadEvents(); // aktualisiere Anzeige
    },
    error: (err) => {
      console.error('Fehler beim Speichern der Zuordnungen:', err);
      alert('❌ Fehler beim Speichern.');
    },
  });
}

// Modal schließen
closeAccommodationModal() {
  this.showAccommodationModal = false;
  this.selectedEventId = null;
}

onModalBackdropKeydown(event: KeyboardEvent, type: 'accommodation' | 'route') {
  if (event.key !== 'Escape') return;

  if (type === 'accommodation') {
    this.closeAccommodationModal();
    return;
  }

  this.closeRouteModal();
}

/** 🏨 Gibt die Unterkünfte als kommagetrennte Liste zurück */
getAccommodationNames(event: any): string {
  if (!event.accommodations || event.accommodations.length === 0) {
    return '–';
  }
  return event.accommodations.map((a: any) => a.name).join(', ');
}


// ================= ROUTE MODAL =================

// öffnen
openRouteModal(event: any) {
  this.selectedRouteEventId = event.id;
  this.selectedRouteEvent = event;
  this.showRouteModal = true;
  this.routeModalError = null;
  this.eventRoutesMap = {};

  this.routeService.getAll().subscribe({
    next: (data) => {
      this.routes = data || [];
      this.loadEventRoutes(event.id);
    }
  });
}

// bestehende Zuordnungen laden
loadEventRoutes(eventId: string) {
  this.eventRouteService.getByEvent(eventId).subscribe({
    next: (data) => {
      this.eventRoutesMap = {};

      for (const route of this.routes) {
        this.eventRoutesMap[route.id] = {
          assigned: false,
          day_date: this.selectedRouteEvent?.start_date || '',
          start_time: '',
        };
      }

      data.forEach((r: any) => {
        this.eventRoutesMap[r.route_id] = {
          assigned: true,
          day_date: this.formatDate(r.day_date || this.selectedRouteEvent?.start_date || ''),
          start_time: this.normalizeTime(r.start_time),
          id: r.id,
        };
      });
    }
  });
}

// checkbox toggle
toggleRoute(routeId: string, checked: boolean) {
  const current = this.getRouteAssignment(routeId);
  this.eventRoutesMap[routeId] = {
    ...current,
    assigned: checked,
    day_date: current.day_date || this.selectedRouteEvent?.start_date || '',
  };
}

onRouteToggle(routeId: string, event: Event) {
  const checked = (event.target as HTMLInputElement | null)?.checked ?? false;
  this.toggleRoute(routeId, checked);
}

updateRouteAssignment(routeId: string, field: 'day_date' | 'start_time', value: string) {
  const current = this.getRouteAssignment(routeId);
  this.eventRoutesMap[routeId] = {
    ...current,
    [field]: value,
  };
}

// speichern
saveRouteAssignments() {
  if (!this.selectedRouteEventId) return;

  this.routeModalError = null;

  const payload = Object.entries(this.eventRoutesMap)
    .filter(([_, assignment]) => assignment.assigned)
    .map(([route_id, assignment]) => ({
      event_id: this.selectedRouteEventId,
      route_id,
      day_date: assignment.day_date || null,
      start_time: assignment.start_time || null,
    }));

  const invalidAssignment = payload.find(item => item.start_time && !item.day_date);
  if (invalidAssignment) {
    this.routeModalError = 'Wenn eine Startzeit gesetzt ist, muss auch ein Datum gesetzt sein.';
    return;
  }

  this.eventRouteService.updateAssignments(this.selectedRouteEventId, payload)
    .subscribe(() => {
      this.showRouteModal = false;
      this.selectedRouteEventId = null;
      this.selectedRouteEvent = null;
      this.loadEvents();
    }, (err) => {
      console.error('Fehler beim Speichern der Strecken:', err);
      this.routeModalError = '❌ Fehler beim Speichern der Strecken und Startzeiten.';
    });
}

// schließen
closeRouteModal() {
  this.showRouteModal = false;
  this.selectedRouteEventId = null;
  this.selectedRouteEvent = null;
  this.routeModalError = null;
}

getRouteAssignment(routeId: string): RouteAssignmentForm {
  return this.eventRoutesMap[routeId] || {
    assigned: false,
    day_date: this.selectedRouteEvent?.start_date || '',
    start_time: '',
  };
}


  // =====================================================
  // 🔹 Helferfunktionen
  // =====================================================
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  }

  normalizeTime(timeStr: string): string {
    if (!timeStr) return '';
    return timeStr.slice(0, 5);
  }

  get filteredEvents() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.events;
    return this.events.filter(
      (e) =>
        e.name.toLowerCase().includes(term) ||
        (e.description || '').toLowerCase().includes(term)
    );
  }

  get pagedEvents() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredEvents.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredEvents.length / this.pageSize);
  }


  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/admin']); // Fallback-Route
    }
  }
  
}
