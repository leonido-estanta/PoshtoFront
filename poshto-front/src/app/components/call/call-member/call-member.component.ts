import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { UserConnection } from "../../../models/user-connection.model";
import {NgIf} from "@angular/common";

@Component({
    selector: 'app-call-member',
    templateUrl: './call-member.component.html',
    standalone: true,
    imports: [
        NgIf
    ],
    styleUrls: ['./call-member.component.css']
})
export class CallMemberComponent implements OnInit, AfterViewInit {
    @Input() user: UserConnection;
    theVideo: HTMLVideoElement;
    @ViewChild('theVideo', { static: false }) videoElement: ElementRef;

    constructor() {}

    ngOnInit() {}

    ngAfterViewInit() {
        this.theVideo = this.videoElement.nativeElement;
        this.user.streamObservable.subscribe(stream => {
            if (stream) {
                this.theVideo.srcObject = stream;
                if (this.user.isCurrentUser) {
                    this.theVideo.defaultMuted = true;
                    this.theVideo.volume = 0;
                    this.theVideo.muted = true;
                }
            } else {
                console.log('No stream');
            }
        });
    }
}
