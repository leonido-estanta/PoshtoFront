import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
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
export class AppComponent {}
