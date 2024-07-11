import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {NgForOf} from "@angular/common";
import {ChatService} from "../../services/chat.service";
import {UserService} from "../../services/user.service";
import {ServerUser} from "../../models/userVoiceRoom";

@Component({
    selector: 'messenger-component',
    templateUrl: './messenger.component.html',
    styleUrls: ['./messenger.component.css'],
    imports: [
        FormsModule,
        NgForOf
    ],
    standalone: true
})

export class MessengerComponent implements OnInit {
    constructor(private chatService: ChatService, private userService: UserService) {}

    messages = [];
    loadingMessages = false;
    pageSize = 50;
    pageLoaded = 0;

    ngOnInit() {
        this.chatService.startConnection();
        //this.userService.startConnection();
        this.loadMessages(true);

        /*this.userService._hubConnection.on('updateServerUsers', async (users: ServerUser[]) => {
            this.userService.serverUsers = users;
            console.log(users)
        });*/

        this.chatService.hubConnection.on('ReceiveMessage', (data) => {
            if (data) {
                this.messages = [...this.messages, data];
                //setTimeout(() => this.viewport.scrollToIndex(this.messages.length - 1), 0);
            }
        });
    }

    getMessageUserAvatar(message) {
        return this.userService.serverUsers.filter(w => w.id == message.senderId)[0]?.avatarUrl;
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
                if (initialLoad) {
                    //setTimeout(() => this.viewport.scrollToIndex(this.messages.length - 1), 0);
                } else {
                    //this.viewport.checkViewportSize();
                    //setTimeout(() => this.viewport.scrollToIndex(newMessagesCount), 0);
                }
            });
    }

    inputMessage = '';

    sendMessage() {
        if (this.inputMessage) {
            this.chatService.sendMessage(this.inputMessage).subscribe(_ => {
                this.inputMessage = '';
            });
        }
    }

    adjustTextareaHeight(event: Event) {
        const textarea = event.target as HTMLTextAreaElement;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }
}
