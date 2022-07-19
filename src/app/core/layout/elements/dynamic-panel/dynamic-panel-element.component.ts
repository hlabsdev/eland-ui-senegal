import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { getlocaleConstants } from '@app/core/utils/locale.constants';

@Component({
    selector: 'dyn-panel-element',
    templateUrl: 'dynamic-panel-element.component.html',
    styleUrls: ['dynamic-panel-element.component.scss'],
})
export class DynamicPanelElementComponent implements OnInit {
    @Input() field;
    @Input() readOnly;

    _data;
    @Output() dataChange = new EventEmitter();
    @Input()
    get data() {
        return this._data;
    }
    set data(newData) {
        this._data = newData;
        this.dataChange.emit(this.data);
    }

    locale: any;

    constructor(private translateService: TranslateService) {}


    ngOnInit(): void {
        const { localeSettings } = getlocaleConstants(this.translateService.currentLang);
        this.locale = localeSettings;
    }
}
