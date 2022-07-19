import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AppAuthGuard } from './core/utils/keycloak/app-auth-guard';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { UiComponent } from './ui-component/ui.component';

const APP_ROUTES: Routes = [
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full',
    },
    {
        path: 'login',
        component: LoginComponent,
    },
    {
        path: 'register',
        loadChildren: () => import('./register/register.module').then((m) => m.RegisterModule),
    },
    {
        path: 'forgot-password',
        loadChildren: () => import('./forgot-password/forgot-password.module').then((m) => m.ForgotPasswordModule),
    },
    {
        path: 'home',
        component: HomeComponent,
        canActivate: [AppAuthGuard],
    },
    {
        path: 'ui-components',
        component: UiComponent,
        canActivate: [AppAuthGuard],
    },
    {
        path: '404',
        component: NotFoundComponent,
        canActivate: [AppAuthGuard],
    },
    { path: '**', redirectTo: '/404' },
];

@NgModule({
    imports: [RouterModule.forRoot(APP_ROUTES, { preloadingStrategy: PreloadAllModules })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
