import {UserVoiceRoom} from "./userVoiceRoom";
import {BehaviorSubject, Observable} from "rxjs";

export class UserConnection {
    user: UserVoiceRoom;
    currentRoomId: string;
    isCurrentUser: boolean;
    rtcConnection: RTCPeerConnection;
    streamSub: BehaviorSubject<MediaStream>;
    streamObservable: Observable<MediaStream>;
    creatingOffer = false;
    creatingAnswer = false;
    
    micEnabled = true;
    cameraEnabled = false;
    screenShareEnabled = false;

    constructor(user: UserVoiceRoom, isCurrentUser: boolean, rtcConnection: RTCPeerConnection, currentRoomId: string) {
        this.user = user;
        this.isCurrentUser = isCurrentUser;
        this.rtcConnection = rtcConnection;
        this.currentRoomId = currentRoomId;
        this.streamSub = new BehaviorSubject<MediaStream>(undefined);
        this.streamObservable = this.streamSub.asObservable();
    }

    setStream(stream: MediaStream) {
        this.streamSub.next(stream);
    }

    end() {
        if (this.rtcConnection) {
            this.rtcConnection.close();
        }
        if (this.streamSub.getValue()) {
            this.setStream(undefined);
        }
    }
}