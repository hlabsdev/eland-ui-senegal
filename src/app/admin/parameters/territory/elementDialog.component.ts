import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DialogConfig } from '@app/core/models/dialogConfig';
import { TranslateService } from '@ngx-translate/core';
import { SelectItem } from 'primeng/api';
import { ParametersService } from '../parameters.service';

@Component({
    selector: 'app-params-territory-element-dialog',
    templateUrl: './elementDialog.component.html',
})
export class ElementDialogComponent implements OnInit {
    @Input() errors: any;
    @Input() item: any;
    @Input() col: any[];
    @Input() col2: any[];
    @Input() selectTxt: string;
    @Input() subItemModel: string;
    @Input() subItemLabel: string;
    @Input() selectTxt2: string;
    @Input() itemMultiple: boolean;
    @Input() subItemModel2: string;
    @Input() subItemLabel2: string;
    @Input() item2Multiple: boolean;
    @Input() showSigtasField: boolean;
    @Input() disable: boolean;
    @Input() title: string;
    @Input() convertToSelectItem = true;
    dialogConfig: DialogConfig;
    form: any;
    @Output() saved: EventEmitter<any> = new EventEmitter<any>();
    @Output() canceled = new EventEmitter();
    selectableCol: SelectItem[];
    selectableCol2: SelectItem[];
    constructor(private parametersService: ParametersService, private translate: TranslateService) { }

    ngOnInit() {

        this.dialogConfig = {
            showAction: true,
            display: true,
            title: this.title,
            canSave: true,
            isDisable: this.disable,
            tabs: [
                { name: 'Général', required: true },
            ]
        };

        if (this.col) {
            this.selectableCol = this.convertToSelectItem ?
                this.parametersService.getSelectables(this.col, this.translate.instant(this.selectTxt))
                : this.col;
        }
        if (this.col2) {
            this.selectableCol2 = this.convertToSelectItem
                ? this.parametersService.getSelectables(this.col2, this.translate.instant(this.selectTxt2))
                : this.col2;
        }


    }
  

    save = () => {
        this.saved.emit(this.item);
    };

    cancel = () => {
        this.canceled.emit();
    }
    
    close = () => {
        this.canceled.emit();
    }
}
