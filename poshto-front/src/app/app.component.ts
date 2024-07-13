import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import { HeaderComponent } from "./components/header/header.component";
import {ModalHandlerComponent} from "./components/call/modal-handler/modal-handler.component";

@Component({
  selector: 'app-root',
  standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        HeaderComponent,
        ModalHandlerComponent
    ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    isRouterInitialized = false;

    constructor(private router: Router) { }

    ngOnInit() {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.isRouterInitialized = true;
            }
        });
    }

    get displayModalHandler(): boolean {
        return this.router.url !== '/auth' && this.isRouterInitialized;
    }
}
