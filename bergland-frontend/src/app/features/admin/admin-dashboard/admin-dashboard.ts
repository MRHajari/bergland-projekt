import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard {
  sections = [
    { title: '👥 Benutzerverwaltung', route: '/admin/users' },
    { title: '🎫 Events verwalten', route: '/admin/events' },
    { title: '🏨 Unterkünfte verwalten', route: '/admin/accommodations' },
    { title: '🛍️ Produkte verwalten', route: '/admin/products' },
    { title: '🧾 Rechnungen verwalten', route: '/admin/invoices' },
  ];
}
