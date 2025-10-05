import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
  /** Optionaler Seitentitel (z. B. "Eventübersicht" oder "Mein Profil") */
  @Input() title = '';

  /** Optionaler Untertitel oder Beschreibung */
  @Input() subtitle = '';
}
