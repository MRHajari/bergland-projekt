import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../../core/services/event.service';

@Component({
  selector: 'app-events-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './events-admin.html',
  styleUrls: ['./events-admin.css']
})
export class EventsAdmin implements OnInit {
  events: any[] = [];
  loading = false;
  errorMessage: string | null = null;

  editingEvent: any = null;
  newEvent = {
    name: '',
    description: '',
    start_date: '',
    end_date: ''
  };

  // 🔍 Filter
  searchTerm = '';

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.errorMessage = null;

    this.eventService.getAll().subscribe({
      next: (data) => {
        // 🔹 Datumformat korrigieren
        this.events = data.map((e: any) => ({
          ...e,
          start_date: this.formatDate(e.start_date),
          end_date: this.formatDate(e.end_date)
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Fehler beim Laden der Events:', err);
        this.errorMessage = '❌ Fehler beim Laden der Events.';
        this.loading = false;
      }
    });
  }

  // 🔹 Datumsformat fixen
  private formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  }

  // 🔍 Filterlogik
  get filteredEvents() {
    if (!this.searchTerm.trim()) return this.events;
    const term = this.searchTerm.toLowerCase();
    return this.events.filter(
      (e) =>
        e.name.toLowerCase().includes(term) ||
        e.description?.toLowerCase().includes(term)
    );
  }

  addEvent(): void {
    if (!this.newEvent.name.trim()) {
      alert('Bitte gib einen Namen für das Event ein.');
      return;
    }

    this.eventService.create(this.newEvent).subscribe({
      next: () => {
        alert(`✅ Event "${this.newEvent.name}" hinzugefügt.`);
        this.newEvent = { name: '', description: '', start_date: '', end_date: '' };
        this.loadEvents();
      },
      error: (err) => {
        console.error('Fehler beim Erstellen:', err);
        alert('❌ Fehler beim Erstellen des Events.');
      }
    });
  }

  editEvent(event: any): void {
    this.editingEvent = {
      ...event,
      start_date: this.formatDate(event.start_date),
      end_date: this.formatDate(event.end_date)
    };
  }

  saveEvent(): void {
    if (!this.editingEvent) return;

    this.eventService.update(this.editingEvent.id, this.editingEvent).subscribe({
      next: () => {
        alert(`💾 Änderungen gespeichert für "${this.editingEvent.name}".`);
        this.editingEvent = null;
        this.loadEvents();
      },
      error: (err) => {
        console.error('Fehler beim Speichern:', err);
        alert('❌ Fehler beim Speichern des Events.');
      }
    });
  }

  deleteEvent(id: string, name: string): void {
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

  cancelEdit(): void {
    this.editingEvent = null;
  }
}
