import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard {
  sections = [
    { title: 'Benutzerverwaltung', route: '/admin/users', icon: 'fa-solid fa-users' },
    { title: 'Events verwalten', route: '/admin/events', icon: 'fa-solid fa-ticket' },
    { title: 'Unterkünfte', route: '/admin/accommodations', icon: 'fa-solid fa-hotel' },
    { title: 'Produkte verwalten', route: '/admin/products', icon: 'fa-solid fa-boxes-stacked' },
    { title: 'Rechnungen verwalten', route: '/admin/invoices', icon: 'fa-solid fa-file-invoice' },
    { title: 'Strecken verwalten', route: '/admin/routes', icon: 'fa-solid fa-route' }
  ];
}
