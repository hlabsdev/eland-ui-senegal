import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';
import { ApplicationPreferences } from '@app/core/models/branding/application-preferences.model';
import { ApplicationPreferencesService } from '@app/core/services/application-preferences.service';
import { TranslateService } from '@ngx-translate/core';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { DomSanitizer } from '@angular/platform-browser';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';

export interface ElandSlide {
    visualMain: string;
    visualSecondary: string;
    titleHeaderSpan: string;
    link: string;
    disableCopy: boolean;
}

@Component({
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
    health: any;
    display = false;
    slides: ElandSlide[] = [];
    sliderConfig: SwiperConfigInterface;

    // shared application preference
    applicationPreferences: ApplicationPreferences;

    @ViewChild('lazyQuickLinks', { read: ViewContainerRef })
    private lazyQuickLinksVcRef: ViewContainerRef;

    constructor(
        private applicationPreferencesService: ApplicationPreferencesService,
        private translateService: TranslateService,
        public _domSanitizer: DomSanitizer,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
    ) {}

    ngOnInit(): void {
        const appPreference =
            this.applicationPreferencesService.getApplicationPreferenceFromStore('applicationPreferences');
        this.applicationPreferencesService.setPreferences(
            appPreference.organizationMainColor,
            appPreference.appMyTasksButtonColor,
            appPreference.appClaimsButtonColor,
            appPreference.appAllTasksButtonColor,
        );
        this.initSlider();
        this.applicationPreferences = new ApplicationPreferences();
        this.applicationPreferences.appSliderVisual_1 = appPreference.sliderVisuals[1].url;
        this.applicationPreferences.appSliderVisual_2 = appPreference.sliderVisuals[2].url;
        this.applicationPreferences.appSliderVisual_3 = appPreference.sliderVisuals[3].url;

        this.translateService.get(['HOME']).subscribe((values) => {
            this.slides = [
                {
                    visualMain: this.applicationPreferences.appSliderVisual_1,
                    visualSecondary: '',
                    titleHeaderSpan: values.HOME.SLIDER_TITLE_HEADER,
                    link: 'https://sogematech.com/en/lamp',
                    disableCopy: false,
                },
                {
                    visualMain: this.applicationPreferences.appSliderVisual_2,
                    visualSecondary: '',
                    titleHeaderSpan: '',
                    link: '',
                    disableCopy: true,
                },
                {
                    visualMain: this.applicationPreferences.appSliderVisual_3,
                    visualSecondary: '',
                    titleHeaderSpan: '',
                    link: '',
                    disableCopy: true,
                },
            ];
        });
    }

    ngAfterViewInit() {
        this.lazyLoadQuickLinks();
    }

    initSlider() {
        this.sliderConfig = {
            a11y: {
                enabled: true,
            },
            direction: 'horizontal',
            slideClass: 'eland-slide',
            freeMode: true,
            slidesPerView: 1,
            slideToClickedSlide: true,
            mousewheel: true,
            scrollbar: false,
            watchSlidesProgress: true,
            watchSlidesVisibility: true,
            navigation: false,
            pagination: false,
            keyboard: {
                enabled: true,
                onlyInViewport: false,
            },
            centeredSlides: true,
            loop: true,
            roundLengths: false,
            slidesOffsetBefore: 0,
            slidesOffsetAfter: 0,
            spaceBetween: -1,
            autoplay: {
                delay: 7000,
                disableOnInteraction: false,
            },
            speed: 2000,
            simulateTouch: true,
            effect: 'fade',
            grabCursor: false,
            passiveListeners: true,
            updateOnWindowResize: true,
            breakpoints: {
                640: {
                    slidesPerView: 1,
                },
            },
        };
    }
    showQLAddDialog() {
        this.display = true;
    }
    closeQuicklinkAddDialog() {
        this.display = false;
    }
    transform(url) {
        return this._domSanitizer.bypassSecurityTrustStyle(`url(${url})`);
    }

    async lazyLoadQuickLinks() {
        const { QuicklinksComponent } = await import(
            '../features/quicklink/components/quicklinks/quicklinks.component'
        );
        setTimeout(() => {
            this.lazyQuickLinksVcRef.clear();
            this.lazyQuickLinksVcRef.createComponent(this.cfr.resolveComponentFactory(QuicklinksComponent));
        }, 100);
    }
}
