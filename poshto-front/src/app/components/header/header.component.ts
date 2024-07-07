import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    standalone: true,
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
    
    constructor() {
    }
    ngOnInit() {
    }

    togglePanel() {
        const panel = document.getElementById('sidePanel');
        panel.classList.toggle('active');
    }
}