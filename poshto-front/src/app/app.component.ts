import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterOutlet} from '@angular/router';
import { invoke } from "@tauri-apps/api/tauri";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  
  constructor(private router: Router) {
  }

  navigate() {
    this.router.navigate(['/auth']);
  }
}
