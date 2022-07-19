import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';
import { ConfigService } from '@app/core/app-config/config.service';
import { catchError, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { throwError as observableThrowError } from 'rxjs/internal/observable/throwError';
import { ApplicationPreferencesService } from '@app/core/services/application-preferences.service';
import { ApplicationPreferences } from '@app/core/models/branding/application-preferences.model';
import { VisualImage } from '@app/core/models/branding/visual_image.model';
import { Observable } from 'rxjs';

export interface ElandSlide {
    visualMain: string;
}
@Component({
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
    health: any;
    display = false;
    slides: ElandSlide[];
    sliderConfig: SwiperConfigInterface;
    showPassword = false;
    username: string;
    password: string;
    config: any;
    returnUrl: string;
    tokenInfo: string;
    errorMessage = false;
    applicationPreferences: ApplicationPreferences;
    backgroundImagesLogin: VisualImage[];
    loading = false;

    constructor(
        private translateService: TranslateService,
        private keycloakService: KeycloakService,
        private configService: ConfigService,
        private http: HttpClient,
        private router: Router,
        private route: ActivatedRoute,
        private applicationPreferencesService: ApplicationPreferencesService,
    ) {
        this.sliderConfig = {
            a11y: {
                enabled: true,
            },
            direction: 'horizontal',
            slideClass: 'eland-slide',
            freeMode: true,
            mousewheel: true,
            scrollbar: false,
            watchSlidesProgress: true,
            watchSlidesVisibility: false,
            navigation: false,
            pagination: false,
            keyboard: {
                enabled: true,
                onlyInViewport: false,
            },
            centeredSlides: true,
            loop: true,
            initialSlide: 0,
            slidesPerView: 1,
            autoplay: {
                delay: 7000,
                disableOnInteraction: false,
            },
            speed: 2000,
            simulateTouch: true,
            effect: 'fade',
            grabCursor: false,
            passiveListeners: false,
            updateOnWindowResize: true,
        };
    }

    ngOnInit(): void {
        this.loadSetting(true);
        this.config = this.configService.getDefaultConfig('EXTERNAL_SERVICES.keycloak');
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        if (this.returnUrl === '/') {
            this.returnUrl = '/home';
        }

        this.translateService.get(['LOGIN']).subscribe((values) => {
            this.applicationPreferencesService.getApplicationPreferences(true).subscribe((visualImages) => {
                this.backgroundImagesLogin = visualImages.sliderVisuals.filter((a) => a.type === 'appSliderVisual_1');
                this.slides = [
                    {
                        visualMain: this.backgroundImagesLogin[0].url,
                    },
                ];
            });
        });
    }

    submit() {
        this.loading = true;
        this.getTokenKeyCloak(this.username, this.password).subscribe(
            (data) => {
                this.keycloakService
                    .init({
                        config: {
                            url: this.config.keyCloakUrl,
                            realm: this.config.keyCloakRealm,
                            clientId: this.config.keyCloakClientId,
                        },
                        initOptions: {
                            checkLoginIframe: false,

                            token: data.access_token,
                            idToken: data.id_token,
                            refreshToken: data.refresh_token,
                            redirectUri: this.returnUrl,
                        },
                    })
                    .then((res) => {
                        localStorage.setItem('token', JSON.stringify(data));

                        window.location.replace(this.returnUrl);
                        window.history.replaceState(window.history.state, null, this.returnUrl);
                    })
                    .catch((error) => {
                        this.loading = false;
                        this.handleError(error);
                    });
            },
            (error) => {
                this.loading = false;
                // console.error(error.message + ' : ' + error.error.description);
                this.handleError(error);
                if (error.status === 401) {
                    this.errorMessage = true;
                    this.password = '';
                }
            },
        );
    }

    getTokenKeyCloak(username: string, password: string): Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded',
            }),
        };

        const params = new HttpParams({
            fromObject: {
                grant_type: 'password',
                client_id: this.config.keyCloakClientId,
                username,
                password,
                scope: 'openid',
            },
        });

        const url = `${this.config.keyCloakUrl}/realms/${this.config.keyCloakRealm}/protocol/openid-connect/token`;

        return this.http.post(url, params, httpOptions).pipe(
            tap((response: any) => {
                this.tokenInfo = response.access_token;
            }),
            catchError(this.handleError),
        );
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }

    loadSetting(isActive: boolean) {
        this.applicationPreferencesService.getApplicationPreferences(isActive).subscribe((appPreferences) => {
            this.applicationPreferences = appPreferences;
            appPreferences.sliderVisuals.sort(function (a, b) {
                return a.id - b.id;
            });
            localStorage.setItem('applicationPreferences', JSON.stringify(appPreferences));
            const appPreference =
                this.applicationPreferencesService.getApplicationPreferenceFromStore('applicationPreferences');
            this.applicationPreferencesService.setPreferences(
                appPreference.organizationMainColor,
                appPreference.appMyTasksButtonColor,
                appPreference.appClaimsButtonColor,
                appPreference.appAllTasksButtonColor,
            );
        });
    }
}
