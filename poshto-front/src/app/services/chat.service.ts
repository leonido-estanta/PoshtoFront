import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {CookieService} from "ngx-cookie-service";
import {HubConnection, HubConnectionBuilder} from "@microsoft/signalr";

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    constructor(private http: HttpClient, private cookieService: CookieService) {}
    
    private baseUrl = 'http://localhost:5284';
    public hubConnection: HubConnection;

    getMessages(messagesCount, pageSize) {
        let headers = new HttpHeaders();
        headers = this.createAuthorizationHeader(headers);
        
        return this.http.get(`${this.baseUrl}/Chat/Get?skip=${messagesCount}&take=${pageSize}`, { headers });
    }

    createAuthorizationHeader(headers: HttpHeaders) {
        return headers.append('Authorization', `Bearer ${this.cookieService.get('authToken')}`);
    }

    startConnection(): void {
        this.hubConnection = new HubConnectionBuilder()
            .withUrl('http://localhost:5284/chatHub')
            .build();

        this.hubConnection.start()
            .catch(err => console.error('Error while starting connection: ' + err));
    }
    
    sendMessage(message: string) {
        let headers = new HttpHeaders();
        headers = this.createAuthorizationHeader(headers);
        
        let body = {
            text: message
        };

        return this.http.post(`${this.baseUrl}/Chat/Add`, body,{ headers });
    }
}