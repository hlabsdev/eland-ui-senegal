import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
} from '@angular/core';
import * as _ from 'lodash';
import { FormVariables } from '../../../../workstation/baseForm/formVariables.model';
import { PreregistrationFormality } from '../../../../workstation/preregistrationFormalities/preregistrationFormality/preregistrationFormality.model';

@Component({
    selector: 'dyn-panel',
    templateUrl: 'dynamic-panel.component.html',
    styleUrls: ['dynamic-panel.component.scss'],
})
export class DynamicPanelComponent implements AfterViewInit, OnChanges {
    @Input() sections: any;
    @Input() data: PreregistrationFormality;
    @Input() readOnly: boolean;
    @Input() variables: FormVariables;

    @Output() save: EventEmitter<PreregistrationFormality> = new EventEmitter<PreregistrationFormality>();
    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();
    isTwoColumn: boolean;
    column1 = [];
    column2 = [];
    filters = [];

    constructor(private el: ElementRef, private changeDetector: ChangeDetectorRef) {}

    doSave($event) {
        this.save.emit(this.data);
    }

    doCancel($event) {
        this.cancel.emit();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.sections && this.sections.length > 0) {
            this.loadSections();
        }
        if (this.variables && this.variables.rfpFilters) {
            this.filters = this.variables.rfpFilters.replace(' ', '').split(',');
            this.loadSections();
        }
    }

    loadSections() {
        if (this.sections) {
            this.column1 = [];
            this.column2 = [];
            let filteredSections = this.sections;
            if (this.filters && this.filters.length > 0) {
                filteredSections = _.filter(this.sections, (section) => this.filters.includes(section.header));
            }
            filteredSections.forEach((item, index) => this['column' + (index % 2 === 0 ? '1' : '2')].push(item));
        }
    }

    ngAfterViewInit(): void {
        this.changeDetector.detectChanges();
    }

    getFieldColumnClass(nbElements, field) {
        let tmpNgColumn;
        if (field && field.type === 'group') {
            return 'col-12';
        }
        if (this.filters) {
            if (typeof this.filters === 'string') {
                tmpNgColumn = 1;
            } else {
                tmpNgColumn = this.filters.length > 1 ? 2 : 1;
            }
        }
        if (this.el && this.el.nativeElement) {
            if (this.el.nativeElement.parentNode.offsetWidth > 850 && (!tmpNgColumn || tmpNgColumn === 2)) {
                this.isTwoColumn = true;
                let tmp = Math.floor(this.el.nativeElement.parentNode.offsetWidth / (this.readOnly ? 620 : 900)) || 1;
                tmp = nbElements < tmp ? nbElements : tmp;
                if (tmp > 6) {
                    return 'col-2 field';
                } else if (tmp === 5) {
                    return 'col-3 field';
                } else {
                    return 'col-' + 12 / tmp + ' field pl-1';
                }
            } else {
                this.isTwoColumn = false;
                let tmp = Math.floor(this.el.nativeElement.parentNode.offsetWidth / (this.readOnly ? 310 : 450)) || 1;
                tmp = nbElements < tmp ? nbElements : tmp;
                if (tmp > 6) {
                    return 'col-2 field';
                } else if (tmp === 5) {
                    return 'col-3 field';
                } else {
                    return 'col-' + 12 / tmp + ' field pl-1';
                }
            }
        }
    }
}
