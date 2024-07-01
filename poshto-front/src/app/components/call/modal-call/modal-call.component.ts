import { AfterViewInit, Component, OnInit } from "@angular/core";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {UserConnection} from "../../../models/user-connection.model";
import {VoiceService} from "../../../services/voice.service";

@Component({
    selector: 'app-modal-call',
    templateUrl: './modal-call.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgForOf,
        NgClass
    ],
    styleUrls: ['./modal-call.component.css']
})
export class ModalCallComponent implements OnInit, AfterViewInit {
    roomUserConnections: UserConnection[];
    isMuted: boolean = false;
    isVideoEnabled: boolean = false;
    isScreenEnabled: boolean = false;

    constructor(private voiceService: VoiceService) {
        voiceService.usersObservable.subscribe(users => this.roomUserConnections = users);
    }

    get roomName() {
        return this.voiceService.currentRoomId;
    }

    ngOnInit() {}

    ngAfterViewInit() {
    }

    disconnect() {
        this.voiceService.closeAllVideoCalls();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.voiceService.toggleMute().then();
    }
    
    toggleVideo() {
        this.isVideoEnabled = !this.isVideoEnabled;
        this.voiceService.toggleVideo().then();
    }
    
    toggleScreenShare() {
        this.isScreenEnabled = !this.isScreenEnabled;
        this.voiceService.toggleScreenShare().then();
    }
}
