import {Component, OnInit, ViewChild} from "@angular/core";
import {HeaderComponent} from "../header/header.component";
import {FormsModule} from "@angular/forms";
import {ChatService} from "../../services/chat.service";
import {NgClass, NgForOf} from "@angular/common";
import {CookieService} from "ngx-cookie-service";
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from '@angular/cdk/scrolling';

@Component({
    selector: 'app-messenger',
    standalone: true,
    templateUrl: './messenger.component.html',
    imports: [
        HeaderComponent,
        FormsModule,
        NgClass,
        NgForOf,
        CdkVirtualScrollViewport,
        CdkVirtualForOf,
        CdkFixedSizeVirtualScroll
    ],
    styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit {
    @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport;
    messages = [];
    pageSize = 50;
    loadingMessages = false;
    inputMessage = '';
    pageLoaded = 0;

    constructor(private chatService: ChatService,
                private cookieService: CookieService) {}

    ngOnInit() {
        this.chatService.startConnection();
        this.loadMessages(true);
        
        this.chatService.hubConnection.on('ReceiveMessage', (data) => {
            if (data) {
                this.messages = [...this.messages, data];
                setTimeout(() => this.viewport.scrollToIndex(this.messages.length - 1), 0);
            }
        });
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
                    setTimeout(() => this.viewport.scrollToIndex(this.messages.length - 1), 0);
                } else {
                    this.viewport.checkViewportSize();
                    setTimeout(() => this.viewport.scrollToIndex(newMessagesCount), 0);
                }
            });
    }

    onScroll() {
        if (this.viewport.getOffsetToRenderedContentStart() === 0) {
            this.loadMessages();
        }
    }

    sendMessage() {
        if (this.inputMessage) {
            this.chatService.sendMessage(this.inputMessage).subscribe(_ => {
                this.inputMessage = '';
            });
        }
    }

    isFromMe(message): boolean {
        return message.senderId == this.cookieService.get('userId');
    }
}
