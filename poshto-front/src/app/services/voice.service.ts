import { Injectable } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { BehaviorSubject } from "rxjs";
import { UserConnection } from "../models/user-connection.model";
import { User } from "../models/user";
import { ISignal } from "../models/ISignal";
import { SignalType } from "../models/SignalType";
import { Room } from "../models/room";

@Injectable({
    providedIn: "root",
})
export class VoiceService {
    users: UserConnection[];
    private _hubConnection: HubConnection;
    private _connections: { [index: string]: UserConnection } = {};
    private connSub = new BehaviorSubject<boolean>(false);
    private usersSub = new BehaviorSubject<UserConnection[]>(undefined);
    private roomsSub = new BehaviorSubject<Room[]>(undefined);
    public usersObservable = this.usersSub.asObservable();
    public roomsObservable = this.roomsSub.asObservable();
    public currentConnectionId: string;
    public currentRoomId: string;
    public currentMediaStream: MediaStream;
    public currentIceServers: RTCIceServer[];
    public connected = false;

    constructor() {
        this.usersObservable.subscribe(users => this.users = users);

        this._hubConnection = new HubConnectionBuilder().withUrl("http://localhost:5284/voiceHub").build();

        this._initializeConnection().then();

        this._hubConnection.onclose((err) => {
            console.error(err);
            this.connected = false;
            this.reset();
        });

        this._hubConnection.on("callToUserList", async (roomId: string, users: User[]) => {
            if (this.currentRoomId == roomId) {
                await this._handleUserList(roomId, users);
            }
        });

        this._hubConnection.on("updateUserList", async (roomId: string, users: User[]) => {
            if (this.currentRoomId == roomId) {
                await this._updateUserList(users, roomId);
            }
        });

        this._hubConnection.on("updateRoomsData", async (rooms: Room[]) => {
            this.roomsSub.next(rooms?.map(s => s['voiceRoom'])); //TODO: Refactor
        });

        this._hubConnection.on('receiveSignal', async (user: User, signal: string) => {
            await this._handleNewSignal(user, signal);
        });
    }

    private async _initializeConnection() {
        try {
            await this._hubConnection.start();
            this.currentConnectionId = await this._hubConnection.invoke("GetConnectionId");
            this.connected = true;
            this.closeAllVideoCalls();
            this.connSub.next(true);
        } catch (error) {
            console.error(error);
        }
    }

    private async waitForConnection() {
        while (this._hubConnection.state !== "Connected") {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    async requestRoomsData() {
        await this.waitForConnection();
        return this._hubConnection.invoke("SendRoomsData", true);
    }

    private async _updateUserList(users: User[], roomId: string): Promise<void> {
        const iceServers = await this.getIceServers();
        for (const user of users) {
            const connection = await this.getConnection(user.connectionId, iceServers, false);
            if (connection.user.id !== user.id) {
                connection.user.id = user.id;
            }
            if (connection.isCurrentUser && !connection.streamSub.getValue()) {
                this.currentMediaStream = await this.getUserMediaInternal();
                connection.streamSub.next(this.currentMediaStream);
            }
            
            connection.currentRoomId = roomId;
        }
        this.usersSub.next(Object.values(this._connections));
    }

    private async _handleUserList(roomId: string, users: User[]) {
        users.forEach(user => {
            if (!this._connections[user.connectionId] && user.connectionId !== this.currentConnectionId) {
                this.initiateOffer(user);
            }
        });
        await this._updateUserList(users, roomId);
    }

    private async initiateOffer(acceptingUser: User) {
        const partnerClientId = acceptingUser.connectionId;

        if (this._connections[partnerClientId]) return;

        const iceServers = await this.getIceServers();
        await this.getConnection(partnerClientId, iceServers, true);
    }

    private async getConnection(partnerClientId: string, iceServers: RTCIceServer[], createOffer: boolean): Promise<UserConnection> {
        const connection = this._connections[partnerClientId] || (await this._createConnection(partnerClientId, iceServers, createOffer));
        return connection;
    }

    private async _createConnection(partnerClientId: string, iceServers: RTCIceServer[], createOffer: boolean): Promise<UserConnection> {
        if (this._connections[partnerClientId]) this.closeVideoCall(partnerClientId);

        const connection = new RTCPeerConnection({ iceServers });
        const userConnection = new UserConnection({ id: "", connectionId: partnerClientId }, false, connection, null);

        this._connections[partnerClientId] = userConnection;

        const localStream = await this.getUserMediaInternal();
        localStream.getTracks().forEach(track => connection.addTrack(track, localStream));

        this._setupConnectionEvents(connection, partnerClientId, userConnection);

        if (createOffer) await this._createOffer(connection, partnerClientId);

        return userConnection;
    }

    private _setupConnectionEvents(connection: RTCPeerConnection, partnerClientId: string, userConnection: UserConnection) {
        connection.oniceconnectionstatechange = () => {
            if (["closed", "failed", "disconnected"].includes(connection.iceConnectionState)) {
                this.closeAllVideoCalls();
            }
        };

        connection.onsignalingstatechange = () => {
            if (connection.signalingState === "closed") {
                this.closeAllVideoCalls();
            }
        };

        connection.onicecandidate = async (event) => {
            if (event.candidate) {
                await this.sendSignal({ type: SignalType.newIceCandidate, candidate: event.candidate }, partnerClientId);
            }
        };

        connection.ontrack = (event) => {
            userConnection.setStream(event.streams[0]);
        };
    }

    private async _createOffer(connection: RTCPeerConnection, partnerClientId: string) {
        try {
            const desc = await connection.createOffer();
            await connection.setLocalDescription(desc);
            await this.sendSignal({ type: SignalType.videoOffer, sdp: connection.localDescription }, partnerClientId);
        } catch (error) {
            console.error("Error in createOffer:", error);
        }
    }

    private async sendSignal(message: ISignal, partnerClientId: string) {
        await this.waitForConnection();
        await this._hubConnection.invoke("SendSignal", JSON.stringify(message), partnerClientId);
    }

    private async getUserMediaInternal(): Promise<MediaStream> {
        if (this.currentMediaStream) return this.currentMediaStream;

        try {
            return await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (error) {
            console.error("Failed to get hardware access", error);
        }
    }

    private async getIceServers(): Promise<RTCIceServer[]> {
        if (this.currentIceServers) return this.currentIceServers;

        try {
            await this.waitForConnection();
            return await this._hubConnection.invoke("GetIceServers");
        } catch (error) {
            console.error("GetIceServers error:", error);
        }
    }

    private reset() {
        this.connected = false;
        this.connSub.next(false);
        this.usersSub.next(undefined);
    }

    async joinRoom(userId: string, roomId: string) {
        await this.waitForConnection();
        if (!this.connected) {
            this.reset();
            return;
        }

        this.closeAllVideoCalls();

        this._connections[this.currentConnectionId] = new UserConnection({ id: userId, connectionId: this.currentConnectionId }, true, undefined, roomId);
        this.currentRoomId = roomId;
        await this._hubConnection.invoke("JoinVoiceRoom", userId, roomId);
    }

    async toggleMute() {
        if (!this.currentMediaStream) return;
        this.currentMediaStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    }

    async toggleVideo() {
        if (!this.currentMediaStream) return;

        const videoTrack = this.currentMediaStream.getVideoTracks()[0];
        if (videoTrack) {
            if (videoTrack.enabled) {
                videoTrack.stop();
                this.currentMediaStream.removeTrack(videoTrack);
            } else {
                try {
                    const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    const newVideoTrack = newStream.getVideoTracks()[0];
                    this.currentMediaStream.addTrack(newVideoTrack);
                    this._updateConnectionsStream();
                } catch (error) {
                    console.error('Error re-enabling video:', error);
                }
            }
        } else {
            try {
                const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
                const newVideoTrack = newStream.getVideoTracks()[0];
                this.currentMediaStream.addTrack(newVideoTrack);
                this._updateConnectionsStream();
            } catch (error) {
                console.error('Error enabling video:', error);
            }
        }
    }

    async toggleScreenShare() {
        if (!this.currentMediaStream) return;
        const videoTrack = this.currentMediaStream.getVideoTracks()[0];
        if (videoTrack.kind === 'video') {
            videoTrack.stop();
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: { frameRate: { ideal: 120 } }
                });
                const screenTrack = screenStream.getVideoTracks()[0];
                screenTrack.onended = () => {
                    this.currentMediaStream.removeTrack(screenTrack);
                    this.currentMediaStream.addTrack(videoTrack);
                    this._updateConnectionsStream();
                };
                this.currentMediaStream.removeTrack(videoTrack);
                this.currentMediaStream.addTrack(screenTrack);
                this._updateConnectionsStream();
            } catch (error) {
                console.error('Error sharing screen:', error);
                this.currentMediaStream.addTrack(videoTrack);
            }
        }
    }

    private _updateConnectionsStream() {
        Object.values(this._connections).forEach(connection => {
            const sender = connection.rtcConnection.getSenders().find(s => s.track.kind === 'video');
            if (sender) {
                const newTrack = this.currentMediaStream.getVideoTracks()[0];
                sender.replaceTrack(newTrack).then(r => {});
            }
        });
    }

    public closeAllVideoCalls() {
        if (this.currentMediaStream) {
            this.currentMediaStream.getTracks().forEach(track => track.stop());
            this.currentMediaStream = null;
        }
        
        Object.keys(this._connections).forEach(key => this.closeVideoCall(key));
        this._connections = {};
        this.currentRoomId = null;
        this.usersSub.next(Object.values(this._connections));
    }

    private closeVideoCall(partnerClientId: string) {
        const connection = this._connections[partnerClientId];
        if (connection) {
            connection.end();
            delete this._connections[partnerClientId];
        }
    }

    private async _handleNewSignal(user: User, data: string) {
        const partnerClientId = user.connectionId;
        const signal: ISignal = JSON.parse(data);

        if (signal.type === SignalType.newIceCandidate) {
            await this._receivedNewIceCandidate(partnerClientId, signal.candidate);
        } else if (signal.type === SignalType.videoOffer) {
            await this._receivedVideoOffer(partnerClientId, signal.sdp);
        } else if (signal.type === SignalType.videoAnswer) {
            await this._receivedVideoAnswer(partnerClientId, signal.sdp);
        }
    }

    private async _receivedNewIceCandidate(partnerClientId: string, candidate: RTCIceCandidate) {
        try {
            const iceServers = await this.getIceServers();
            const connection = await this.getConnection(partnerClientId, iceServers, false);
            await connection.rtcConnection.addIceCandidate(candidate);
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    }

    private async _receivedVideoOffer(partnerClientId: string, sdp: RTCSessionDescription) {
        const desc = new RTCSessionDescription(sdp);
        const iceServers = await this.getIceServers();
        const connection = await this.getConnection(partnerClientId, iceServers, false);

        if (connection.creatingAnswer) return;
        connection.creatingAnswer = true;

        try {
            await connection.rtcConnection.setRemoteDescription(desc);
            const senders = connection.rtcConnection.getSenders();
            if (!senders || senders.length === 0) {
                const localStream = await this.getUserMediaInternal();
                localStream.getTracks().forEach(track => connection.rtcConnection.addTrack(track, localStream));
            }
            
            const answer = await connection.rtcConnection.createAnswer();
            await connection.rtcConnection.setLocalDescription(answer);
            await this.sendSignal({ type: SignalType.videoAnswer, sdp: connection.rtcConnection.localDescription }, partnerClientId);
        } catch (error) {
            console.error('Error in receivedVideoOffer:', error);
        }

        connection.creatingAnswer = false;
    }

    private async _receivedVideoAnswer(partnerClientId: string, sdp: RTCSessionDescription) {
        try {
            const iceServers = await this.getIceServers();
            const connection = await this.getConnection(partnerClientId, iceServers, false);
            await connection.rtcConnection.setRemoteDescription(sdp);
        } catch (error) {
            console.error('Error in receivedVideoAnswer:', error);
        }
    }
}
