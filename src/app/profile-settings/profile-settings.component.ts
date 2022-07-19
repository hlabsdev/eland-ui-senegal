import {
    Component,
    ComponentFactoryResolver,
    EventEmitter,
    OnInit,
    Output,
    ViewChild,
    ViewContainerRef,
    AfterViewInit,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AccessRights } from '@app/core/models/accessRight';
import { ApplicationPreferences } from '@app/core/models/branding/application-preferences.model';
import { HslaBrand } from '@app/core/models/branding/hsla-brand';
import { User } from '@app/core/models/user.model';
import { ApplicationPreferencesService } from '@app/core/services/application-preferences.service';
import { AppAuthGuard } from '@app/core/utils/keycloak/app-auth-guard';
import { UtilService } from '@app/core/utils/util.service';
import { ValidationService } from '@app/core/utils/validation.service';
import { QuicklinksGroup } from '@features/quicklink/models/quicklink.model';
import { TranslateService } from '@ngx-translate/core';
import { environment as config } from 'environments/environment';
import { ColorPickerService } from 'ngx-color-picker';
import { SelectItem } from 'primeng/api';
import { Observable, Subscription } from 'rxjs';
import { AlertService } from '../core/layout/alert/alert.service';
import { UserPreferences } from '../core/models/userPreferences.model';
import { UserService } from '../core/services/user.service';
//import { brandingVariables } from '../style-branding/variables/branding_variables.scss';
import { fileToBase64Url } from '@app/core/utils/file.util';
import { ConfigService } from '@app/core/app-config/config.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
    selector: 'app-profile-settings',
    templateUrl: './profile-settings.component.html',
})
export class ProfileSettingsComponent implements OnInit, AfterViewInit {
    public isChangePreferences = false;
    returnUrl: string;
    user: User;
    hasSystemAdministratorAccess: boolean;
    displayedLang: string;
    initialLang: string;
    langs: SelectItem[];
    // Generic chromatic settings default
    elandGenericColors = [];

    settings = [
        {
            name: 'user_profile',
        },
        {
            name: 'session_preferences',
        },
        {
            name: 'application_preferences',
        },
    ];
    selectedSettingIndex: number;

    // Applicatiomn preferences
    applicationPreferences: ApplicationPreferences;
    configService: ConfigService;

    // preloader message
    preloaderMessage = '...';
    @Output() refresh = new EventEmitter();

    presetColorValues: string[] = [];
    cpPresetLabel: string;
    cpAddColorButtonText: string;

    // button claims main color
    appClaimsButtonColorName = '';

    // button claims main color
    appAllTasksButtonColorName = '';

    // Quicklinks
    translateLinks: Subscription;

    // error handling
    errorMessage: string;
    mySubscription: any;

    @ViewChild('lazyQuickLinks', { read: ViewContainerRef })
    private lazyQuickLinksVcRef: ViewContainerRef;

    constructor(
        private applicationPreferencesService: ApplicationPreferencesService,
        private alertService: AlertService,
        private router: Router,
        private translate: TranslateService,
        private userService: UserService,
        private utilService: UtilService,
        public appAuthGuard: AppAuthGuard,
        public _domSanitizer: DomSanitizer,
        private route: ActivatedRoute,
        private colorPickerService: ColorPickerService,
        private translateService: TranslateService,
        public validationService: ValidationService,
        private ngxLoader: NgxUiLoaderService,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
    ) {
        // languages
        translate.addLangs(config.availableLanguages);
        this.user = this.userService.getCurrentUser();
        // local store default value
        const appPreference =
            this.applicationPreferencesService.getApplicationPreferenceFromStore('applicationPreferences');
        this.elandGenericColors = this.setElandGenericColors(appPreference);
    }

    ngOnInit(): void {
        // set default preferences
        this.applicationPreferencesInits();
        // init quicklinks
        this.initQLs();

        // init langs
        this.getLangsList();

        // set user role for access to preferences
        this.hasSystemAdministratorAccess = this.user.hasPermission(AccessRights.SYSTEM_ADMINISTRATOR);

        // set language
        const lang = this.utilService.loadLanguagePreferencesFromLocalStorage(this.user.username);
        if (lang) {
            this.translate.use(lang);
            this.initialLang = lang;
            this.nominalLang(this.initialLang);
        }
        // set routes for tabs
        this.route.queryParams.subscribe((settings: { setting: string }) => {
            for (let i = 0; i < this.settings.length; i++) {
                const setting = this.settings[i];
                if (setting.name === settings.setting) {
                    this.selectedSettingIndex = i;
                }
            }
        });
    }

    ngAfterViewInit() {
        this.lazyLoadQuickLinks();
    }

    applicationPreferencesInits() {
        this.applicationPreferences = new ApplicationPreferences();
        this.applicationPreferencesService.getApplicationPreferences(true).subscribe((appPreferences) => {
            this.applicationPreferences = appPreferences;
            appPreferences.sliderVisuals.sort(function (a, b) {
                return a.id - b.id;
            });
            this.applicationPreferences = {
                ...this.applicationPreferences,
                saveQuicklinksValue: true,
                id: appPreferences.id,
                organizationWebsite: appPreferences.organizationWebsite,
                organizationName: appPreferences.organizationName,
                organizationMainColor: appPreferences.organizationMainColor,
                appMyTasksButtonColor: appPreferences.appMyTasksButtonColor,
                appClaimsButtonColor: appPreferences.appClaimsButtonColor,
                appAllTasksButtonColor: appPreferences.appAllTasksButtonColor,
                organizationVisualIdentity: appPreferences.sliderVisuals[0].url,
                appSliderVisual_1: appPreferences.sliderVisuals[1].url,
                appSliderVisual_2: appPreferences.sliderVisuals[2].url,
                appSliderVisual_3: appPreferences.sliderVisuals[3].url,
                sliderVisuals: appPreferences.sliderVisuals,
                main: appPreferences.main,
                isActive: appPreferences.isActive,
            };
            this.elandGenericColors = this.setElandGenericColors(this.applicationPreferences);
            // presets
            this.presetColorValues = this.elandGenericColors.map((color) => color.value);
            this.applicationPreferencesService.setPreferencesToload(this.applicationPreferences);
            this.applicationPreferencesService.setPreferences(
                this.applicationPreferences.organizationMainColor,
                this.applicationPreferences.appMyTasksButtonColor,
                this.applicationPreferences.appClaimsButtonColor,
                this.applicationPreferences.appAllTasksButtonColor,
            );
            this.refreshLocalStorage(this.applicationPreferences);
            if (this.isChangePreferences) {
                this.applicationPreferences.isActive = false;
                this.updateAppPrefs(this.applicationPreferences);
            }
        });
    }

    // set default  chromatic preferences
    chromaticInits(_h: string, _s: string, _l: string, _a: string): HslaBrand {
        let brandingVariables;
        return {
            h: brandingVariables[_h],
            s: brandingVariables[_s],
            l: brandingVariables[_l],
            a: brandingVariables[_a],
        };
    }

    changeLanguage(lang: string): void {
        this.translate.use(lang);
        this.nominalLang(lang);
        const userPreferences: UserPreferences = { username: this.user.username, language: lang };
        this.utilService.saveLanguagePreferencesToLocalStorage(userPreferences);
        this.parametricRoutedReLoad();
    }

    parametricRoutedReLoad() {
        const currentUrl = this.router.url;
        const currentRoute = '/profile-settings';
        const setting = 'session_preferences';

        this.router.navigate([currentUrl]).then(() => {
            setTimeout(() => {
                this.router.navigate([currentRoute], {
                    queryParams: { setting },
                });
            }, 1000);
        });
    }

    nominalLang(lang) {
        switch (lang) {
            case 'en':
                this.displayedLang = 'English';
                break;
            case 'fr-SN':
                this.displayedLang = 'Français';
                break;
        }
    }

    getLangsList() {
        this.langs = this.translate.getLangs().map((o) => this.toSelectItem(o));
    }

    toSelectItem(_o: string): SelectItem {
        return {
            label: _o,
            value: _o,
        };
    }

    getCurrentLang() {
        return this.translate.currentLang;
    }

    // Profile and settings tabs
    handleChange(e: any) {
        const setting = this.settings[e.index].name;
        if (setting) {
            this.router.navigate(['/profile-settings'], { queryParams: { setting } });
        }
        this.selectedSettingIndex = e.index;
    }

    // Main Visual Identity preferences
    visualCoBrandChange(e, field: string) {
        const file = e.srcElement.files[0];
        fileToBase64Url(file).subscribe((base64Url) => {
            const megaByte = 1.016649;
            if (this.calculateSizeMegaByteImage(base64Url) > megaByte) {
                this.alertService.error('MESSAGES.PROFILE_PREFERENCE.ERROR_LOADING_IMG');
            } else {
                switch (field) {
                    case 'visual_identity':
                        this.applicationPreferences.organizationVisualIdentity = base64Url;
                        break;
                    case 'home_page_visual_1':
                        this.applicationPreferences.appSliderVisual_1 = base64Url;
                        break;
                    case 'home_page_visual_2':
                        this.applicationPreferences.appSliderVisual_2 = base64Url;
                        break;
                    case 'home_page_visual_3':
                        this.applicationPreferences.appSliderVisual_3 = base64Url;
                        break;
                }
                this.applicationPreferences.sliderVisuals[0].url =
                    this.applicationPreferences.organizationVisualIdentity.replace(/\s+/g, '');
                this.applicationPreferences.sliderVisuals[1].url =
                    this.applicationPreferences.appSliderVisual_1.replace(/\s+/g, '');
                this.applicationPreferences.sliderVisuals[2].url =
                    this.applicationPreferences.appSliderVisual_2.replace(/\s+/g, '');
                this.applicationPreferences.sliderVisuals[3].url =
                    this.applicationPreferences.appSliderVisual_3.replace(/\s+/g, '');
                this.refreshLocalStorage(this.applicationPreferences);
            }
        });
    }

    //  hsla, Hsva and string conversions

    onChangeColorHsla(e: any, field: string) {
        const hsva = this.colorPickerService.stringToHsva(e, true);
        const hsvaToHsla = this.colorPickerService.hsva2hsla(hsva);
        if (hsvaToHsla) {
            switch (field) {
                case 'main_color':
                    this.applicationPreferences.organizationMainColor = this.reconstructHsla(hsvaToHsla);
                    break;
                case 'my_tasks_button_color':
                    this.applicationPreferences.appMyTasksButtonColor = this.reconstructHsla(hsvaToHsla);
                    break;
                case 'claim_tasks_button_color':
                    this.applicationPreferences.appClaimsButtonColor = this.reconstructHsla(hsvaToHsla);
                    break;
                case 'all_tasks_button_color':
                    this.applicationPreferences.appAllTasksButtonColor = this.reconstructHsla(hsvaToHsla);
                    break;
            }
            this.applicationPreferencesService.setPreferences(
                this.applicationPreferences.organizationMainColor,
                this.applicationPreferences.appMyTasksButtonColor,
                this.applicationPreferences.appClaimsButtonColor,
                this.applicationPreferences.appAllTasksButtonColor,
            );
            this.refreshLocalStorage(this.applicationPreferences);
        }
    }

    reconstructHsla(color: any): HslaBrand {
        return {
            h: (color.h * 366).toString(),
            s: (color.s * 100).toString() + '%',
            l: (color.l * 100).toString() + '%',
            a: (color.a * 100).toString() + '%',
        };
    }

    // param application preferences
    setElandGenericColors(applicationPreferences: ApplicationPreferences) {
        return [
            {
                key: 1,
                value:
                    'hsla(' +
                    applicationPreferences.organizationMainColor.h +
                    ',' +
                    applicationPreferences.organizationMainColor.s +
                    ',' +
                    applicationPreferences.organizationMainColor.l +
                    ')',
                name: 'Eland Cold Blue',
            },
            {
                key: 2,
                value:
                    'hsla(' +
                    applicationPreferences.appMyTasksButtonColor.h +
                    ',' +
                    applicationPreferences.appMyTasksButtonColor.s +
                    ',' +
                    applicationPreferences.appMyTasksButtonColor.l +
                    ')',
                name: 'Eland My Tasks Button ',
            },
            {
                key: 3,
                value:
                    'hsla(' +
                    applicationPreferences.appClaimsButtonColor.h +
                    ',' +
                    applicationPreferences.appClaimsButtonColor.s +
                    ',' +
                    applicationPreferences.appClaimsButtonColor.l +
                    ')',
                name: 'Eland Claims Button ',
            },
            {
                key: 4,
                value:
                    'hsla(' +
                    applicationPreferences.appAllTasksButtonColor.h +
                    ',' +
                    applicationPreferences.appAllTasksButtonColor.s +
                    ',' +
                    applicationPreferences.appAllTasksButtonColor.l +
                    ')',
                name: 'Eland All Tasks Button ',
            },
        ];
    }

    // translate inits
    initQLs() {
        this.translateLinks = this.translateService.stream(['USER_SETTINGS']).subscribe((values) => {
            this.cpPresetLabel = values.USER_SETTINGS.APPLICATION_PREFERENCES_TAB.COLORPICKER_ELAND_GENERIC_COLORS;
            this.cpAddColorButtonText = values.USER_SETTINGS.APPLICATION_PREFERENCES_TAB.COLORPICKER_ELAND_ADD_COLOR;
        });
    }

    quicklinksGroupsHandler(qlgs: Observable<QuicklinksGroup[]>) {
        qlgs.subscribe((_qlgs) => {
            this.applicationPreferences.quicklinksGroups = _qlgs;
        });
    }

    setSaveQuicklinksValue(value: boolean) {
        this.applicationPreferences.saveQuicklinksValue = value;
    }

    setDefaultSettingValue(value: boolean) {
        this.applicationPreferences.isActive = value;
        this.isChangePreferences = true;
        this.applicationPreferencesInits();
    }

    updateAppPrefs(applicationPreferencesActive: ApplicationPreferences) {
        this.getPreloaderMessage();
        this.ngxLoader.start();
        this.applicationPreferencesService.setPreferencesToload(applicationPreferencesActive);
        const updateValueMainOldObj =
            this.applicationPreferencesService.updateApplicationPreferences(applicationPreferencesActive);
        updateValueMainOldObj.subscribe(
            (newApplicationPref) => {
                this.alertService.success('API_MESSAGES.SAVE_SUCCESSFUL');
                this.refresh.emit(true);
                this.ngxLoader.stop();
                window.location.href = window.location.href;
            },
            (err) => this.alertService.apiError(err),
        );
    }

    saveAppPrefs(applicationPreferences: ApplicationPreferences, form: NgForm) {
        // sharing preferences data
        this.applicationPreferencesService.setPreferencesToload(applicationPreferences);

        if (form.invalid) {
            const errorResult = this.validationService.validateForm(form);
            this.errorMessage = errorResult.toMessage();
            return this.alertService.error(errorResult.message);
        }

        // saving preferences data
        const saveAppPrefsObs = applicationPreferences.id
            ? this.applicationPreferencesService.updateApplicationPreferences(applicationPreferences)
            : this.applicationPreferencesService.createApplicationPreferences(applicationPreferences);

        this.preloaderMessage = this.getPreloaderMessage();
        this.ngxLoader.start();
        saveAppPrefsObs.subscribe(
            (newApplicationPref) => {
                this.ngxLoader.stop();
                this.alertService.success('API_MESSAGES.SAVE_SUCCESSFUL');
                this.refresh.emit(true);
                this.refreshLocalStorage(applicationPreferences);
                window.location.href = window.location.href;
            },
            (err) => this.alertService.apiError(err),
        );
    }

    refreshLocalStorage(appPref: ApplicationPreferences) {
        appPref.sliderVisuals.sort(function (a, b) {
            return a.id - b.id;
        });
        localStorage.setItem('applicationPreferences', JSON.stringify(appPref));
    }

    getLocalStorage(keyValue: string): boolean {
        return Boolean(localStorage.getItem(keyValue));
    }

    transform(url) {
        return this._domSanitizer.bypassSecurityTrustResourceUrl(url);
    }

    calculateSizeMegaByteImage(base64String: string) {
        return (Math.ceil(base64String.length / 4) * 3) / 1e6;
    }

    compressImage(src, newX, newY) {
        return new Promise((res, rej) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                const elem = document.createElement('canvas');
                elem.width = newX;
                elem.height = newY;
                const ctx = elem.getContext('2d');
                ctx.drawImage(img, 0, 0, newX, newY);
                const data = ctx.canvas.toDataURL();
                res(data);
            };
            img.onerror = (error) => rej(error);
        });
        return src;
    }

    getPreloaderMessage() {
        this.preloaderMessage = this.translateService.instant('PRELOADER.ONE_MOMENT');
        return this.preloaderMessage;
    }

    async lazyLoadQuickLinks() {
        const { QuicklinksComponent } = await import(
            '../features/quicklink/components/quicklinks/quicklinks.component'
        );
        setTimeout(() => {
            this.lazyQuickLinksVcRef.clear();
            const quicklinks = this.lazyQuickLinksVcRef.createComponent(
                this.cfr.resolveComponentFactory(QuicklinksComponent),
            );
            quicklinks.instance.quicklinksGroupsCurrent.subscribe(($event: any) => {
                this.quicklinksGroupsHandler($event);
            });
        }, 100);
    }
}
