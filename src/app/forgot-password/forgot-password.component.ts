import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';

export interface ElandSlide {
    visualMain: string;
    visualSecondary: string;
    subtitleHeader: string;
    titleHeader: string;
    link: string;
    disableCopy: boolean;
    subtitled: boolean;
}

@Component({
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
    health: any;
    display = false;
    slides: ElandSlide[];
    sliderConfig: SwiperConfigInterface;
    showPassword = false;

    constructor(private translateService: TranslateService) {
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
        this.slides = [
            {
                visualMain: '../../assets/layout/images/eland-background-cold-blue.png',
                visualSecondary: '',
                subtitleHeader: '',
                titleHeader: '',
                link: '',
                disableCopy: true,
                subtitled: false,
            },
        ];
    }

    submit() {}
}
