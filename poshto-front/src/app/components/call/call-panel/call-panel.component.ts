import { Component } from "@angular/core";
import {NgForOf} from "@angular/common";
import {VoiceService} from "../../../services/voice.service";
import {Room} from "../../../models/room";
import {UserConnection} from "../../../models/user-connection.model";
import {CookieService} from "ngx-cookie-service";

@Component({
    selector: 'app-call-panel',
    templateUrl: './call-panel.component.html',
    standalone: true,
    imports: [
        NgForOf
    ],
    styleUrls: ['./call-panel.component.css']
})
export class CallPanelComponent {
    rooms: Room[];
    users: UserConnection[];
    
    constructor(private voiceService: VoiceService, private cookieService: CookieService) {
        voiceService.usersObservable.subscribe(users => this.users = users);
        voiceService.roomsObservable.subscribe(rooms => this.rooms = rooms);
    }
    
    getRoomUsers(room: Room) {
        return this.users.filter(w => w.currentRoomId == room.id.toString());
    }

    getInitials(str: string): string {
        return str.substring(0, 2);
    }

    connect(room: Room) {
        const userId = this.cookieService.get('userId');
        this.voiceService.joinRoom(userId, room.id.toString()).then();
    }
}
