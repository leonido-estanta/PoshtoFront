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

    public _hubConnection: HubConnection;
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

    constructor(private cookieService: CookieService) {
        this.usersObservable.subscribe((users) => {
            this.users = users;
        });

        this._hubConnection = new HubConnectionBuilder()
            .withUrl("http://localhost:5284/voiceHub")
            .build();

        (async () => {
            try {
                await this._hubConnection.start();
                this.currentConnectionId = await this._hubConnection.invoke(
                    "GetConnectionId"
                );
                this.connected = true;
                this.closeAllVideoCalls();
                this.connSub.next(true);
            } catch (error) {
                console.error(error);
            }
        })();

        this._hubConnection.onclose((err) => {
            console.error(err);
            this.connected = false;
            this.reset();
        });

        this._hubConnection.on(
            "callToUserList",
            async (roomId: string, users: User[]) => {
                if (this.currentRoomId == roomId) {
                    users.forEach((user) => {
                        if (
                            this._connections[user.connectionId] === undefined &&
                            user.connectionId !== this.currentConnectionId
                        ) {
                            this.initiateOffer(user);
                        }
                    });

                    await this.updateUserList(users);
                }
            }
        );

        this._hubConnection.on(
            "updateUserList",
            async (roomId: string, users: User[]) => {
                if (this.currentRoomId === roomId) {
                    Object.keys(this._connections)
                        .forEach(key => {
                            if (!users.find(user => user.connectionId === key)) {
                                this.closeVideoCall(key);
                            }
                        });
                    
                    await this.updateUserList(users);
                }
            });

        this._hubConnection.on("updateRoomsData", async (rooms: []) => {
            let roomsList: Room[] = [];
            rooms.forEach((room) => {
                roomsList.push(room['voiceRoom']);
            });

            this.roomsSub.next(roomsList);
        });

        this._hubConnection
            .on('receiveSignal', async (user: User, signal: string) => {
                await this.newSignal(user, signal);
            });
    }

    private async waitForConnection() {
        while (this._hubConnection.state !== "Connected") {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }

    async requestRoomsData() {
        await this.waitForConnection();
        return this._hubConnection.invoke("SendRoomsData", true);
    }

    private async updateUserList(users: User[]): Promise<void> {
        const iceServers = await this.getIceServers();

        for (const user of users) {
            const connection = await this.getConnection(
                user.connectionId,
                iceServers,
                false
            );
            if (connection.user.id !== user.id) {
                connection.user.id = user.id;
            }
            if (connection.isCurrentUser && connection.streamSub.getValue() === undefined) {
                const stream = await this.getUserMediaInternal();

                if (connection.streamSub.getValue() === undefined) {
                    connection.streamSub.next(stream);
                }
            }
        }
        this.usersSub.next(Object.values(this._connections));
    }

    private async initiateOffer(acceptingUser: User) {
        const partnerClientId = acceptingUser.connectionId;

        console.log("Initiate offer to " + acceptingUser.id);

        if (this._connections[partnerClientId]) {
            console.log("Cannot initiate an offer with existing partner.");
            return;
        }

        const iceServers = await this.getIceServers();

        await this.getConnection(partnerClientId, iceServers, true);
    }

    private async getConnection(
        partnerClientId: string,
        iceServers: RTCIceServer[],
        createOffer: boolean
    ): Promise<UserConnection> {
        const connection = this._connections[partnerClientId] 
            || (await this.createConnection(partnerClientId, iceServers, createOffer));
        return connection;
    }

    private async createConnection(
        partnerClientId: string,
        iceServers: RTCIceServer[],
        createOffer: boolean
    ): Promise<UserConnection> {
        console.log("WebRTC: creating connection...");

        if (this._connections[partnerClientId]) {
            this.closeVideoCall(partnerClientId);
        }

        const connection = new RTCPeerConnection({ iceServers: iceServers });
        const userConnection = new UserConnection(
            { id: "", connectionId: partnerClientId },
            false,
            connection
        );

        this._connections[partnerClientId] = userConnection;

        const localStream = await this.getUserMediaInternal();
        localStream.getTracks().forEach((track) =>
            connection.addTrack(track, localStream)
        );

        connection.oniceconnectionstatechange = () => {
            switch (connection.iceConnectionState) {
                case "closed":
                case "failed":
                case "disconnected":
                    this.closeAllVideoCalls();
                    break;
            }
        };
        connection.onicegatheringstatechange = () => {
            console.log("*** ICE gathering state changed to: " + connection.iceGatheringState);
        };
        connection.onsignalingstatechange = (event) => {
            console.log("*** WebRTC signaling state changed to: " + connection.signalingState);
            switch (connection.signalingState) {
                case "closed":
                    this.closeAllVideoCalls();
                    break;
            }
        };
        connection.onicecandidate = async (event) => {
            if (event.candidate) {
                console.log("WebRTC: new ICE candidate");
                await this.sendSignal(
                    {
                        type: SignalType.newIceCandidate,
                        candidate: event.candidate,
                    },
                    partnerClientId
                );
            } else {
                console.log("WebRTC: ICE candidate gathering complete");
            }
        };
        connection.onconnectionstatechange = (state) => {
            const states = {
                iceConnectionState: connection.iceConnectionState,
                iceGatheringState: connection.iceGatheringState,
                connectionState: connection.connectionState,
                signalingState: connection.signalingState,
            };

            console.log(JSON.stringify(states), state);
        };

        connection.ontrack = (event) => {
            console.log("Track received from " + partnerClientId);
            userConnection.setStream(event.streams[0]);
        };

        if (createOffer) {
            try {
                const desc = await connection.createOffer();

                await connection.setLocalDescription(desc);
                await this.sendSignal(
                    {
                        type: SignalType.videoOffer,
                        sdp: connection.localDescription,
                    },
                    partnerClientId
                );
            } catch (error) {
                console.error("Error in onnegotiationneeded:", error);
            }
        }

        return userConnection;
    }

    private async sendSignal(message: ISignal, partnerClientId: string) {
        await this.waitForConnection();
        await this._hubConnection.invoke(
            "SendSignal",
            JSON.stringify(message),
            partnerClientId
        );
    }

    private async getUserMediaInternal(): Promise<MediaStream> {
        if (this.currentMediaStream) {
            return this.currentMediaStream;
        }

        try {
            return await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
        } catch (error) {
            console.error("Failed to get hardware access", error);
        }
    }

    private async getIceServers(): Promise<RTCIceServer[]> {
        if (this.currentIceServers) {
            return this.currentIceServers;
        }

        try {
            await this.waitForConnection();
            return await this._hubConnection.invoke("GetIceServers");
        } catch (error) {
            console.error("GetIceServers error: ", error);
        }
    }

    private reset() {
        this.connected = false;
        this.connSub.next(false);
        this.usersSub.next(undefined);
    }

    async joinRoom(userId, roomId) {
        await this.waitForConnection();
        if (!this.connected) {
            this.reset();
            return;
        }

        this.closeAllVideoCalls();

        this._connections[this.currentConnectionId] = new UserConnection(
            { id: userId, connectionId: this.currentConnectionId },
            true,
            undefined
        );
        this.currentRoomId = roomId;
        await this._hubConnection.invoke("JoinVoiceRoom", userId.toString(), roomId.toString());
    }

    private closeAllVideoCalls() {
        Object.keys(this._connections).forEach((key) => {
            this.closeVideoCall(key);
        });
        this._connections = {};
    }

    private closeVideoCall(partnerClientId: string) {
        const connection = this._connections[partnerClientId];
        if (connection) {
            connection.end();
            this._connections[partnerClientId] = undefined;

            delete this._connections[partnerClientId];
        }
    }

    private async newSignal(user: User, data: string) {
        const partnerClientId = user.connectionId;
        const signal: ISignal = JSON.parse(data);

        console.log('WebRTC: received signal');

        if (signal.type === SignalType.newIceCandidate) {
            await this.receivedNewIceCandidate(partnerClientId, signal.candidate);
        } else if (signal.type === SignalType.videoOffer) {
            await this.receivedVideoOffer(partnerClientId, signal.sdp);
        } else if (signal.type === SignalType.videoAnswer) {
            await this.receivedVideoAnswer(partnerClientId, signal.sdp);
        }
    }

    private async receivedNewIceCandidate(partnerClientId: string, candidate: RTCIceCandidate) {
        console.log('Adding received ICE candidate: ' + JSON.stringify(candidate));

        try {
            const iceServers = await this.getIceServers();
            const connection = await this.getConnection(partnerClientId, iceServers, false);
            await connection.rtcConnection.addIceCandidate(candidate);
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    }

    private async receivedVideoOffer(partnerClientId: string, sdp: RTCSessionDescription) {

        console.log('Starting to accept invitation from ' + partnerClientId);

        const desc = new RTCSessionDescription(sdp);
        const iceServers = await this.getIceServers();
        const connection = await this.getConnection(partnerClientId, iceServers, false);

        if (connection.creatingAnswer) {
            console.warn('Second answer not created.');

            return;
        }
        connection.creatingAnswer = true;

        try {
            console.log('setRemoteDescription');
            await connection.rtcConnection.setRemoteDescription(desc);
            console.log('createAnswer');
            const senders = connection.rtcConnection.getSenders();
            if (!senders || senders.length === 0) {
                console.log('AddSenders needed');
                const localStream = await this.getUserMediaInternal();
                localStream.getTracks().forEach(track => connection.rtcConnection.addTrack(track, localStream));
            }
            const answer = await connection.rtcConnection.createAnswer();
            console.log('setLocalDescription', answer);
            await connection.rtcConnection.setLocalDescription(answer);
            await this.sendSignal({
                type: SignalType.videoAnswer,
                sdp: connection.rtcConnection.localDescription
            }, partnerClientId);
        } catch (error) {
            console.error('Error in receivedVideoOffer:', error);
        }

        connection.creatingAnswer = false;
    }

    private async receivedVideoAnswer(partnerClientId: string, sdp: RTCSessionDescription) {
        console.log('Call recipient has accepted our call');

        try {
            const iceServers = await this.getIceServers();
            const connection = await this.getConnection(partnerClientId, iceServers, false);

            await connection.rtcConnection.setRemoteDescription(sdp);
        } catch (error) {
            console.error('Error in receivedVideoAnswer:', error);
        }
    }
}
