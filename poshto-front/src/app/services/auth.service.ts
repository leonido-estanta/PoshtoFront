import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {CookieService} from "ngx-cookie-service";
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient, private cookieService: CookieService) {}

    loginRequest(email: string, password: string) {
        const url = `${this.baseUrl}/Auth/Login`;
        let model = {
            email: email,
            password: password
        }

        return this.http.post(url, model);
    }

    renewToken(): Observable<any> {
        const token = this.cookieService.get('authToken');
        return this.http.post(`${this.baseUrl}/Auth/RenewToken`, { token });
    }

    registerRequest(email: string, password: string) {
        const url = `${this.baseUrl}/Auth/Register`;
        let model = {
            email: email,
            password: password
        }
        
        return this.http.post(url, model);
    }

    logout() {
        this.cookieService.delete('authToken');
        this.cookieService.delete('userId');

        window.location.href = '/auth';
    }

    createAuthorizationHeader(headers: HttpHeaders) {
        return headers.append('Authorization', `Bearer ${this.cookieService.get('authToken')}`);
    }
}
