import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ComponentFactoryResolver,
    ViewContainerRef,
    ViewChild,
} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { FormGroupDirective, NgForm } from '@angular/forms';
import { map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { CodeList } from '@app/core/models/codeList.model';
import { CodeListService } from '@app/core/services/codeList.service';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { UtilService } from '@app/core/utils/util.service';
import { ValidationService } from '@app/core/utils/validation.service';
import { TranslateService } from '@ngx-translate/core';
import { SectionsService } from '@app/admin/parameters/translation/sections.service';
import { TranslationRepository } from '@app/translation/translation.repository';
import { DialogConfig } from '@app/core/models/dialogConfig';
import { throws } from 'assert';

@Component({
    selector: 'app-codelist',
    templateUrl: 'codeList.component.html',
    styleUrls: ['./codeList.component.scss'],
})
export class CodeListComponent implements OnInit {
    @Input() codeList: CodeList = new CodeList();
    @Input() sourceRRRconfig: boolean;
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    @Output() onClose = new EventEmitter();
    @Output() refresh = new EventEmitter();
    codeListTypes: SelectItem[];
    codeListType: string;
    titleCodeList: string;
    errorMessage: string;
    readOnlyType: boolean;

    @ViewChild('lazyTranslationPanel', { read: ViewContainerRef })
    private lazyTranslationPanelVcRef: ViewContainerRef;

    @ViewChild('form') form: FormGroupDirective; 

    dialogConfig = {
        display: true,
        title: '',
        canSave: true,
        showAction: true,
        tabs: [
            { name: this.translateService.instant('COMMON.FORMS.INFORMATIONS'), required: true },
            { name: this.translateService.instant('COMMON.FORMS.TRADUCTIONS'), required: false, warning: false, disabled: true }
        ]
    };

    constructor(
        private codeListService: CodeListService,
        private route: ActivatedRoute,
        private alertService: AlertService,
        private utilService: UtilService,
        private router: Router,
        protected translateService: TranslateService,
        public validationService: ValidationService,
        private sectionsService: SectionsService,
        private translationRepo: TranslationRepository,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
    ) {}

    ngOnInit() {  
        this.dialogConfig.title = this.translateService.instant('COMMON.ACTIONS.ADD');
        this.codeListService.getCodeListTypes().subscribe((codeListTypes) => {
            this.codeListTypes = codeListTypes.map((o) => o.toSelectItem());
            this.codeListTypes.forEach((cl) => {
                this.translateService.get(`CODELIST.TYPES.${cl.value}`).subscribe((label) => (cl.label = label));
            });

            return this.codeListTypes.unshift(this.utilService.getSelectPlaceholder());
        });

        const routeObs = this.route.params.subscribe((params: Params) => {
            this.titleCodeList = '';
            const id = this.codeList && this.codeList.codeListID ? this.codeList.codeListID : params['codeListId'];
            const codeListObs = id && id !== ' ' ? this.codeListService.getCodeList(id) : of(new CodeList());
            codeListObs.subscribe((codeList) => {
                const type = this.codeList.type;
                this.readOnlyType = this.codeList && this.codeList.type && this.codeList.type.length > 0;
                this.codeList = codeList;
                this.sectionsService.selectCurrentSectionItemByTranslationKey(
                    this.codeList.value,
                    'CODELIST.VALUES',
                    !!this.codeList.id,
                );
                this.codeList.type = this.codeList && this.codeList.codeListID ? this.codeList.type : type;
                if (this.codeList.type) {
                    this.titleCodeList = `CODELIST.TYPES.${this.codeList.type}`;
                    this.dialogConfig.title = this.translateService.instant('COMMON.ACTIONS.EDIT') + ': ' + this.translateService.instant(this.titleCodeList);
                }
            });
            return codeListObs;
        });
    }

    async lazyLoadComponent() {
        this.lazyTranslationPanelVcRef.clear();
        const { SectionItemTranslationPanelComponent } = await import(
            '../../parameters/translation/sectionItem/sectionItemTranslationPanel.component'
        );
        const translationPanel = this.lazyTranslationPanelVcRef.createComponent(
            this.cfr.resolveComponentFactory(SectionItemTranslationPanelComponent),
        );
        translationPanel.instance.options = { localSave: !!this.codeList.id };
    }

    save(codeList: CodeList, form: NgForm) {
        if (form.invalid) {
            const errorResult = this.validationService.validateForm(form);
            this.errorMessage = errorResult.toMessage();
            return this.alertService.error(errorResult.message);
        }

        const currentSectionItem = this.sectionsService.getCurrentSectionItem();
        currentSectionItem.key = this.codeList.value;
        this.translationRepo.sectionItem
            .setOne(currentSectionItem.simplify())
            .pipe(
                mergeMap(() =>
                    codeList.codeListID
                        ? this.codeListService.updateCodeList(codeList)
                        : this.codeListService.createCodeList(codeList),
                ),
            )
            .subscribe(
                () => {
                    this.alertService.success('API_MESSAGES.SAVE_SUCCESSFUL');
                    this.refresh.emit(true);
                    this.close();
                },
                (err) => this.alertService.apiError(err),
            );
    }

    goToList = () => this.close();

    close() {
        if (this.sourceRRRconfig) {
            this.router.navigate(['administration/rrrs']);
        } else {
            this.router.navigate(['administration/code-lists']);
        }
        this.onClose.emit(true);
    }

    next = (activeTab: number) => this.lazyLoadComponent();

    saveBtn = () => this.form.ngSubmit.emit();

    cancel = () => console.log('cancel');
}
