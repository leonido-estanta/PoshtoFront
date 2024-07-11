import {Injectable} from "@angular/core";
import {CookieService} from "ngx-cookie-service";
import {HubConnection, HubConnectionBuilder} from "@microsoft/signalr";
import {ServerUser} from "../models/userVoiceRoom";

@Injectable({
    providedIn: 'root',
})
export class UserService {
    public _hubConnection: HubConnection;

    serverUsers: ServerUser[] = [];
    
    constructor(private cookieService: CookieService) {
        this.requestRoomsData().then();
    }

    startConnection(): void {
        const authToken = this.cookieService.get('authToken');
        this._hubConnection = new HubConnectionBuilder().withUrl("http://localhost:5284/userHub", {
            accessTokenFactory: () => authToken
        }).build();
    }

    async requestRoomsData() {
        await this.waitForConnection();
        this._hubConnection.invoke("EnterServer", this.cookieService.get('userId')).then();
    }

    private async waitForConnection() {
        while (this._hubConnection?.state !== "Connected") {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
}