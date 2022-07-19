import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { CodeListService } from '@app/core/services/codeList.service';
import { UtilService } from '@app/core/utils/util.service';
import { SelectItem } from 'primeng/api';
import { BlockerRRR } from './model/blocker-rrr.model';
import { RRRService } from '@app/workstation/rrr/rrr/rrr.service';

@Component({
    selector: 'app-blocker-rrr-element',
    templateUrl: './blocker-rrr-element.component.html',
})
export class BlockerRRRElementComponent implements OnInit {
    @Input() blockerRRR: BlockerRRR = new BlockerRRR({});

    @Output() saved = new EventEmitter<BlockerRRR>();
    @Output() canceled = new EventEmitter();

    errorMessage: string;
    partyRoles: SelectItem[];

    constructor(
        protected codeListService: CodeListService,
        protected alertService: AlertService,
        protected rrrService: RRRService,
        protected utilService: UtilService,
    ) {}

    ngOnInit(): void {
        // ..
        this.loadPartyRoles();
    }

    loadPartyRoles() {
        this.utilService
            .mapToSelectItems(
                this.rrrService.getRestrictionSubTypes(),
                'RRR.RESTRICTION_TYPES',
                'value',
                'COMMON.ACTIONS.SELECT',
            )
            .subscribe((restrictionTypes: SelectItem[]) => {
                this.partyRoles = restrictionTypes;
            });
    }

    cancel() {
        this.canceled.emit();
    }

    save(blockerRRR: BlockerRRR) {
        if (!blockerRRR.blockerRRRValidationId) {
            return;
        }
        this.saved.emit(blockerRRR);
    }
}
