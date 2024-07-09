export class UserVoiceRoom {
    id: string;
    connectionId: string;
}

export class ServerUser extends UserVoiceRoom {
    onlineStatus: OnlineStatus;
    email: string;
    name: string;
    avatarUrl: string;
}

export enum OnlineStatus {
    Offline = 0,
    Online = 1
}