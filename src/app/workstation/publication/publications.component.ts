import { FormTemplateBaseComponent } from '@app/workstation/baseForm/form-template-base.component';
import { PublicationService } from '@app/core/services/publication.service';
import { Publication } from '@app/core/models/publication.model';
import { Router } from '@angular/router';
import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    ComponentFactoryResolver,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { ErrorResult } from '@app/core/utils/models/errorResult.model';
import { LocaleDatePipe } from '@app/core/utils/localeDate.pipe';
import { UtilService } from '@app/core/utils/util.service';
import { RowSizes } from '@app/core/models/rowSize.model';
import * as _ from 'lodash';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TableCols } from '@app/core/models/tableCols';
import { TableConfig } from '@app/core/models/tableConfig';

@Component({
    templateUrl: 'publications.component.html',
    selector: 'app-publications',
    providers: [LocaleDatePipe],
})
export class PublicationsComponent extends FormTemplateBaseComponent implements OnInit {
    @Input() formVariables: FormVariables = new FormVariables({});
    @Input() picker = false;
    @Input() publication: Publication;
    @Input() publications: Publication[];

    @Output() add = new EventEmitter<Publication>();
    @Output() publicationPickerSave = new EventEmitter<any>();
    @Output() publicationPickerDelete = new EventEmitter<any>();

    publicationUrl: boolean;
    sameEndPointRoute: boolean;
    rowSizes: any = RowSizes;
    persistToDb: boolean;
    errorMessage: string;

    preloaderMessage = '...';

    tableConfig: TableConfig = {
        title: this.translateService.instant('HEADER.PUBLICATIONS'),
        titleTooltip: this.translateService.instant('HEADER.PUBLICATIONS'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'publications',
        displayAction: false,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        enableExport: true,
        enableReload: true,
        searchBarField: ['target.description', 'name.description', 'number', 'dateFormatted', 'titleNumber', 'applicationNumber'],
    }

    cols: TableCols[] = [];

    @ViewChild('lazyPublication', { read: ViewContainerRef })
    private lazyPublicationVcRef: ViewContainerRef;

    constructor(
        private publicationService: PublicationService,
        public translateService: TranslateService,
        protected router: Router,
        private alertService: AlertService,
        private datePipe: LocaleDatePipe,
        private utilService: UtilService,
        private ngxLoader: NgxUiLoaderService,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
    ) {
        super();
    }

    ngOnInit(): void {
        this.publicationUrl = this.router.url === '/publications';
        this.sameEndPointRoute = this.router.url.includes('/publications');
        this.tableConfig.customData = {"sameEndPointRoute" : this.sameEndPointRoute};

        if (!this.formVariables.baUnit.uid && !this.sameEndPointRoute) {
            this.errorMessage = new ErrorResult('MESSAGES.BA_UNIT_REQUIRED').toMessage();
            return;
        }

        this.getPublications();
    }

    getPublications(search = '') {
        this.ngxLoader.start();
        const args = {
            baUnitId: this.formVariables.baUnit.uid,
            baUnitIdVersion: this.formVariables.baUnit.version,
        };

        const getPubs$ = this.sameEndPointRoute
            ? this.publicationService.getPublications()
            : this.publicationService.getPublicationsByBaUnit(args);

        getPubs$.subscribe(
            (result) => {
                this.publications = [];

                for (const publication of result) {
                    publication['dateFormatted'] = this.datePipe.transform(publication.date, 'shortDate');
                    this.publications.push(publication);
                }

                this.cols = [
                    { field: 'target.description', header: this.translateService.instant('PUBLICATION.TARGET'), sortable: true, filterable: true, type: 'text' },
                    { field: 'name.description', header: this.translateService.instant('PUBLICATION.NAME'), sortable: true, filterable: true, type: 'text' },
                    { field: 'number', header: this.translateService.instant('PUBLICATION.NUMBER'), sortable: true, filterable: true, type: 'text' },
                    { field: 'dateFormatted', header: this.translateService.instant('PUBLICATION.DATE'), sortable: true, filterable: true, type: 'date' },
                ];

                if (this.sameEndPointRoute) {
                    this.cols.splice(
                        0,
                        0,
                        { field: 'titleNumber', header: this.translateService.instant('PUBLICATION.TITLE_NUMBER'), sortable: true, filterable: true, type: 'date' },
                        {
                            field: 'applicationNumber',
                            header: this.translateService.instant('PUBLICATION.APPLICATION_NUMBER'), sortable: true, filterable: true, type: 'date'
                        },
                    );
                }
                this.ngxLoader.stop();
            },
            (err) => this.alertService.apiError(err),
        );
    }

    showPublicationDialog(publication = null): void {
        this.publication = publication ? publication : new Publication();
        this.lazyLoadPublication();
    }

    async lazyLoadPublication() {
        const { PublicationComponent } = await import('./publication/publication.component');
        if (this.publication && !this.picker) {
            setTimeout(() => {
                this.lazyPublicationVcRef.clear();
                const publication = this.lazyPublicationVcRef.createComponent(
                    this.cfr.resolveComponentFactory(PublicationComponent),
                );
                publication.instance.publication = this.publication;
                publication.instance.persistToDB = this.persistToDb;
                publication.instance.readOnly = this.formVariables.isReadOnly || this.publicationUrl;
                publication.instance.publicationUrl = this.publicationUrl;
                publication.instance.formVariables = this.formVariables;
                publication.instance.canceled.subscribe(() => {
                    this.cancelPublication();
                });
                publication.instance.saved.subscribe(($event: any) => {
                    this.savePublication($event);
                });
            }, 100);
        }
    }

    savePublication(publication) {
        const index = _.findIndex(this.publications, this.publication);
        if (index > -1) {
            this.publications[index] = publication.val;
        } else {
            this.publications.push(publication.val);
        }
        this.cancelPublication();
        this.getPublications();
    }

    removePublication(publication: Publication) {
        this.utilService.displayConfirmationDialog('MESSAGES.CONFIRM_DELETE', () => {
            this.removePublicationAction(publication);
        });
    }

    removePublicationAction(publication: Publication) {
        const index = _.findIndex(this.publications, publication);
        if (index > -1) {
            this.publications.splice(index, 1);
        }
        this.publicationService.deletePublication(publication.id);
    }

    cancelPublication() {
        this.publication = null;
    }

    reload(){
        this.getPublications();
    }
}
