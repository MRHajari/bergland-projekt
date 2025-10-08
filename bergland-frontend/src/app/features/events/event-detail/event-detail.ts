import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { EventRegistrationService } from '../../../core/services/event-registration.service.js';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-detail.html',
  styleUrls: ['./event-detail.css']
})
export class EventDetail implements OnInit {
  event: any = null;
  loading = true;
  errorMessage = '';
  isRegistered = false;
  registrationForm!: FormGroup;

  private fb = inject(FormBuilder);
  private eventService = inject(EventService);
  private authService = inject(AuthService);
  private registrationService = inject(EventRegistrationService); // ✅ ersetzt alten Service
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'Event-ID fehlt!';
      this.loading = false;
      return;
    }

    this.loadEvent(id);
    this.initForm();
  }

  // 🔹 Event laden
  private loadEvent(id: string): void {
    this.eventService.getById(id).subscribe({
      next: (data) => {
        this.event = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Fehler beim Laden des Events:', err);
        this.errorMessage = '❌ Event konnte nicht geladen werden.';
        this.loading = false;
      }
    });
  }

  // 🔹 Formular initialisieren
  private initForm(): void {
    this.registrationForm = this.fb.group({
      phone_number: [''],
      license_plate: [''],
      participation_type: ['einzeln', Validators.required],
      catering_type: [''],
      wishes: [''],
      gender: ['m', Validators.required],
      club: [''],
      start_number: [''],
      liability_accept: [false, Validators.requiredTrue]
    });
  }

  // 🧭 Navigation-Buttons
  goBack(): void {
    this.router.navigate(['/events']); // oder /overview falls das deine Übersicht ist
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToBooking(): void {
    this.router.navigate(['/booking']);
  }

  // 📝 Registrierung absenden
  registerForEvent(): void {
    // Benutzer muss eingeloggt sein
    if (!this.authService.isLoggedIn()) {
      alert('Bitte logge dich zuerst ein, um dich anzumelden.');
      this.router.navigate(['/login']);
      return;
    }

    // Formular prüfen
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      alert('Bitte fülle alle Pflichtfelder aus.');
      return;
    }

    const userId = this.authService.getUserId();

    const registrationData = {
      ...this.registrationForm.value,
      event_id: this.event.id,
      person_id: userId,
      status: 'in_auswahl'
    };

    this.registrationService.createEventRegistration(registrationData).subscribe({
      next: () => {
        alert('✅ Erfolgreich für das Event angemeldet!');
        this.isRegistered = true;
      },
      error: (err: any) => {
        console.error('❌ Fehler bei Anmeldung:', err);
        alert(err.error?.message || 'Fehler bei der Anmeldung.');
      },
    });
    
  }
}
