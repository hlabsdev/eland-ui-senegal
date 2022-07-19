import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApplicationPreferences } from '@app/core/models/branding/application-preferences.model';
import { environment as config } from 'environments/environment';
import { BehaviorSubject, Observable, throwError as observableThrowError, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HslaBrand } from '@app/core/models/branding/hsla-brand';
import { withCache, HttpCacheManager, CacheBucket } from '@ngneat/cashew';

@Injectable({ providedIn: 'root' })
export class ApplicationPreferencesService {
    private fasApiUrl = `${config.translationApi}`;
    private appPreferenceBucket = new CacheBucket();

    // sharing application preferences
    private applicationPreferences = new BehaviorSubject<ApplicationPreferences>(
        new ApplicationPreferences({
            id: undefined,
            organizationName: undefined,
            organizationWebsite: undefined,
            organizationVisualIdentity: undefined,
            appSliderVisual_1: undefined,
            appSliderVisual_2: undefined,
            appSliderVisual_3: undefined,
            saveQuicklinksValue: undefined,
            quicklinksGroups: [],
            organizationMainColor: undefined,
            appMyTasksButtonColor: undefined,
            appClaimsButtonColor: undefined,
            appAllTasksButtonColor: undefined,
        }),
    );

    private subjectName = new Subject<any>();

    constructor(private http: HttpClient, private manager: HttpCacheManager) {}

    setPreferencesToload(_dataToPreload: ApplicationPreferences) {
        this.applicationPreferences.next(_dataToPreload);
    }

    getApplicationPreferences(isActive: boolean): Observable<ApplicationPreferences> {
        return this.http
            .get<ApplicationPreferences>(
                `${this.fasApiUrl}/preferences/active/${isActive}`,
                withCache({
                    bucket$: this.appPreferenceBucket,
                }),
            )
            .pipe(
                map((appPreference) => new ApplicationPreferences(appPreference)),
                catchError(this.handleError),
            );
    }

    updateApplicationPreferences(applicationPreferences: ApplicationPreferences): Observable<ApplicationPreferences> {
        this.manager.delete(this.appPreferenceBucket);
        return this.http
            .put<ApplicationPreferences>(
                `${this.fasApiUrl}/preferences/main/${applicationPreferences.id}`,
                applicationPreferences,
            )
            .pipe(
                map((response) => new ApplicationPreferences(response)),
                catchError(this.handleError),
            );
    }

    createApplicationPreferences(applicationPreferences: ApplicationPreferences): Observable<ApplicationPreferences> {
        this.manager.delete(this.appPreferenceBucket);
        applicationPreferences.id = '1';
        return this.http
            .post<ApplicationPreferences>(`${this.fasApiUrl}/preferences/main`, applicationPreferences)
            .pipe(
                map((response) => new ApplicationPreferences(response)),
                catchError(this.handleError),
            );
    }

    deleteApplicationPreferences(appPrefsId: string): any {
        this.manager.delete(this.appPreferenceBucket);
        return this.http.delete(`${this.fasApiUrl}/preferences/main/${appPrefsId}`).subscribe(
            () => {},
            (error) => this.handleError(error),
        );
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return observableThrowError(error);
    }

    // set application level public config
    public getApplicationPreferenceFromStore(applicationPreferences: string): any {
        return JSON.parse(localStorage.getItem(applicationPreferences));
    }

    setPreferences(
        orgMainColor: HslaBrand,
        buttonMyTasksColor: HslaBrand,
        buttonClaimsColor: HslaBrand,
        buttonAllTasksColor: HslaBrand,
    ) {
        document.documentElement.style.setProperty('--eland-cold-blue_h', orgMainColor.h);
        document.documentElement.style.setProperty('--eland-cold-blue_s', orgMainColor.s);
        document.documentElement.style.setProperty('--eland-cold-blue_l', orgMainColor.l);
        document.documentElement.style.setProperty('--eland-cold-blue_a', orgMainColor.a);

        document.documentElement.style.setProperty('--eland-button-cpm1_h', buttonMyTasksColor.h);
        document.documentElement.style.setProperty('--eland-button-cpm1_s', buttonMyTasksColor.s);
        document.documentElement.style.setProperty('--eland-button-cpm1_l', buttonMyTasksColor.l);
        document.documentElement.style.setProperty('--eland-button-cpm1_a', buttonMyTasksColor.a);

        document.documentElement.style.setProperty('--eland-button-cpm2_h', buttonClaimsColor.h);
        document.documentElement.style.setProperty('--eland-button-cpm2_s', buttonClaimsColor.s);
        document.documentElement.style.setProperty('--eland-button-cpm2_l', buttonClaimsColor.l);
        document.documentElement.style.setProperty('--eland-button-cpm2_a', buttonClaimsColor.a);

        document.documentElement.style.setProperty('--eland-button-cpm3_h', buttonAllTasksColor.h);
        document.documentElement.style.setProperty('--eland-button-cpm3_s', buttonAllTasksColor.s);
        document.documentElement.style.setProperty('--eland-button-cpm3_l', buttonAllTasksColor.l);
        document.documentElement.style.setProperty('--eland-button-cpm3_a', buttonAllTasksColor.a);
    }
}
