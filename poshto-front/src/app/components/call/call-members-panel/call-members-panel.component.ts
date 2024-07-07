import { Component } from "@angular/core";
import {CallMemberComponent} from "../call-member/call-member.component";
import {NgForOf} from "@angular/common";
import {VoiceService} from "../../../services/voice.service";
import {Room} from "../../../models/room";
import {UserConnection} from "../../../models/user-connection.model";

@Component({
    selector: 'app-call-members-panel',
    templateUrl: './call-members-panel.component.html',
    standalone: true,
    imports: [
        CallMemberComponent,
        NgForOf
    ],
    styleUrls: ['./call-members-panel.component.css']
})
export class CallMembersPanelComponent {
    userConnections: UserConnection[];
    
    constructor(private voiceService: VoiceService) {
        voiceService.usersObservable.subscribe(connections => this.userConnections = connections);
    }
    
}
