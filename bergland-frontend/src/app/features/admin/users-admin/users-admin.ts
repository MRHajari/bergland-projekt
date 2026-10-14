import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-admin.html',
  styleUrls: ['../admin-shared.css']
})
export class UsersAdmin implements OnInit {
  users: any[] = [];
  loading = false;
  errorMessage: string | null = null;

  searchTerm = '';
  roleFilter = '';
  pendingRoles: Partial<Record<string, string>> = {};
  page = 1;
  pageSize = 20;

  constructor(
    private userService: UserService,
    private location: Location,
    private router: Router
  ) {}

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

  get filteredUsers() {
    return this.users.filter(user => (!this.roleFilter || user.role === this.roleFilter) && this.matchesSearch(user));
  }

  get pagedUsers() {
    const currentPage = Math.min(this.page, this.totalPages);
    return this.filteredUsers.slice((currentPage - 1) * this.pageSize, currentPage * this.pageSize);
  }

  // 🔍 Suchlogik
  private matchesSearch(u: any): boolean {
    if (!this.searchTerm.trim()) return true;
    const term = this.searchTerm.toLowerCase();
    const name = `${u.person?.first_name ?? ''} ${u.person?.last_name ?? ''}`;
    return `${name} ${u.email}`.toLowerCase().includes(term);
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.filteredUsers.length / this.pageSize));
  }

  // 🔹 Rolle speichern
  saveUser(user: any): void {
    const role = this.pendingRoles[user.id] ?? user.role;
    this.userService.updateRole(user.id, role).subscribe({
      next: () => {
        user.role = role;
        delete this.pendingRoles[user.id];
        this.page = Math.min(this.page, this.totalPages);
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
        this.page = Math.min(this.page, this.totalPages);
        alert(`🗑️ Benutzer "${email}" gelöscht.`);
      },
      error: (err) => {
        console.error('Fehler beim Löschen:', err);
        alert('❌ Fehler beim Löschen des Benutzers.');
      }
    });
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/admin']); // Fallback-Route
    }
  }
}
