import {UserModel} from "./user.model";

export class RoomModel {
    id: number;
    name: string;
    
    connectedUsers: UserModel[] = [];
}