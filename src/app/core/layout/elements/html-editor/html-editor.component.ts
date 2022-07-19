import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '@app/core/models/field.model';
import { UtilService } from '@app/core/utils/util.service';
import * as _ from 'lodash';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
    selector: 'app-html-editor',
    templateUrl: './html-editor.component.html',
})
export class HtmlEditorComponent {
    field: FieldConfig;
    group: FormGroup;
    readOnly: boolean;

    editorConfig: AngularEditorConfig = {
        editable: true,
        spellcheck: true,
        height: 'auto',
        minHeight: '0',
        maxHeight: 'auto',
        width: 'auto',
        minWidth: '0',
        translate: 'yes',
        enableToolbar: true,
        showToolbar: true,
        placeholder: 'Enter text here...',
        defaultParagraphSeparator: '',
        defaultFontName: '',
        defaultFontSize: '',
        sanitize: false,
        toolbarPosition: 'top',
    };

    constructor(private utilService: UtilService) {}
    
}
