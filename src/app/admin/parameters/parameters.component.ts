import {
    AfterContentInit,
    Component,
    ComponentFactoryResolver,
    OnInit,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Registry } from '@app/core/models/registry.model';
import { ResponsibleOffice } from '@app/core/models/responsibleOffice.model';
import { PreloaderService } from '@app/core/services/preloader.service';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-params',
    templateUrl: 'parameters.component.html',
})
export class ParametersComponent implements OnInit, AfterContentInit {
    // https://alligator.io/angular/query-parameters/

    selectedParam: string;
    selectedParamIndex: number;

    params = [
        {
            name: 'territory',
        },
        {
            name: 'registry',
        },
        {
            name: 'responsibleOffice',
        },
        // {
        //   name: 'forms'
        // },
        // {
        //   name: 'formsGroup'
        // }
    ];

    // preloading
    preloaderMessage: string;
    paramTerritoryToPreload: MenuItem[];
    paramRegistryToPreload: Registry[];
    paramResponsibleOfficesToPreload: ResponsibleOffice[];

    @ViewChild('lazyTerritory', { read: ViewContainerRef })
    private lazyTerritoryVcRef: ViewContainerRef;

    @ViewChild('lazyRegistry', { read: ViewContainerRef })
    private lazyRegistryVcRef: ViewContainerRef;

    @ViewChild('lazyResponsibleOffice', { read: ViewContainerRef })
    private lazyResponsibleOfficeVcRef: ViewContainerRef;

    @ViewChild('lazyForms', { read: ViewContainerRef })
    private lazyFormsVcRef: ViewContainerRef;

    @ViewChild('lazyFormsGroup', { read: ViewContainerRef })
    private lazyFormsGroupVcRef: ViewContainerRef;

    @ViewChild('lazyCaching', { read: ViewContainerRef })
    private lazyCachingVcRef: ViewContainerRef;

    @ViewChild('lazyLocale', { read: ViewContainerRef })
    private lazyLocaleVcRef: ViewContainerRef;

    @ViewChild('lazyLanguage', { read: ViewContainerRef })
    private lazyLanguageVcRef: ViewContainerRef;

    @ViewChild('lazyTranslation', { read: ViewContainerRef })
    private lazyTranslationVcRef: ViewContainerRef;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private translateService: TranslateService,
        private ngxLoader: NgxUiLoaderService,
        private preloaderService: PreloaderService,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
    ) {}

    ngOnInit(): void {
        this.loadLazyComponent();
        this.route.queryParams.subscribe((params: { param: string }) => {
            for (let i = 0; i < this.params.length; i++) {
                const param = this.params[i];
                if (param.name === params.param) {
                    this.selectedParamIndex = i;
                    this.selectedParam = params.param || undefined;
                }
            }
        });
    }

    async loadLazyComponent() {
        this.viewContainerRef.clear();
        const { TerritoryComponent } = await import('../../admin/parameters/territory/territory.component');
        this.lazyTerritoryVcRef.createComponent(this.cfr.resolveComponentFactory(TerritoryComponent));

        const { RegistryComponent } = await import('../../admin/parameters/registry/registry.component');
        this.lazyRegistryVcRef.createComponent(this.cfr.resolveComponentFactory(RegistryComponent));

        const { ResponsibleOfficeComponent } = await import(
            '../../admin/parameters/responsibleOffice/responsibleOffice.component'
        );
        this.lazyResponsibleOfficeVcRef.createComponent(this.cfr.resolveComponentFactory(ResponsibleOfficeComponent));

        const { FormsComponent } = await import('../../admin/parameters/forms/forms.component');
        this.lazyFormsVcRef.createComponent(this.cfr.resolveComponentFactory(FormsComponent));

        const { FormsGroupComponent } = await import('../../admin/parameters/formsGroup/formsGroup.component');
        this.lazyFormsGroupVcRef.createComponent(this.cfr.resolveComponentFactory(FormsGroupComponent));

        const { CachingComponent } = await import('../../admin/parameters/caching/caching.component');
        this.lazyCachingVcRef.createComponent(this.cfr.resolveComponentFactory(CachingComponent));

        const { LocaleComponent } = await import('../../admin/parameters/locale/locale.component');
        this.lazyLocaleVcRef.createComponent(this.cfr.resolveComponentFactory(LocaleComponent));

        const { LanguageComponent } = await import('../../admin/parameters/language/language.component');
        this.lazyLanguageVcRef.createComponent(this.cfr.resolveComponentFactory(LanguageComponent));

        const { SectionsComponent } = await import('../../admin/parameters/translation/sections.component');
        this.lazyTranslationVcRef.createComponent(this.cfr.resolveComponentFactory(SectionsComponent));
    }

    ngAfterContentInit(): void {
        this.initialPreload();
    }

    initialPreload() {
        // initial preloading
        this.ngxLoader.start();
        this.preloaderMessage = this.getPreloaderMessage('territory');
        // stopping the initial preloading
        this.ngxLoader.stop();
    }

    handleChange(change: any) {
        const param = change && change.index && this.params[change.index] ? this.params[change.index].name : null;
        this.selectedParamIndex = 0;
        if (param) {
            // preloading init
            this.ngxLoader.start();
            this.preloaderMessage = this.getPreloaderMessage(param);
            // router
            this.router.navigate(['administration/parameters'], { queryParams: { param } });
            // stopping the preloading
            this.ngxLoader.stop();
        }
    }

    getPreloaderMessage(_paramToPreloadName: string) {
        if (_paramToPreloadName === 'territory') {
            this.preloaderService.currentTerritoriesToPreload.subscribe((_paramToPreload: MenuItem[]) => {
                this.paramTerritoryToPreload = _paramToPreload;
            });
            if (this.paramTerritoryToPreload.length === 0) {
                return '...';
            } else if (this.paramTerritoryToPreload.length === 1) {
                return (
                    this.translateService.instant('PRELOADER.ONE_MOMENT') +
                    ', ' +
                    this.paramTerritoryToPreload.length +
                    ' ' +
                    this.translateService.instant('PRELOADER.PARAMETERS.TERRITORY.TERRITORY') +
                    ' ' +
                    this.translateService.instant('PRELOADER.IS_LOADING') +
                    '.'
                );
            } else {
                return (
                    this.translateService.instant('PRELOADER.ONE_MOMENT') +
                    ', ' +
                    this.paramTerritoryToPreload.length +
                    ' ' +
                    this.translateService.instant('PRELOADER.PARAMETERS.TERRITORY.TERRITORIES') +
                    ' ' +
                    this.translateService.instant('PRELOADER.ARE_LOADING') +
                    '.'
                );
            }
        } else if (_paramToPreloadName === 'registry') {
            this.preloaderService.currentRegistriesToPreload.subscribe((_paramToPreload: Registry[]) => {
                this.paramRegistryToPreload = _paramToPreload;
            });
            if (this.paramRegistryToPreload.length === 0) {
                return '...';
            } else if (this.paramRegistryToPreload.length === 1) {
                return (
                    this.translateService.instant('PRELOADER.ONE_MOMENT') +
                    ', ' +
                    this.paramRegistryToPreload.length +
                    ' ' +
                    this.translateService.instant('PRELOADER.PARAMETERS.REGISTRY.REGISTRY') +
                    ' ' +
                    this.translateService.instant('PRELOADER.IS_LOADING') +
                    '.'
                );
            } else {
                return (
                    this.translateService.instant('PRELOADER.ONE_MOMENT') +
                    ', ' +
                    this.paramRegistryToPreload.length +
                    ' ' +
                    this.translateService.instant('PRELOADER.PARAMETERS.REGISTRY.REGISTRIES') +
                    ' ' +
                    this.translateService.instant('PRELOADER.ARE_LOADING') +
                    '.'
                );
            }
        } else if (_paramToPreloadName === 'responsibleOffice') {
            this.preloaderService.currentResponsibleOfficesToPreload.subscribe(
                (_paramToPreload: ResponsibleOffice[]) => {
                    this.paramResponsibleOfficesToPreload = _paramToPreload;
                },
            );
            if (this.paramResponsibleOfficesToPreload.length === 0) {
                return '...';
            } else if (this.paramResponsibleOfficesToPreload.length === 1) {
                return (
                    this.translateService.instant('PRELOADER.ONE_MOMENT') +
                    ', ' +
                    this.paramResponsibleOfficesToPreload.length +
                    ' ' +
                    this.translateService.instant('PRELOADER.PARAMETERS.RESPONSIBLE_OFFICE.RESPONSIBLE_OFFICE') +
                    ' ' +
                    this.translateService.instant('PRELOADER.IS_LOADING') +
                    '.'
                );
            } else {
                return (
                    this.translateService.instant('PRELOADER.ONE_MOMENT') +
                    ', ' +
                    this.paramResponsibleOfficesToPreload.length +
                    ' ' +
                    this.translateService.instant('PRELOADER.PARAMETERS.RESPONSIBLE_OFFICE.RESPONSIBLE_OFFICES') +
                    ' ' +
                    this.translateService.instant('PRELOADER.ARE_LOADING') +
                    '.'
                );
            }
        }
    }
}
