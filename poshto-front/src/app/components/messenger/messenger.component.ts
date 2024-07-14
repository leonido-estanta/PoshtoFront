import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { NgClass, NgForOf } from "@angular/common";
import { ChatService } from "../../services/chat.service";
import { UserService } from "../../services/user.service";
import { gsap } from "gsap";
import { debounce } from 'lodash';
import {ServerUser} from "../../models/userVoiceRoom";

@Component({
    selector: 'messenger-component',
    templateUrl: './messenger.component.html',
    styleUrls: ['./messenger.component.css'],
    imports: [
        FormsModule,
        NgForOf,
        NgClass
    ],
    standalone: true
})
export class MessengerComponent implements OnInit, AfterViewInit {
    @ViewChild('chatMessagesInner') chatMessagesInner: ElementRef;

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
                this.scrollToBottom();
            }
        });
    }

    ngAfterViewInit() {
        this.scrollToBottom();
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
                if (initialLoad) {
                    this.scrollToBottom();
                }
            });
    }

    inputMessage = '';

    sendMessage() {
        if (this.inputMessage) {
            this.chatService.sendMessage(this.inputMessage).then(_ => {
                this.inputMessage = '';
                this.scrollToBottom();
            });
        }
    }

    adjustTextareaHeight(event: Event) {
        const textarea = event.target as HTMLTextAreaElement;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    scrollToBottom() {
        gsap.to(this.chatMessagesInner.nativeElement, { scrollTop: this.chatMessagesInner.nativeElement.scrollHeight, duration: 0.5 });
    }

    onScroll = debounce((event) => {
        const element = event.target;
        if ((element.scrollHeight - element.clientHeight + element.scrollTop) < 200 && !this.loadingMessages) {
            this.loadMessages();
        }
    }, 100);
}