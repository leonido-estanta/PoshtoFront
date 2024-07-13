import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { NgClass, NgForOf } from "@angular/common";
import { ChatService } from "../../services/chat.service";
import { UserService } from "../../services/user.service";
import {
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    CdkVirtualScrollViewport,
    ScrollingModule
} from "@angular/cdk/scrolling";
import { ServerUser } from "../../models/userVoiceRoom";

@Component({
    selector: 'messenger-component',
    templateUrl: './messenger.component.html',
    styleUrls: ['./messenger.component.css'],
    imports: [
        FormsModule,
        NgForOf,
        CdkVirtualScrollViewport,
        CdkVirtualForOf,
        NgClass,
        CdkFixedSizeVirtualScroll,
        ScrollingModule
    ],
    standalone: true
})

export class MessengerComponent implements OnInit {
    constructor(private chatService: ChatService, private userService: UserService) {}

    messages = [];
    loadingMessages = false;
    pageSize = 50;
    pageLoaded = 0;

    users: ServerUser[] = [];

    ngOnInit() {
        this.chatService.startConnection();
        this.loadMessages(true);

        this.userService.usersObservable.subscribe(users => {
            this.users = users;
        });

        this.chatService.hubConnection.on('ReceiveMessage', (data) => {
            if (data) {
                this.messages = [...this.messages, data];
            }
        });
    }

    getMessageUser(message) {
        return this.users?.filter(w => w.id == message.senderId)[0];
    }

    loadMessages(initialLoad: boolean = false) {
        if (this.loadingMessages) return;
        this.loadingMessages = true;
        this.chatService.getMessages(this.messages.length, this.pageSize)
            .subscribe((data: any) => {
                const newMessagesCount = data.length;
                this.messages = [...data.reverse(), ...this.messages];
                this.loadingMessages = false;
                this.pageLoaded += 1;
            });
    }

    inputMessage = '';

    sendMessage() {
        if (this.inputMessage) {
            this.chatService.sendMessage(this.inputMessage).then(_ => {
                this.inputMessage = '';
            });
        }
    }

    adjustTextareaHeight(event: Event) {
        const textarea = event.target as HTMLTextAreaElement;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    onScroll() {

    }
}