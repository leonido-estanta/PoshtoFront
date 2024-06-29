import {User} from "./user";

export class Room {
    id: number;
    name: string;
    
    connectedUsers: User[] = [];
}