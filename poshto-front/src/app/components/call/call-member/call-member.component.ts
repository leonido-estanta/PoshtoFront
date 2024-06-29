import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from "@angular/core";
import {UserConnection} from "../../../models/user-connection.model";

@Component({
    selector: 'app-call-member',
    templateUrl: './call-member.component.html',
    standalone: true,
    styleUrls: ['./call-member.component.css']
})
export class CallMemberComponent implements OnInit, AfterViewInit {
    @Input()
    user: UserConnection;

    theVideo: HTMLVideoElement;
    @ViewChild('theVideo', {static: false}) videoElement: ElementRef;

    constructor() {}

    ngOnInit() {}

    ngAfterViewInit() {
        this.theVideo = this.videoElement.nativeElement;
        this.user.streamObservable.subscribe(stream => {
            if (stream) {
                if (this.user.isCurrentUser) {
                    this.theVideo.srcObject = stream;
                    this.theVideo.defaultMuted = true;
                    this.theVideo.volume = 0;
                    this.theVideo.muted = true;
                } else {
                    this.theVideo.srcObject = stream;
                }
            }
            else {
                console.log('No stream');
            }
        });
    }
}