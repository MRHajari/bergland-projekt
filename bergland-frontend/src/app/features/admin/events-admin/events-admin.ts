import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { RegistrationService } from '../../../core/services/user.registration.service';
import { EventRegistrationService } from '../../../core/services/event-registration.service.js';
import { RouterModule } from '@angular/router';



@Component({
  selector: 'app-events-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './events-admin.html',
  styleUrls: ['./events-admin.css']
})
export class EventsAdmin implements OnInit {
  private eventService = inject(EventService);
  private registrationService = inject(RegistrationService);
  private eventRegistrationService = inject(EventRegistrationService);
  private router = inject(Router);

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
    this.eventRegistrationService.getCountByEvent().subscribe({
      next: (map: Record<string, number>) => {
        this.countsMap = map || {};
        console.log('📊 Event-Anmeldungen geladen:', this.countsMap);
      },
      error: (err) => {
        console.warn('⚠️ Konnte Anmeldungszahlen nicht laden:', err);
        this.countsMap = {};
      }
    });
  }
  

  // =====================================================
  // 🔹 Neues Event anlegen
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
  // 🔹 Event bearbeiten / speichern / löschen
  // =====================================================
  editEvent(e: any) {
    this.editingEvent = { ...e };
  }

  cancelEdit() {
    this.editingEvent = null;
  }

  saveEvent() {
    if (!this.editingEvent) return;

    this.eventService.update(this.editingEvent.id, this.editingEvent).subscribe({
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
  // 🔹 Details öffnen (Teilnehmerliste)
  // =====================================================
  viewRegistrations(eventId: string) {
    this.router.navigate(['/admin/events', eventId, 'teilnehmer']);
  }

  // =====================================================
  // 🔹 Helferfunktionen
  // =====================================================
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
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
}
