import { Component, OnInit } from "@angular/core";
import { HeaderComponent } from "../header/header.component";
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import { ReactiveFormsModule } from "@angular/forms";
import { VoiceService } from "../../services/voice.service";
import { NgForOf, NgIf, NgOptimizedImage } from "@angular/common";
import { UserService } from "../../services/user.service";
import { Room } from "../../models/room";
import { CookieService } from "ngx-cookie-service";
import { CallMemberComponent } from "./call-member/call-member.component";
import { UserConnection } from "../../models/user-connection.model";
import {ModalHandlerComponent} from "./modal-handler/modal-handler.component";
import {CallPanelComponent} from "./call-panel/call-panel.component";
import {CallMembersPanelComponent} from "./call-members-panel/call-members-panel.component";

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
        NgIf,
        CallMemberComponent,
        ModalHandlerComponent,
        CallPanelComponent,
        CallMembersPanelComponent
    ],
    styleUrls: ['./call.component.css']
})
export class CallComponent implements OnInit {
    rooms: Room[];
    users: UserConnection[];

    constructor(private voiceService: VoiceService, private userService: UserService, private cookieService: CookieService) {
        voiceService.usersObservable.subscribe(users => this.users = users);
        voiceService.roomsObservable.subscribe(rooms => this.rooms = rooms);
    }

    ngOnInit() {
        this.voiceService.requestRoomsData().then();
    }

    disconnect() {
        this.voiceService.closeAllVideoCalls();
    }
}
