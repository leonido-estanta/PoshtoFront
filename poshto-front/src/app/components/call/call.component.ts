import {Component, OnInit} from "@angular/core";
import {HeaderComponent} from "../header/header.component";
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {ReactiveFormsModule} from "@angular/forms";
import {VoiceService} from "../../services/voice.service";
import {NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {UserService} from "../../services/user.service";
import {Room} from "../../models/room";
import {CookieService} from "ngx-cookie-service";
import {CallMemberComponent} from "./call-member/call-member.component";
import {UserConnection} from "../../models/user-connection.model";
import {User} from "../../models/user";

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
        CallMemberComponent
    ],
    styleUrls: ['./call.component.css']
})
export class CallComponent implements OnInit {
    rooms: Room[];
    users: UserConnection[];

    constructor(private voiceService: VoiceService, private userService: UserService, private cookieService: CookieService) {
        voiceService.usersObservable
            .subscribe(users => {
                this.users = users;
            });

        voiceService.roomsObservable
            .subscribe(rooms => {
                this.rooms = rooms;
            })
    }
    ngOnInit() {
        this.voiceService.requestRoomsData().then();
    }

    connect(room: Room) {
        console.log(this.cookieService.get('userId'))
        this.voiceService.joinRoom(this.cookieService.get('userId'), room.id).then();
    }

    disconnect(room: any) {
        
    }
}