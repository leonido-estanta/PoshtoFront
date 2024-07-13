import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import {AuthService} from "../services/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService, private cookieService: CookieService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const authToken = this.cookieService.get('authToken');
        const authReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${authToken}`)
        });

        return next.handle(authReq).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    return this.authService.renewToken().pipe(
                        switchMap((data: any) => {
                            this.cookieService.set('authToken', data.token);
                            const newAuthReq = req.clone({
                                headers: req.headers.set('Authorization', `Bearer ${data.token}`)
                            });
                            return next.handle(newAuthReq);
                        }),
                        catchError(err => {
                            this.authService.logout();
                            return throwError(err);
                        })
                    );
                } else {
                    return throwError(error);
                }
            })
        );
    }
}
