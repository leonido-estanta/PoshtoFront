import { Routes } from "@angular/router";
import {AuthComponent} from "./components/auth/auth.component";
import {MessengerComponent} from "./components/messenger/messenger.component";
import {CallComponent} from "./components/call/call.component";

export const routes: Routes = [
    {
        component: AuthComponent, path: 'auth'
    },
    {
        component: MessengerComponent, path: 'messenger'
    },
    {
        component: CallComponent, path: 'call'
    }
];
