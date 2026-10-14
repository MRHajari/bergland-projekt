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
  readonly groups = [
    {
      id: 'people-events',
      title: 'Personen & Veranstaltungen',
      links: [
        { title: 'Benutzerverwaltung', route: '/admin/users', icon: 'fa-solid fa-users' },
        { title: 'Veranstaltungen', route: '/admin/events', icon: 'fa-solid fa-ticket' },
        { title: 'Strecken', route: '/admin/routes', icon: 'fa-solid fa-route' }
      ]
    },
    {
      id: 'accommodation',
      title: 'Unterbringung',
      links: [
        { title: 'Unterkünfte', route: '/admin/accommodations', icon: 'fa-solid fa-hotel' }
      ]
    },
    {
      id: 'billing',
      title: 'Produkte & Abrechnung',
      links: [
        { title: 'Produkte', route: '/admin/products', icon: 'fa-solid fa-boxes-stacked' },
        { title: 'Rechnungen', route: '/admin/invoices', icon: 'fa-solid fa-file-invoice' }
      ]
    }
  ];
}
