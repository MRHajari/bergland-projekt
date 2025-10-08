import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-users-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-admin.html',
  styleUrls: ['./users-admin.css']
})
export class UsersAdmin implements OnInit {
  users: any[] = [];
  loading = false;
  errorMessage: string | null = null;

  searchTerm = '';
  page = 1;
  pageSize = 20;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // 🔹 Benutzer laden
  loadUsers(): void {
    this.loading = true;
    this.errorMessage = null;

    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Fehler beim Laden der Benutzer:', err);
        this.errorMessage = '❌ Fehler beim Laden der Benutzer.';
        this.loading = false;
      }
    });
  }

  // 🔹 Filter nach Rolle
  get adminUsers() {
    return this.users.filter(u => u.role === 'admin' && this.matchesSearch(u));
  }

  get normalUsers() {
    return this.users.filter(u => u.role === 'user' && this.matchesSearch(u));
  }

  // 🔍 Suchlogik
  private matchesSearch(u: any): boolean {
    if (!this.searchTerm.trim()) return true;
    const term = this.searchTerm.toLowerCase();
    const name = `${u.person?.first_name ?? ''} ${u.person?.last_name ?? ''}`;
    return `${name} ${u.email}`.toLowerCase().includes(term);
  }

  // 🔹 Pagination
  get pagedNormalUsers() {
    const start = (this.page - 1) * this.pageSize;
    return this.normalUsers.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.normalUsers.length / this.pageSize);
  }

  // 🔹 Rolle speichern
  saveUser(user: any): void {
    this.userService.updateRole(user.id, user.role).subscribe({
      next: () => {
        alert(`✅ Rolle geändert für ${user.person?.first_name} (${user.email}) → ${user.role}`);
      },
      error: (err) => {
        console.error('Fehler beim Speichern:', err);
        alert('❌ Fehler beim Speichern der Rolle.');
      }
    });
  }

  // 🔹 Benutzer löschen
  deleteUser(id: string, email: string): void {
    if (!confirm(`Willst du den Benutzer "${email}" wirklich löschen?`)) return;

    this.userService.delete(id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== id);
        alert(`🗑️ Benutzer "${email}" gelöscht.`);
      },
      error: (err) => {
        console.error('Fehler beim Löschen:', err);
        alert('❌ Fehler beim Löschen des Benutzers.');
      }
    });
  }
}
