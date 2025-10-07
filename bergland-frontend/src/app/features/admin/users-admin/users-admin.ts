import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonService } from '../../../core/services/person.service';
import { LoginDataService } from '../../../core/services/login-data.service';

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

  // 🔍 Search and pagination
  searchTerm = '';
  page = 1;
  pageSize = 20;

  constructor(
    private personService: PersonService,
    private loginDataService: LoginDataService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // 🔹 Load all users
  loadUsers(): void {
    this.loading = true;
    this.errorMessage = null;

    this.personService.getAll().subscribe({
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

  // 🔹 Filtered users
  get adminUsers() {
    return this.users.filter(u =>
      u.role === 'admin' && this.matchesSearch(u)
    );
  }

  get normalUsers() {
    return this.users.filter(u =>
      u.role === 'user' && this.matchesSearch(u)
    );
  }

  // 🔍 Search logic
  private matchesSearch(u: any): boolean {
    if (!this.searchTerm.trim()) return true;
    const term = this.searchTerm.toLowerCase();
    return (
      (u.first_name + ' ' + u.last_name + ' ' + u.email)
        .toLowerCase()
        .includes(term)
    );
  }

  // 🔹 Pagination for normal users
  get pagedNormalUsers() {
    const start = (this.page - 1) * this.pageSize;
    return this.normalUsers.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.normalUsers.length / this.pageSize);
  }

  // 🔹 Save role changes
  saveUser(user: any): void {
    this.loginDataService.updateRole(user.id, user.role).subscribe({
      next: () => {
        alert(`✅ Rolle geändert für ${user.first_name} (${user.email}) → ${user.role}`);
      },
      error: (err) => {
        console.error('Fehler beim Speichern:', err);
        alert('❌ Fehler beim Speichern der Rolle.');
      }
    });
  }

  // 🔹 Delete user
  deleteUser(id: string, email: string): void {
    if (!confirm(`Willst du den Benutzer "${email}" wirklich löschen?`)) return;

    this.personService.delete(id).subscribe({
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
