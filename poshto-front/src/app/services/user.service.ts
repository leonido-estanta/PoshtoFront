import {Injectable} from "@angular/core";
import {CookieService} from "ngx-cookie-service";
import {HubConnection} from "@microsoft/signalr";
import {ServerUser} from "../models/userVoiceRoom";
import {BehaviorSubject} from "rxjs";
import {HubService} from "./hub.service";

@Injectable({
    providedIn: 'root',
})
export class UserService {
    public _hubConnection: HubConnection;

    private usersSub = new BehaviorSubject<ServerUser[]>(undefined);
    public usersObservable = this.usersSub.asObservable();

    serverUsers: ServerUser[] = [];
    
    constructor(private cookieService: CookieService, private hubService: HubService) {
        this.initializeHubConnection();
    }

    initializeHubConnection() {
        this._hubConnection = this.hubService.initializeHubConnection('userHub');

        this._hubConnection.on('updateServerUsers', async (serverUsers: ServerUser[]) => {
            this.serverUsers = serverUsers;
            this.usersSub.next(serverUsers);
        });

        this.requestRoomsData().then();
    }

    async requestRoomsData() {
        await this.hubService.waitForConnection(this._hubConnection);
        this._hubConnection.invoke("EnterServer", this.cookieService.get('userId')).then();
    }
}