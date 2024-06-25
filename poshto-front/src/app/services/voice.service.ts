import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { CookieService } from "ngx-cookie-service";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";

@Injectable({
    providedIn: 'root',
})
export class VoiceService {
    private baseUrl = 'https://localhost:7219';
    public hubConnection: HubConnection;

    constructor(private http: HttpClient, private cookieService: CookieService) {
    }

    createAuthorizationHeader(headers: HttpHeaders) {
        return headers.append('Authorization', `Bearer ${this.cookieService.get('authToken')}`);
    }

    startConnection(): void {
        this.hubConnection = new HubConnectionBuilder()
            .withUrl('https://localhost:7219/voiceHub')
            .build();

        this.hubConnection.start()
            .catch(err => console.error('Error while starting connection: ' + err));
    }
}
