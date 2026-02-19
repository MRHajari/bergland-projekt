import { Component, OnInit, inject } from '@angular/core';
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

  showRouteModal = false;
eventRoutesMap: Record<string, boolean> = {};
selectedRouteEventId: string | null = null;


  private location = inject(Location);
  private router= inject(Router);
  private routeService = inject(RouteService);

  ngOnInit(): void {
    this.loadRoutes();
  }

  loadRoutes(): void {
    this.loading = true;
    this.routeService.getAll().subscribe({
      next: data => {
        console.log('Strecken geladen:', data);
        this.routes = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Fehler beim Laden der Strecken';
        this.loading = false;
      }
    });
  }

  addRoute(): void {
    if (!this.newRoute.name?.trim()) {
      alert('Name ist Pflichtfeld');
      return;
    }

    this.routeService.create(this.newRoute as Route).subscribe({
      next: () => {
        this.resetForm();
        this.loadRoutes();
      },
      error: () => alert('Fehler beim Erstellen')
    });
  }

  resetForm() {
    this.newRoute = {
      name: '',
      start_point: '',
      end_point: '',
      length_km: 0,
      elevation_m: 0,
      description: ''
    };
  }

  editRoute(route: Route) {
    this.editingRoute = { ...route };
  }

  saveRoute() {
    if (!this.editingRoute) return;

    this.routeService.update(this.editingRoute.id, this.editingRoute)
      .subscribe(() => {
        this.editingRoute = null;
        this.loadRoutes();
      });
  }

  cancelEdit() {
    this.editingRoute = null;
  }

  deleteRoute(id: string, name: string) {
    if (!confirm(`Strecke "${name}" löschen?`)) return;

    this.routeService.delete(id)
      .subscribe(() => this.loadRoutes());
  }

  get filteredRoutes() {
    if (!this.searchTerm.trim()) return this.routes;
    const term = this.searchTerm.toLowerCase();
    return this.routes.filter(r =>
      r.name.toLowerCase().includes(term)
    );
  }

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