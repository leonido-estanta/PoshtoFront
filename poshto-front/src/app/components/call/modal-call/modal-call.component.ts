import { AfterViewInit, Component, OnInit } from "@angular/core";
import {NgForOf, NgIf} from "@angular/common";
import {UserConnection} from "../../../models/user-connection.model";
import {VoiceService} from "../../../services/voice.service";

@Component({
    selector: 'app-modal-call',
    templateUrl: './modal-call.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgForOf
    ],
    styleUrls: ['./modal-call.component.css']
})
export class ModalCallComponent implements OnInit, AfterViewInit {
    roomUserConnections: UserConnection[];

    constructor(private voiceService: VoiceService) {
        voiceService.usersObservable.subscribe(users => this.roomUserConnections = users);
    }
    
    get roomName() {
        return this.voiceService.currentRoomId;
    }

    ngOnInit() {}

    ngAfterViewInit() {
    }
}
