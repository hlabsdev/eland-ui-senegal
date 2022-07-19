import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Circle } from '@app/core/models/territory/circle.model';
import { Country } from '@app/core/models/territory/country.model';
import { District } from '@app/core/models/territory/district.model';
import { Division } from '@app/core/models/territory/division.model';
import { Region } from '@app/core/models/territory/region.model';
import { PreloaderService } from '@app/core/services/preloader.service';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-params-territory',
    templateUrl: './territory.component.html',
})
export class TerritoryComponent implements OnInit {
    isCountry = false;
    isRegion = false;
    isCircle = false;
    isDivision = false;
    isDistrict = false;
    territory: string;
    baseTerritories = ['Country', 'Region', 'Circle', 'Division', 'District'];
    translatedTerritories: any = {};
    territories: MenuItem[];

    // preloading
    preloaderMessage: string;
    subParamCountryToPreload: Country[];
    subParamRegionToPreload: Region[];
    subParamCircleToPreload: Circle[];
    subParamCommuneToPreload: Division[];
    subParamDistrictToPreload: District[];

    preloaderConfig = {
        fgsType: SPINNER.pulse,
        fgsColor: 'rgba(255,255,255,1)',
        bgsColor: 'rgba(0,92,202,1)',
        overlayColor: 'rgba(0,92,202,0.71)',
        pbColor: 'rgba(255,255,255,0.55)',
        fgsSize: 50,
        logoPosition: POSITION.topRight,
        logoSize: 100,
        logoUrl: '',
        pbThickness: 4,
        textPosition: POSITION.centerCenter,
        textColor: 'rgba(255,255,255,1)',
    };

    @ViewChild('lazyRegion', { read: ViewContainerRef })
    private lazyRegionVcRef: ViewContainerRef;

    @ViewChild('lazyDivision', { read: ViewContainerRef })
    private lazyDivisionVcRef: ViewContainerRef;

    @ViewChild('lazyCircle', { read: ViewContainerRef })
    private lazyCircleVcRef: ViewContainerRef;

    @ViewChild('lazyDistrict', { read: ViewContainerRef })
    private lazyDistrictVcRef: ViewContainerRef;

    @ViewChild('lazyCountry', { read: ViewContainerRef })
    private lazyCountryVcRef: ViewContainerRef;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private translateService: TranslateService,
        private ngxLoader: NgxUiLoaderService,
        private preloaderService: PreloaderService,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
    ) {
        this.setTransalation().subscribe((translated) => {
            this.translatedTerritories = translated;
            this.setTerritories();
        });
    }

    ngOnInit() {
        this.setTransalation().subscribe((translated) => {
            this.translatedTerritories = translated;
            this.setTerritories();
            this.checkTerritoryState();
        });

        this.route.queryParams.subscribe((params: { territory: string }) => {
            if (params.territory) {
                this.territory = params.territory;
                this.lazyLoadComponent(this.territory);
                this.setTransalation().subscribe((translated) => {
                    this.translatedTerritories = translated;
                    this.setTerritories();
                });
            } else {
                this.territory = 'Country';
                this.lazyLoadComponent(this.territory);
                this.router.navigate(['/parameters'], {
                    queryParams: { param: 'territory', territory: 'Country' },
                    queryParamsHandling: 'preserve',
                });
            }
        });
    }

    async lazyLoadComponent(territory: string) {
        setTimeout(() => {
            if (territory === 'Region') {
                this.loadRegion();
            } else if (territory === 'Country') {
                this.loadCountry();
            } else if (territory === 'Circle') {
                this.loadCircle();
            } else if (territory === 'District') {
                this.loadDistrict();
            } else if (territory === 'Division') {
                this.loadDivision();
            }
        }, 100);
    }

    async loadRegion() {
        const { RegionComponent } = await import('./region/region.component');
        this.lazyRegionVcRef.clear();
        this.lazyRegionVcRef.createComponent(this.cfr.resolveComponentFactory(RegionComponent));
    }

    async loadCircle() {
        const { CircleComponent } = await import('./circle/circle.component');
        this.lazyCircleVcRef.clear();
        this.lazyCircleVcRef.createComponent(this.cfr.resolveComponentFactory(CircleComponent));
    }

    async loadDistrict() {
        const { DistrictComponent } = await import('./district/district.component');
        this.lazyDistrictVcRef.clear();
        this.lazyDistrictVcRef.createComponent(this.cfr.resolveComponentFactory(DistrictComponent));
    }

    async loadCountry() {
        const { CountryComponent } = await import('./country/country.component');
        this.lazyCountryVcRef.clear();
        this.lazyCountryVcRef.createComponent(this.cfr.resolveComponentFactory(CountryComponent));
    }

    async loadDivision() {
        const { DivisionComponent } = await import('./division/division.component');
        this.lazyDivisionVcRef.clear();
        this.lazyDivisionVcRef.createComponent(this.cfr.resolveComponentFactory(DivisionComponent));
    }

    // checking the active territory
    checkTerritoryState() {
        const initialTerritory = this.territories.find(
            (element) => element.label === this.translateService.instant('PARAMETERS.TERRITORY.COUNTRY.TITLE'),
        );
        if (this.territories.every((_territory) => _territory.expanded === false)) {
            initialTerritory.expanded = true;
        }
    }

    setTransalation() {
        const set$ = [];
        for (const territory of this.baseTerritories) {
            set$.push(`PARAMETERS.TERRITORY.${territory.toUpperCase()}.TITLE`);
        }
        return this.translateService.get(set$);
    }

    setTerritories() {
        this.territories = [];
        for (const territory of this.baseTerritories) {
            this.territories.push({
                label: this.translatedTerritories[`PARAMETERS.TERRITORY.${territory.toUpperCase()}.TITLE`],
                routerLink: ['/parameters'],
                queryParams: { territory },
                queryParamsHandling: 'merge',
                expanded: this.territory === territory,
                command: (e: any) => {
                    e.item.expanded = true;
                    const currentTerritory = territory.toLowerCase();
                    this.preloaderService.setTerritoryTypeToPreload(currentTerritory);
                    this.preloadTerritory(currentTerritory);
                },
            });
        }
        // data to preload
        this.preloaderService.setTerritoriesToPreload(this.territories);
    }

    preloadTerritory(_territoryName: string) {
        // init preloading
        this.ngxLoader.startLoader('loader-territory');
        this.preloaderMessage = this.getPreloaderMessage(_territoryName);
        // stopping the initial preloading
        this.ngxLoader.stopLoader('loader-territory');
    }
    // Territories sub-parameters
    getPreloaderMessage(_paramToPreloadName: string) {
        if (_paramToPreloadName === 'country') {
            this.preloaderService.currentCountriesToPreload.subscribe((_subParamToPreload: Country[]) => {
                this.subParamCountryToPreload = _subParamToPreload;
            });
            if (this.subParamCountryToPreload.length === 0) {
                return '...';
            } else if (this.subParamCountryToPreload.length === 1) {
                return (
                    this.translateService.instant('PRELOADER.ONE_MOMENT') +
                    ', ' +
                    this.subParamCountryToPreload.length +
                    ' ' +
                    this.translateService.instant('PRELOADER.PARAMETERS.TERRITORY.COUNTRY') +
                    ' ' +
                    this.translateService.instant('PRELOADER.IS_LOADING') +
                    '.'
                );
            } else {
                return (
                    this.translateService.instant('PRELOADER.ONE_MOMENT') +
                    ', ' +
                    this.subParamCountryToPreload.length +
                    ' ' +
                    this.translateService.instant('PRELOADER.PARAMETERS.TERRITORY.COUNTRIES') +
                    ' ' +
                    this.translateService.instant('PRELOADER.ARE_LOADING') +
                    '.'
                );
            }
        } else if (_paramToPreloadName === 'region') {
            this.preloaderService.currentRegionsToPreload.subscribe((_subParamToPreload: Region[]) => {
                this.subParamRegionToPreload = _subParamToPreload;
            });
            if (this.subParamRegionToPreload.length === 0) {
                return '...';
            } else if (this.subParamRegionToPreload.length === 1) {
                return (
                    this.translateService.instant('PRELOADER.ONE_MOMENT') +
                    ', ' +
                    this.subParamRegionToPreload.length +
                    ' ' +
                    this.translateService.instant('PRELOADER.PARAMETERS.TERRITORY.REGION') +
                    ' ' +
                    this.translateService.instant('PRELOADER.IS_LOADING') +
                    '.'
                );
            } else {
                return (
                    this.translateService.instant('PRELOADER.ONE_MOMENT') +
                    ', ' +
                    this.subParamRegionToPreload.length +
                    ' ' +
                    this.translateService.instant('PRELOADER.PARAMETERS.TERRITORY.REGIONS') +
                    ' ' +
                    this.translateService.instant('PRELOADER.ARE_LOADING') +
                    '.'
                );
            }
        } else if (_paramToPreloadName === 'circle') {
            this.preloaderService.currentCirclesToPreload.subscribe((_subParamToPreload: Circle[]) => {
                this.subParamCircleToPreload = _subParamToPreload;
            });
            if (this.subParamCircleToPreload.length === 0) {
                return '...';
            } else if (this.subParamCircleToPreload.length === 1) {
                return (
                    this.translateService.instant('PRELOADER.ONE_MOMENT') +
                    ', ' +
                    this.subParamCircleToPreload.length +
                    ' ' +
                    this.translateService.instant('PRELOADER.PARAMETERS.TERRITORY.CIRCLE') +
                    ' ' +
                    this.translateService.instant('PRELOADER.IS_LOADING') +
                    '.'
                );
            } else {
                return (
                    this.translateService.instant('PRELOADER.ONE_MOMENT') +
                    ', ' +
                    this.subParamCircleToPreload.length +
                    ' ' +
                    this.translateService.instant('PRELOADER.PARAMETERS.TERRITORY.CIRCLES') +
                    ' ' +
                    this.translateService.instant('PRELOADER.ARE_LOADING') +
                    '.'
                );
            }
        } else if (_paramToPreloadName === 'division') {
            this.preloaderService.currentDivisionsToPreload.subscribe((_subParamToPreload: Division[]) => {
                this.subParamCommuneToPreload = _subParamToPreload;
            });
            if (this.subParamCommuneToPreload.length === 0) {
                return '...';
            } else if (this.subParamCommuneToPreload.length === 1) {
                return (
                    this.translateService.instant('PRELOADER.ONE_MOMENT') +
                    ', ' +
                    this.subParamCommuneToPreload.length +
                    ' ' +
                    this.translateService.instant('PRELOADER.PARAMETERS.TERRITORY.COMMUNE') +
                    ' ' +
                    this.translateService.instant('PRELOADER.IS_LOADING') +
                    '.'
                );
            } else {
                return (
                    this.translateService.instant('PRELOADER.ONE_MOMENT') +
                    ', ' +
                    this.subParamCommuneToPreload.length +
                    ' ' +
                    this.translateService.instant('PRELOADER.PARAMETERS.TERRITORY.COMMUNES') +
                    ' ' +
                    this.translateService.instant('PRELOADER.ARE_LOADING') +
                    '.'
                );
            }
        } else if (_paramToPreloadName === 'district') {
            this.preloaderService.currentDistrictsToPreload.subscribe((_subParamToPreload: District[]) => {
                this.subParamDistrictToPreload = _subParamToPreload;
            });
            if (this.subParamDistrictToPreload.length === 0) {
                return '...';
            } else if (this.subParamDistrictToPreload.length === 1) {
                return (
                    this.translateService.instant('PRELOADER.ONE_MOMENT') +
                    ', ' +
                    this.subParamDistrictToPreload.length +
                    ' ' +
                    this.translateService.instant('PRELOADER.PARAMETERS.TERRITORY.DISTRICT') +
                    ' ' +
                    this.translateService.instant('PRELOADER.IS_LOADING') +
                    '.'
                );
            } else {
                return (
                    this.translateService.instant('PRELOADER.ONE_MOMENT') +
                    ', ' +
                    this.subParamDistrictToPreload.length +
                    ' ' +
                    this.translateService.instant('PRELOADER.PARAMETERS.TERRITORY.DISTRICTS') +
                    ' ' +
                    this.translateService.instant('PRELOADER.ARE_LOADING') +
                    '.'
                );
            }
        }
    }

    // TODO :: FINISH NAVIGATION ADD EDITOR FOR EVERYONE OF THEM
}
