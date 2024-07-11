import { Component, OnInit } from "@angular/core";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {UserService} from "../../../services/user.service";
import {OnlineStatus, ServerUser} from "../../../models/userVoiceRoom";

@Component({
    selector: 'app-modal-server-users',
    templateUrl: './modal-server-users.component.html',
    standalone: true,
    imports: [
        NgIf,
        NgForOf,
        NgClass
    ],
    styleUrls: ['./modal-server-users.component.css']
})
export class ModalServerUsersComponent implements OnInit {

    serverUsers: ServerUser[] = [];

    constructor(private userService: UserService) {
        this.userService.usersObservable.subscribe(users => {
           this.serverUsers = users; 
        });
    }

    ngOnInit() {}

    protected readonly OnlineStatus = OnlineStatus;
}
