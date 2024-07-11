import {Injectable} from "@angular/core";
import {CookieService} from "ngx-cookie-service";
import {HubConnection, HubConnectionBuilder} from "@microsoft/signalr";
import {ServerUser, UserVoiceRoom} from "../models/userVoiceRoom";
import {UserConnection} from "../models/user-connection.model";
import {BehaviorSubject} from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class UserService {
    public _hubConnection: HubConnection;

    private usersSub = new BehaviorSubject<ServerUser[]>(undefined);
    public usersObservable = this.usersSub.asObservable();

    serverUsers: ServerUser[] = [];
    
    constructor(private cookieService: CookieService) {
        const authToken = this.cookieService.get('authToken');
        this._hubConnection = new HubConnectionBuilder().withUrl("http://localhost:5284/userHub", {
            accessTokenFactory: () => authToken
        }).build();

        this._hubConnection.start()
            .catch(err => console.error('Error while starting connection: ' + err));

        this._hubConnection.on('updateServerUsers', async (serverUsers: ServerUser[]) => {
            this.serverUsers = serverUsers;
            this.usersSub.next(serverUsers);
        });
        
        this.requestRoomsData().then();
    }

    async requestRoomsData() {
        await this.waitForConnection();
        this._hubConnection.invoke("EnterServer", this.cookieService.get('userId')).then();
    }

    private async waitForConnection() {
        while (this._hubConnection.state !== "Connected") {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
}