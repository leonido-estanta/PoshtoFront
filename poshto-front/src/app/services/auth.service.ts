import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private baseUrl = 'http://localhost:5284';

    constructor(private http: HttpClient) {}

    loginRequest(email: string, password: string) {
        const url = `${this.baseUrl}/Auth/Login`;
        let model = {
            email: email,
            password: password
        }
        
        return this.http.post(url, model);
    }

    registerRequest(email: string, password: string) {
        const url = `${this.baseUrl}/Auth/Register`;
        let model = {
            email: email,
            password: password
        }
        
        return this.http.post(url, model);
    }

    generateSeed() {
        const url = `${this.baseUrl}/Generator/Generate`;
        return this.http.get(url, { responseType: 'text' });
    }
}
