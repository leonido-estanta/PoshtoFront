import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {CookieService} from "ngx-cookie-service";
import {HubConnection, HubConnectionBuilder} from "@microsoft/signalr";

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

    getChannels() {
        let headers = new HttpHeaders();
        headers = this.createAuthorizationHeader(headers);
        
        const url = `${this.baseUrl}/VoiceChannel/List`;

        return this.http.get(url, {headers});
    }
    
    connectToChannel(channelId: number) {
        let headers = new HttpHeaders();
        headers = this.createAuthorizationHeader(headers);

        const url = `${this.baseUrl}/VoiceChannel/Connect/${channelId}`;

        return this.http.post(url, {}, {headers});
    }

    disconnectToChannel(channelId: number) {
        let headers = new HttpHeaders();
        headers = this.createAuthorizationHeader(headers);

        const url = `${this.baseUrl}/VoiceChannel/Disconnect/${channelId}`;

        return this.http.post(url, {}, {headers});
    }
    
    channelUsers(channelId: number) {
        let headers = new HttpHeaders();
        headers = this.createAuthorizationHeader(headers);

        const url = `${this.baseUrl}/VoiceChannel/ConnectedUsers/${channelId}`;

        return this.http.get(url, {headers});
    }

    startConnection(): void {
        this.hubConnection = new HubConnectionBuilder()
            .withUrl('https://localhost:7219/voiceHub')
            .build();

        this.hubConnection.start()
            .catch(err => console.error('Error while starting connection: ' + err));
    }

    sendAudio(audioBlob: Blob, channelId: string) {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(audioBlob);
        fileReader.onloadend = () => {
            const arrayBuffer = fileReader.result as ArrayBuffer;
            this.hubConnection.invoke('SendAudio', arrayBuffer, channelId)
                .catch(err => console.error('Error sending audio data:', err));
        };
    }

    receiveAudio(callback: (audioData: any) => void) {
        this.hubConnection.on('ReceiveAudio', (audioData: ArrayBuffer) => {
            const audioBlob = new Blob([audioData], { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            callback(audioUrl);
        });
    }

    sendVideo(videoData: ArrayBuffer, channelId: string) {
        this.hubConnection.invoke('SendVideo', videoData, channelId)
            .catch(err => console.error('Error sending video data:', err));
    }

    sendScreen(screenData: ArrayBuffer, channelId: string) {
        this.hubConnection.invoke('SendScreen', screenData, channelId)
            .catch(err => console.error('Error sending screen data:', err));
    }

    receiveVideo(callback: (videoData: any) => void) {
        this.hubConnection.on('ReceiveVideo', callback);
    }

    receiveScreen(callback: (screenData: any) => void) {
        this.hubConnection.on('ReceiveScreen', callback);
    }
}