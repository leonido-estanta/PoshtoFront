import { AfterViewInit, Component, OnInit } from "@angular/core";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {UserService} from "../../../services/user.service";
import {OnlineStatus} from "../../../models/userVoiceRoom";

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
export class ModalServerUsersComponent implements OnInit, AfterViewInit {

    constructor(private userService: UserService) {
        
    }
    
    get serverUsers() {
        return this.userService.serverUsers;
    }
    
    ngOnInit() {}

    ngAfterViewInit() {}

    protected readonly OnlineStatus = OnlineStatus;
}
