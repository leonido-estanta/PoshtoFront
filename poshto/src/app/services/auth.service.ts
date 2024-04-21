import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private baseUrl = 'https://localhost:7219';

    constructor(private http: HttpClient) {}

    loginRequest(seed: string) {
        const url = `${this.baseUrl}/Auth/Login?seedPhrase=${seed}`;
        
        return this.http.post(url, {});
    }

    registerRequest(seed: string) {
        const url = `${this.baseUrl}/Auth/Register?seedPhrase=${seed}`;
        return this.http.post(url, {});
    }

    generateSeed() {
        const url = `${this.baseUrl}/Generator/Generate`;
        return this.http.get(url, { responseType: 'text' });
    }
}
