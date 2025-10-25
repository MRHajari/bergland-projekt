import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/api.service';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  user: any = null; // enthält user + person
  loading = false;
  editing = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.loadProfile();
  }

  // =====================================================
  // 📦 Profil laden
  // =====================================================
  async loadProfile(): Promise<void> {
    const token = this.auth.getAccessToken();
    if (!token) return;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.user?.id;

    if (!userId) {
      this.errorMessage = 'Benutzerdaten konnten nicht geladen werden.';
      return;
    }

    this.loading = true;
    this.api.get(`users/${userId}`).subscribe({
      next: (res) => {
        this.user = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Fehler beim Laden des Profils:', err);
        this.errorMessage = '❌ Fehler beim Laden des Profils.';
        this.loading = false;
      },
    });
  }

  // =====================================================
  // ✏️ Bearbeitungsmodus umschalten
  // =====================================================
  toggleEdit(): void {
    this.editing = !this.editing;
    this.successMessage = '';
    this.errorMessage = '';
  }

  // =====================================================
  // 💾 Änderungen speichern
  // =====================================================
  async saveProfile(): Promise<void> {
    if (!this.user || !this.user.person) return;

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const personPayload = {
      first_name: this.user.person.first_name,
      last_name: this.user.person.last_name,
      birth_date: this.user.person.birth_date,
      phone: this.user.person.phone,
      street: this.user.person.street,
      postal_code: this.user.person.postal_code,
      city: this.user.person.city,
      country: this.user.person.country,
    };

    const userPayload = {
      email: this.user.email, // 🔥 hinzufügen
      role: this.user.role, // Nur falls erlaubt / relevant
    };

    try {
      // 1️⃣ Person aktualisieren
      await new Promise<void>((resolve, reject) => {
        this.api.put('persons', this.user.person.id, personPayload).subscribe({
          next: () => resolve(),
          error: (err) => reject(err),
        });
      });

      // 2️⃣ (Optional) User aktualisieren
      await new Promise<void>((resolve, reject) => {
        this.api.put('users', this.user.id, userPayload).subscribe({
          next: () => resolve(),
          error: (err) => reject(err),
        });
      });

      // 3️⃣ Profil neu laden
      await this.loadProfile();

      this.successMessage = '✅ Profil erfolgreich aktualisiert.';
      this.editing = false;
    } catch (err) {
      console.error('❌ Fehler beim Speichern:', err);
      this.errorMessage = '❌ Änderungen konnten nicht gespeichert werden.';
    } finally {
      this.loading = false;
    }
  }
}
