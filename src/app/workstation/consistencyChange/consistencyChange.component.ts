import { Component, ComponentFactoryResolver, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { BAUnitService } from '../baUnit/baUnit.service';
import { TranslateService } from '@ngx-translate/core';
import { RowSizes } from '@app/core/models/rowSize.model';
import { Task } from '@app/core/models/task.model';
import { TaskService } from '@app/core/services/task.service';
import { ConsistencyChangeService } from './consistencyChange.service';
import {
    ConsistencyChange,
    ConsistencyChangeGroup,
    ConsistencyChangeGroupAction,
    ConsistencyChangeType,
} from '../../core/models/consistencyChange.model';
import { FormVariables } from '../baseForm/formVariables.model';

@Component({
    selector: 'app-consistency-change',
    templateUrl: 'consistencyChange.component.html',
    styleUrls: ['consistencyChange.component.scss'],
})
export class ConsistencyChangeComponent implements OnInit {
    rowSizes: any = RowSizes;
    @Input() formVariables: FormVariables = new FormVariables({});
    @Input() task: Task;
    groupId: string;
    canMultiSelect: boolean;
    action: ConsistencyChangeGroupAction;
    currentCCG: ConsistencyChangeGroup;
    currentCCS: ConsistencyChange[];
    hasSource: boolean;
    hasDestination: boolean;
    source: ConsistencyChange;
    destination: ConsistencyChange;
    filters = {
        destination: ConsistencyChangeType.DESTINATION,
        source: ConsistencyChangeType.SOURCE,
    };
    cols = [
        { field: 'name', header: this.translateService.instant('FORMS_GROUP.NAME'), width: '40%' },
        { field: 'description', header: this.translateService.instant('FORMS_GROUP.DESCRIPTION'), width: '60%' },
    ];
    ShowSelection = false;
    selectedItem: any;
    currentCC;

    @ViewChild('lazyCcItem', { read: ViewContainerRef })
    private lazyCcItemVcRef: ViewContainerRef;

    @ViewChild('lazyCcItemDestination', { read: ViewContainerRef })
    private lazyCcItemDestinationVcRef: ViewContainerRef;

    constructor(
        private bAUnitService: BAUnitService,
        private translateService: TranslateService,
        private taskService: TaskService,
        private consistencyChangeService: ConsistencyChangeService,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
    ) {}

    setSelectedItem(item) {
        this.selectedItem = item;
        this.ShowSelection = true;
    }

    ngOnInit() {
        this.groupId = this.formVariables.getPath('consistencyChangeGroupId');
        this.action = this.formVariables.getPath('consistencyChangeGroupAction');
        if (!this.groupId) {
            // create the ccg
            this.consistencyChangeService.ccg
                .create(
                    new ConsistencyChangeGroup({
                        action: this.action || ConsistencyChangeGroupAction.PARTITION,
                    }),
                )
                .subscribe((ccg: ConsistencyChangeGroup) => {
                    this.currentCCG = ccg;
                    this.taskService
                        .putTaskVariable(this.task, 'consistencyChangeGroupId', { type: 'string', value: ccg.id })
                        .subscribe();
                    this.getAndSetConsistencyChangeElementsByConsistencyChangeGroupId(this.groupId);
                });
        } else {
            this.consistencyChangeService.ccg.get(this.groupId).subscribe((ccg: ConsistencyChangeGroup) => {
                this.currentCCG = ccg;
            });
            this.getAndSetConsistencyChangeElementsByConsistencyChangeGroupId(this.groupId);
        }
    }
    getAndSetConsistencyChangeElementsByConsistencyChangeGroupId(ccgId: string) {
        this.consistencyChangeService.cc.all(this.groupId).subscribe((ccs: ConsistencyChange[]) => {
            this.currentCCS = ccs;
        });
    }

    createCCGDest() {
        this.canMultiSelect = this.currentCCG.isPartition();
        this.currentCC = new ConsistencyChange({
            groupId: this.currentCCG.id,
            type: ConsistencyChangeType.DESTINATION,
        });
    }
    createCCGSource() {
        this.canMultiSelect = this.currentCCG.isFusion();
        this.currentCC = new ConsistencyChange({
            groupId: this.currentCCG.id,
            type: ConsistencyChangeType.SOURCE,
        });
    }
    ccSave(ccs: ConsistencyChange[]) {
        ccs.forEach((cc) => {
            this.destination = cc.type.isEqual(ConsistencyChangeType.DESTINATION) ? cc : this.destination;
            this.source = cc.type.isEqual(ConsistencyChangeType.SOURCE) ? cc : this.source;
            this.currentCCS.push(cc);
        });
        this.canMultiSelect = null;
        this.currentCC = null;
        this.currentCCS = this.currentCCS.slice();
    }

    handleChange(e: any) {
        if (e.index === 0) {
            this.lazyLoadCcItem();
        } else if (e.index === 1) {
            this.lazyLoadCcItemDestination();
        }
    }

    async lazyLoadCcItem() {
        if (this.currentCCG?.isPartition()) {
            const { ConsistencyChangeItemComponent } = await import('./subforms/consistencyChangeItem.component');
            setTimeout(() => {
                this.lazyCcItemVcRef.clear();
                const item = this.lazyCcItemVcRef.createComponent(
                    this.cfr.resolveComponentFactory(ConsistencyChangeItemComponent),
                );
                item.instance.cci = this.source;
            }, 100);
        }
    }

    async lazyLoadCcItemDestination() {
        if (this.currentCCG?.isPartition()) {
            const { ConsistencyChangeItemComponent } = await import('./subforms/consistencyChangeItem.component');
            setTimeout(() => {
                this.lazyCcItemDestinationVcRef.clear();
                const item = this.lazyCcItemDestinationVcRef.createComponent(
                    this.cfr.resolveComponentFactory(ConsistencyChangeItemComponent),
                );
                item.instance.cci = this.destination;
            }, 100);
        }
    }
}
