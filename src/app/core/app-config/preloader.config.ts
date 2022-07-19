import { NgxUiLoaderConfig, PB_DIRECTION, POSITION, SPINNER } from 'ngx-ui-loader';

// to be reworked relatively to the - dynamic/customizable -branding norms
export const ngxUiLoaderConfig: NgxUiLoaderConfig = {
    bgsColor: 'rgba(0,92,202,0.975)',
    bgsOpacity: 1,
    bgsPosition: POSITION.bottomRight,
    bgsType: SPINNER.ballSpinClockwiseFadeRotating,
    fgsType: SPINNER.ballSpinClockwiseFadeRotating,
    fgsColor: 'rgba(0,92,202,0.975)',
    fgsPosition: POSITION.centerCenter,
    blur: 15,
    delay: 0,
    fastFadeOut: true,
    fgsSize: 55,
    bgsSize: 40,
    gap: 24,
    logoPosition: POSITION.centerCenter,
    logoSize: 120,
    logoUrl: 'assets/layout/images/eland-logo-type-mark-w.svg',
    overlayBorderRadius: '0',
    overlayColor: 'rgba(40, 40, 40, 0.8)',
    pbColor: 'rgba(0,92,202,1)',
    pbDirection: PB_DIRECTION.leftToRight,
    pbThickness: 5,
    hasProgressBar: true,
    text: 'One moment please, the page is loading..',
    textColor: '#FFFFFF',
    textPosition: POSITION.centerCenter,
    maxTime: -1,
    minTime: 500,
};

export const noBackgroundPreloading: string[] = [
    'administration/parameters',
    'administration/parameters?param=territory&territory=Country',
    'administration/parameters?param=territory&territory=Region',
    'administration/parameters?param=territory&territory=Circle',
    'administration/parameters?param=territory&territory=Division',
    'administration/parameters?param=territory&territory=District',
];
