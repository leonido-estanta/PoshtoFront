import {Component, OnInit} from "@angular/core";
import {HeaderComponent} from "../header/header.component";
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {ReactiveFormsModule} from "@angular/forms";
import {VoiceService} from "../../services/voice.service";
import {NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {UserService} from "../../services/user.service";
import {RoomModel} from "../../models/room.model";

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
    rooms: RoomModel[];

    constructor(private voiceService: VoiceService, private userService: UserService) {
    }
    ngOnInit() {
    }

    connect(room: any) {
        
    }

    disconnect(room: any) {
        
    }
}