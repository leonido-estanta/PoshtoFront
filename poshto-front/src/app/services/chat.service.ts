import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {HubConnection} from "@microsoft/signalr";
import {HubService} from "./hub.service";
import {AuthService} from "./auth.service";
import {CookieService} from "ngx-cookie-service";

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    constructor(private http: HttpClient, private authService: AuthService, private hubService: HubService, private cookieService: CookieService) {}
    
    private baseUrl = 'http://localhost:5284';
    public hubConnection: HubConnection;

    getMessages(messagesCount, pageSize) {
        let headers = new HttpHeaders();
        headers = this.authService.createAuthorizationHeader(headers);
        
        return this.http.get(`${this.baseUrl}/Chat/Get?skip=${messagesCount}&take=${pageSize}`, { headers });
    }

    startConnection(): void {
        this.hubConnection = this.hubService.initializeHubConnection('chatHub');
    }

    async sendMessage(message: string) {
        await this.hubConnection.invoke("AddMessage", this.cookieService.get('userId'), message);
    }
}