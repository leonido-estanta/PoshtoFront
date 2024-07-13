// file1: app.config.ts
import { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import {AuthService} from "./services/auth.service";
import {HTTP_INTERCEPTORS, provideHttpClient} from "@angular/common/http";
import {AuthInterceptor} from "./providers/auth-interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    AuthService,
    provideHttpClient(),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
};
