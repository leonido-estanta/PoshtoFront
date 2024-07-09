import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    standalone: true,
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
    
    constructor(private router: Router) {
    }
    ngOnInit() {
    }

    togglePanel() {
        const panel = document.getElementById('sidePanel');
        panel.classList.toggle('active');
    }

    isActive(route: string): boolean {
        return this.router.url.includes(route);
    }

    navigate(route: string) {
        this.router.navigate([route]);
    }
}