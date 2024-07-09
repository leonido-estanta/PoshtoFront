import {Component, OnInit} from '@angular/core';
import { FormsModule } from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {CookieService} from "ngx-cookie-service";
import {NgIf} from "@angular/common";

@Component({
    selector: 'app-auth',
    standalone: true,
    templateUrl: './auth.component.html',
    imports: [
        FormsModule,
        NgIf
    ],
    styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
    
    constructor(private authService: AuthService,
                private cookieService: CookieService) {
    }
    
    loginStatus: boolean = true;
    
    email: string;
    password: string;
    
    setLogin(status: boolean) {
        this.loginStatus = status;
    }
    
    login() {
        this.authService.loginRequest(this.email, this.password).subscribe(data => {
            this.cookieService.set('authToken', data['token']);
            this.cookieService.set('userId', data['user']['id']);
        });
    }
    
    register() {
        this.authService.registerRequest(this.email, this.password).subscribe(data => {
            this.cookieService.set('authToken', data['token']);
            this.cookieService.set('userId', data['user']['id']);
        });
    }

    ngOnInit() {
        
    }
}
