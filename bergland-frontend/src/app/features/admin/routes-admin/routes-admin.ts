import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouteService, Route } from '../../../core/services/route.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-routes-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './routes-admin.html',
  styleUrls: ['./routes-admin.css']
})
export class RoutesAdmin implements OnInit {

  routes: Route[] = [];
  editingRoute: Route | null = null;

  newRoute: Partial<Route> = {
    event_id: '',
    name: '',
    start_point: '',
    end_point: '',
    length_km: 0,
    elevation_m: 0,
    description: ''
  };

  searchTerm = '';
  loading = false;
  errorMessage: string | null = null;

  page = 1;
  pageSize = 10;

  constructor(
    private routeService: RouteService,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRoutes();
  }

  // =============================
  // LOAD
  // =============================
  loadRoutes(): void {
    this.loading = true;
    this.routeService.getAll().subscribe({
      next: data => {
        this.routes = data;
        console.log('Strecken geladen:', data);
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.errorMessage = 'Fehler beim Laden der Strecken';
        this.loading = false;
      }
    });
  }

  // =============================
  // CREATE
  // =============================
  addRoute(): void {
    if (!this.newRoute.name?.trim() || !this.newRoute.event_id?.trim()) {
      alert('Name und Event ID sind Pflichtfelder');
      return;
    }

    this.routeService.create(this.newRoute as Route).subscribe({
      next: () => {
        alert('Strecke erstellt');
        this.resetForm();
        this.loadRoutes();
      },
      error: err => {
        console.error(err);
        alert('Fehler beim Erstellen');
      }
    });
  }

  resetForm() {
    this.newRoute = {
      event_id: '',
      name: '',
      start_point: '',
      end_point: '',
      length_km: 0,
      elevation_m: 0,
      description: ''
    };
  }

  // =============================
  // EDIT
  // =============================
  editRoute(route: Route) {
    this.editingRoute = { ...route };
  }

  saveRoute() {
    if (!this.editingRoute) return;

    this.routeService.update(this.editingRoute.id, this.editingRoute)
      .subscribe({
        next: () => {
          this.editingRoute = null;
          this.loadRoutes();
        },
        error: err => {
          console.error(err);
          alert('Fehler beim Speichern');
        }
      });
  }

  cancelEdit() {
    this.editingRoute = null;
  }

  // =============================
  // DELETE
  // =============================
  deleteRoute(id: string, name: string) {
    if (!confirm(`Strecke "${name}" löschen?`)) return;

    this.routeService.delete(id).subscribe({
      next: () => this.loadRoutes(),
      error: err => {
        console.error(err);
        alert('Fehler beim Löschen');
      }
    });
  }

  // =============================
  // FILTER
  // =============================
  get filteredRoutes() {
    if (!this.searchTerm.trim()) return this.routes;
    const term = this.searchTerm.toLowerCase();
    return this.routes.filter(r =>
      r.name.toLowerCase().includes(term) ||
      r.event_id.toLowerCase().includes(term)
    );
  }

  // =============================
  // PAGINATION
  // =============================
  get pagedRoutes() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredRoutes.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredRoutes.length / this.pageSize);
  }

  goBack() {
    if (window.history.length > 1)
      this.location.back();
    else
      this.router.navigate(['/admin']);
  }
}
