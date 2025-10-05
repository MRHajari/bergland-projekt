import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { Header } from '../header/header';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Navbar, Header],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css']
})
export class MainLayout {
  // Optional: Titel-Logik (später dynamisch, z. B. je nach Route)
  pageTitle = 'Willkommen im Bergland Portal';
  pageSubtitle = 'Finde Events, buche Unterkünfte und verwalte deine Anmeldungen.';
}
