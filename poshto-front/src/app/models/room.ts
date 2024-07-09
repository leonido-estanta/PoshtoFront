import {UserVoiceRoom} from "./userVoiceRoom";

export class Room {
    id: number;
    name: string;
    
    connectedUsers: UserVoiceRoom[] = [];
}