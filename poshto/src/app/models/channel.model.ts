import {UserModel} from "./user.model";

export class ChannelModel {
    id: number;
    name: string;
    
    connectedUsers: UserModel[] = [];
}