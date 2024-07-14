import { Injectable } from '@angular/core';
import {HubConnection, HubConnectionBuilder} from "@microsoft/signalr";
import {CookieService} from "ngx-cookie-service";
import {AuthService} from "./auth.service";

@Injectable({
    providedIn: 'root',
})
export class HubService {
    constructor(private cookieService: CookieService, private authService: AuthService) {
    }

    public initializeHubConnection(hubName: string): HubConnection {
        let hubConnection: HubConnection;

        let authToken = this.cookieService.get('authToken');
        if (!authToken) {
            this.authService.logout();
            return null;
        }

        const buildConnection = () => {
            return new HubConnectionBuilder().withUrl("http://localhost:5284/" + hubName, {
                accessTokenFactory: () => authToken
            }).build();
        }

        const startConnection = async () => {
            try {
                await hubConnection.start();
            } catch (err) {
                if (err.message.includes('Unauthorized')) {
                    authToken = await this.handleTokenRenewal();
                    window.location.reload();
                } else {
                    console.error('Error while starting connection: ' + err);
                }
            }
        };

        hubConnection = buildConnection();
        startConnection().then();

        hubConnection.onclose(async () => {
            authToken = await this.handleTokenRenewal();
            hubConnection = buildConnection();
            startConnection().then();
        });

        return hubConnection;
    }


    async handleTokenRenewal(): Promise<string> {
        try {
            const data = await this.authService.renewToken().toPromise();
            this.cookieService.set('authToken', data.token);
            return data.token;
        } catch (error) {
            if (error.message.includes('Unauthorized')) {
                this.authService.logout();
            }
            
            throw error;
        }
    }

    public async waitForConnection(hubConnection: HubConnection) {
        while (hubConnection.state !== "Connected") {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
}