import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { UtilService } from '@app/core/utils/util.service';
import { RowSizes } from '@app/core/models/rowSize.model';
import { Component, ComponentFactoryResolver, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { BlockerRRR } from './model/blocker-rrr.model';
import Utils from '@app/core/utils/utils';
import * as _ from 'lodash';
import { RRRValidation } from '@app/admin/rrr-validation/model/rrr-validation.model';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { TableConfig } from '@app/core/models/tableConfig';
import { TableCols } from '@app/core/models/tableCols';

@Component({
    selector: 'app-blocker-rrrs',
    templateUrl: './blocker-rrrs.component.html',
})
export class BlockerRRRsComponent implements OnInit {
    @Input() rrrValidation: RRRValidation;
    @Input() readOnly: boolean;

    rowSizes: any = RowSizes;
    blockerRRRs: BlockerRRR[];
    blockerRRR: any = null;
    errorMessage: string;

    @ViewChild('lazyBlockerRrrElement', { read: ViewContainerRef })
    private lazyBlockerRrrElementVcRef: ViewContainerRef;

    tableConfig: TableConfig = {
        title: this.translateService.instant('RRR_VALIDATION.BLOCKER_RRR.TITLE'),
        titleTooltip: this.translateService.instant('RRR_VALIDATION.BLOCKER_RRR.TITLE'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'blockerRrrs',
        displayAction: false,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        enableExport: true,
        enableReload: false,
        addBtn: false,
        searchBarField: ['blockerRRRValidationId', 'requireConfirmation'],
        actions: [{
            type: 'custom',
            callback: 'custom',
        }]
    }

    cols: TableCols[] = [];

    constructor(
        private translateService: TranslateService,
        private utilService: UtilService,
        private alertService: AlertService,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
    ) {}

    ngOnInit(): void {
        this.blockerRRRs = [];
        this.loadBlockerRRRs();

        this.cols = [
            {
                field: 'blockerRRRValidationId',
                header: this.translateService.instant('RRR_VALIDATION.BLOCKER_RRR.ROLE'),
                sortable: true, 
                filterable: true, 
                type: 'text'
            },
            {
                field: 'requireConfirmation',
                header: this.translateService.instant('RRR_VALIDATION.BLOCKER_RRR.REQUIRE'),
                sortable: true, 
                filterable: true, 
                type: 'text'
            },
        ];

        this.tableConfig.addBtn = !this.readOnly;
        this.tableConfig.displayAction = !this.readOnly;
    }

    loadBlockerRRRs() {
        // TODO:  commented for te future use of blocker rrrs
    }

    showBlockerRRRElementDialogue(blockerRRR: BlockerRRR = new BlockerRRR({})): void {
        this.blockerRRR = blockerRRR;
        this.lazyLoadBlockerRrrElement();
    }

    saveBlockerRRR(blockerRRR) {
        if (!blockerRRR.id) {
            blockerRRR.id = Utils.uuidv4();
            this.rrrValidation.blockerRRRs.push(blockerRRR);
        } else {
            _.remove(this.rrrValidation.blockerRRRs, (br) => br.id === blockerRRR.id);
            this.rrrValidation.blockerRRRs.push(blockerRRR);
        }

        this.alertService.success('RRR_VALIDATION.MESSAGES.SAVE_SUCCESS');
        this.loadBlockerRRRs();
        this.blockerRRR = null;
    }

    canceled() {
        this.loadBlockerRRRs();
        this.blockerRRR = null;
    }

    removeBlockerRRR(blockerRRR) {
        this.utilService.displayConfirmationDialogWithMessageParameters(
            'RRR_VALIDATION.MESSAGES.CONFIRM_DELETE',
            { blockerRRR: blockerRRR.blockerRRRValidationId },
            () => {
                _.remove(this.rrrValidation.blockerRRRs, (br) => br.id === blockerRRR.id);
                this.alertService.success('RRR_VALIDATION.MESSAGES.DELETE_SUCCESS');
            },
            () => {},
        );
    }

    async lazyLoadBlockerRrrElement() {
        const { BlockerRRRElementComponent } = await import('./blocker-rrr-element.component');
        if (this.blockerRRR) {
            setTimeout(() => {
                this.lazyBlockerRrrElementVcRef.clear();
                const item = this.lazyBlockerRrrElementVcRef.createComponent(
                    this.cfr.resolveComponentFactory(BlockerRRRElementComponent),
                );
                item.instance.blockerRRR = this.blockerRRR;
                item.instance.saved.subscribe(($event) => {
                    this.saveBlockerRRR($event);
                });
                item.instance.canceled.subscribe(() => {
                    this.canceled();
                });
            }, 100);
        }
    }
}
