import {Component, HostListener, OnInit} from '@angular/core';
import { TimelineMax, Power0 } from 'gsap';
import { FormsModule } from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {CookieService} from "ngx-cookie-service";

@Component({
    selector: 'app-auth',
    standalone: true,
    templateUrl: './auth.component.html',
    imports: [
        FormsModule
    ],
    styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
    inputs: string[] = Array(8).fill('');
    tl = new TimelineMax({
        repeat: 0,
        yoyo: false
    });
    bgColor = "#CC0000";
    countNumber = 0;
    isSwapped = false;
    isDisabled = false;
    
    constructor(private authService: AuthService,
                private cookieService: CookieService) {
    }

    ngOnInit() {
        
    }

    @HostListener('window:paste', ['$event'])
    handlePaste(event: ClipboardEvent) {
        event.preventDefault();  // Prevent the default paste behavior
        let pastedText = event.clipboardData?.getData('text') || '';
        let words = pastedText.split(/\s+/).slice(0, 8);
        this.inputs = words.concat(Array(8 - words.length).fill('')); // Fill the remaining inputs with empty strings
        this.updateLine();
    }

    updateLine() {
        let count = this.inputs.filter(w => w !== '').length;
        if (count === this.countNumber) return;

        let increase = count > this.countNumber;

        this.tl.clear();

        if (increase) {
            this.inputs.forEach((input, index) => {
                if (input !== '') {
                    if (index < 3) {
                        this.tl.fromTo(`#top-side-${index + 1}`, {width: 0, background: this.bgColor}, {
                            width: 267,
                            background: this.bgColor,
                            duration: (index + 1) < count ? 0 : 0.5
                        });
                    } else if (index === 3) {
                        this.tl.fromTo(`#right-side`, {height: 0, background: this.bgColor}, {
                            height: 200,
                            background: this.bgColor,
                            duration: (index + 1) < count ? 0 : 0.5
                        });
                    } else if (index < 7) {
                        this.tl.fromTo(`#bottom-side-${index - 3}`, {width: 0, background: this.bgColor}, {
                            width: 267,
                            background: this.bgColor,
                            duration: (index + 1) < count ? 0 : 0.5
                        });
                    } else if (index === 7) {
                        this.tl.fromTo(`#left-side`, {height: 0, background: this.bgColor}, {
                            height: 200,
                            background: this.bgColor,
                            duration: (index + 1) < count ? 0 : 0.5
                        });
                    }
                }
            });
        }
        
        if (!increase) {
            let lastIndex = count
            if (lastIndex < 3) {
                this.tl.fromTo(`#top-side-${lastIndex + 1}`, { width: 267, background: this.bgColor }, { width: 0, background: this.bgColor, duration: 0.5 });
            } else if (lastIndex === 3) {
                this.tl.fromTo(`#right-side`, { height: 200, background: this.bgColor }, { height: 0, background: this.bgColor, duration: 0.5 });
            } else if (lastIndex < 7) {
                this.tl.fromTo(`#bottom-side-${lastIndex - 3}`, { width: 267, background: this.bgColor }, { width: 0, background: this.bgColor, duration: 0.5 });
            } else if (lastIndex === 7) {
                this.tl.fromTo(`#left-side`, { height: 200, background: this.bgColor }, { height: 0, background: this.bgColor, duration: 0.5 });
            }
        }

        this.countNumber = count;
    }

    handleRegister() {
        if (!this.isSwapped) {
            document.getElementById('registerButton')!.style.transform = 'translateX(740%)';
            document.getElementById('loginButton')!.style.transform = 'translateX(-910%)';
            this.isSwapped = true;
            
            this.authService.generateSeed().subscribe({
                next: (seed: string) => {
                    seed.split(' ').forEach((word, index) => {
                        this.inputs[index] = word;
                    });
                    
                    this.isDisabled = true;
                }
            });
        } else {
            this.authService.registerRequest(this.inputs.join(' ')).subscribe();
        }
    }

    handleLogin() {
        if (this.isSwapped) {
            document.getElementById('registerButton')!.style.transform = 'translateX(0%)';
            document.getElementById('loginButton')!.style.transform = 'translateX(0%)';
            this.isSwapped = false;

            this.inputs.forEach((input, index) => {
                this.inputs[index] = '';
            });
            this.isDisabled = false;
        } else {
            this.authService.loginRequest(this.inputs.join(' ')).subscribe(data => {
                this.cookieService.set('authToken', data['token']);
                this.cookieService.set('userId', data['user']['id']);
            });
        }
    }
}
