import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, OnInit } from '@angular/core';
import { DialogConfig } from '@app/core/models/dialogConfig';
import { TranslateService } from '@ngx-translate/core';
import { SelectItem } from 'primeng/api';
import { ParametersService } from '../parameters.service';

@Component({
    selector: 'app-params-territory-element-dialog-responsible-office',
    templateUrl: './elementDialog.component.html',
})
export class ElementDialogResponsibleOfficeComponent implements OnChanges, OnInit {
    @Input() errors: any;
    @Input() disabled: boolean = false;
    @Input() item: any;
    @Input() col: any[];
    @Input() selectTxt: string;
    @Input() subItemModel: string;
    @Input() subItemLabel: string;
    @Input() itemMultiple: boolean;
    @Input() title: string;
    @Input() roles: SelectItem[];
    @Input() taxCenters: SelectItem[];
    @Input() convertToSelectItem = true;
    form: any;
    @Output() saved: EventEmitter<any> = new EventEmitter<any>();
    @Output() canceled = new EventEmitter();
    selectableCol: SelectItem[];
    selectableCol2: SelectItem[];

    dialogConfig: DialogConfig = {
        showAction: true,
        display: true,
        title: '',
        canSave: true,
        tabs: [
            { name: this.translate.instant('COMMON.FORMS.INFORMATIONS'), required: true, warning: false }
        ]
    };

    constructor(private parametersService: ParametersService, private translate: TranslateService) {
    }

    ngOnInit(): void {
        this.dialogConfig.title = this.title;
        this.dialogConfig.canSave = !this.disabled;
        this.multiSelect();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.multiSelect();
    }

    multiSelect(){
        if (this.col) {
            this.selectableCol = this.convertToSelectItem
                ? this.parametersService.getSelectables(this.col, this.translate.instant(this.selectTxt))
                : this.col;

        }
    }

    cancel = () => this.canceled.emit();

    save = () => {
        if(!this.disabled){
            this.saved.emit(this.item);   
        }
    };

}
