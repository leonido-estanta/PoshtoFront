import {Component, OnInit} from "@angular/core";
import {HeaderComponent} from "../header/header.component";
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {ReactiveFormsModule} from "@angular/forms";
import {VoiceService} from "../../services/voice.service";
import {NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {UserService} from "../../services/user.service";
import {ChannelModel} from "../../models/channel.model";
import {UserModel} from "../../models/user.model";

@Component({
    selector: 'app-call',
    standalone: true,
    templateUrl: './call.component.html',
    imports: [
        HeaderComponent,
        CdkFixedSizeVirtualScroll,
        CdkVirtualForOf,
        CdkVirtualScrollViewport,
        ReactiveFormsModule,
        NgForOf,
        NgOptimizedImage,
        NgIf
    ],
    styleUrls: ['./call.component.css']
})
export class CallComponent implements OnInit {
    channels: ChannelModel[];
    connectedChannel: ChannelModel;

    private mediaRecorder: MediaRecorder;
    private audioChunks = [];
    
    constructor(private voiceService: VoiceService, private userService: UserService) {
    }
    ngOnInit() {
        this.voiceService.startConnection();
        
        this.voiceService.getChannels().subscribe((data: []) => {
           this.channels = data;
        });
        
        this.voiceService.hubConnection.on('VoiceConnect', (data) => {
            if (this.connectedChannel && this.connectedChannel.id == data['channelId']) {
                this.userService.getUser(data['userId']).subscribe((user: UserModel) => {
                    this.connectedChannel.connectedUsers.push(user);
                });
            }
        });

        this.voiceService.hubConnection.on('VoiceDisconnect', (data) => {
            if (this.connectedChannel && this.connectedChannel.id == data['channelId']) {
                this.connectedChannel.connectedUsers = this.connectedChannel.connectedUsers.filter(w => w.id != data['userId']);
            }
        });
    }

    connect(channel: any) {
        this.voiceService.connectToChannel(channel['id']).subscribe(_ => {
            this.connectedChannel = channel;
            this.connectedChannel.connectedUsers = [];
            this.voiceService.channelUsers(channel['id']).subscribe((data: []) => {
                data.forEach(el => {
                    this.userService.getUser(el).subscribe((user: UserModel) => {
                        this.connectedChannel.connectedUsers.push(user);
                    });
                });
            });

            this.voiceService.receiveAudio((audioUrl: string) => {
                this.playReceivedAudio(audioUrl);
            });
            this.startAudioCapture();
        });
    }

    disconnect(channel: any) {
        this.voiceService.disconnectToChannel(channel['id']).subscribe(_ => {
            this.connectedChannel = null;
            this.stopAudioCapture();
        });
    }

    startAudioCapture() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                this.mediaRecorder = new MediaRecorder(stream);
                this.mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        this.audioChunks.push(event.data);
                    }
                };
                this.mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                    this.voiceService.sendAudio(audioBlob, this.connectedChannel.id.toString());
                    this.audioChunks = [];
                };
                this.mediaRecorder.start();
            })
            .catch(error => console.error('Error capturing audio:', error));
    }

    stopAudioCapture() {
        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
        }
    }

    playReceivedAudio(audioUrl: string) {
        const audioPlayer: HTMLAudioElement = document.querySelector('#audioPlayer');
        audioPlayer.src = audioUrl;
        audioPlayer.play().catch(err => console.error('Error playing received audio:', err));
    }
}