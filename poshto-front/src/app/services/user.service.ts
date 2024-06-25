import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {CookieService} from "ngx-cookie-service";

@Injectable({
    providedIn: 'root',
})
export class UserService {
    constructor(private http: HttpClient,
                private cookieService: CookieService) {

    }

    private baseUrl = 'https://localhost:7219';

    createAuthorizationHeader(headers: HttpHeaders) {
        return headers.append('Authorization', `Bearer ${this.cookieService.get('authToken')}`);
    }
    
    getUsers() {
        let headers = new HttpHeaders();
        headers = this.createAuthorizationHeader(headers);
        
        return this.http.get(`${this.baseUrl}/User/List`, {headers});
    }
    
    getUser(userId: number) {
        let headers = new HttpHeaders();
        headers = this.createAuthorizationHeader(headers);

        return this.http.get(`${this.baseUrl}/User/Get/${userId}`, {headers});
    }

}