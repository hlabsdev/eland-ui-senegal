import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { TaskComment } from '@app/core/models/taskComment.model';
import { Variables } from '@app/core/models/variables.model';
import { DialogOptionsType } from '@app/registration/task/dialogs/multi-dialogs/dialog-options-type.model';
import { DialogOptions } from '@app/registration/task/dialogs/multi-dialogs/dialog-options.model';
import { Filters } from '@app/registration/task/dialogs/multi-dialogs/filters.model';
import { TaskDialogsService } from '@app/registration/task/dialogs/taskDialogs.service';
import * as _ from 'lodash';

@Component({
    selector: 'app-task-dialogs',
    template: `
        <app-multi-dialog
            [(visible)]="showCommentDialog"
            [dialog]="currentTaskComment"
            [saveMode]="true"
            *ngIf="showCommentDialog"
            (completed)="complete()"
            [errorMessage]="errorMessage"
        ></app-multi-dialog>

        <app-multi-dialog
            [(visible)]="showDialog"
            [dialogs]="dialogs"
            *ngIf="dialogs && showDialog"
            (completed)="complete()"
            [errorMessage]="errorMessage"
        ></app-multi-dialog>
    `,
})
export class TaskDialogsComponent implements OnChanges, OnInit {
    @Output() commentSave: EventEmitter<TaskComment> = new EventEmitter<TaskComment>();
    @Output() completed: EventEmitter<Variables> = new EventEmitter<Variables>();
    @Input() variables: Variables;
    showDialog = false;
    showCommentDialog = false;
    errorMessage: string;
    dialogs: DialogOptions[];
    currentTaskComment: DialogOptions;
    completeDialogOptions: DialogOptions = new DialogOptions({
        type: DialogOptionsType.complete,
        identifier: 'DEFAULT_COMPLETE',
    });
    @Output() taskCommentsChange: EventEmitter<TaskComment[]> = new EventEmitter<TaskComment[]>();

    constructor(private alertService: AlertService, private taskDialogsService: TaskDialogsService) {
        this.taskDialogsService.dialogVisibility$.subscribe((dialogVisible) => (this.showDialog = dialogVisible));
        this.taskDialogsService.commentDialogVisibility$.subscribe(
            (commentDialogVisible) => (this.showCommentDialog = commentDialogVisible),
        );
        this.taskDialogsService.resetTaskComment$.subscribe(
            () => (this.currentTaskComment = new DialogOptions(this.templateTaskCommentDialogOptions())),
        );
    }

    private _taskComments: TaskComment[];

    get taskComments(): TaskComment[] {
        return this._taskComments;
    }

    @Input() set taskComments(taskComment: TaskComment[]) {
        this._taskComments = taskComment;
    }

    templateTaskCommentDialogOptions = () => ({
        type: DialogOptionsType['add-comment'],
        value: new TaskComment({}),
    });

    ngOnInit() {
        this.taskDialogsService.setDisplayVisibility(false);
        this.taskDialogsService.setCommentDisplayVisibility(false);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.variables) {
            this.loadMultiChoice();
        }
    }

    complete() {
        const completeVars = {};
        this.dialogs.forEach((dialog) => _.assign(completeVars, dialog.getResultVariable()));
        this.showDialog = false;
        this.completed.emit(completeVars);
    }

    saveComment(taskComment: any) {
        this.commentSave.emit(taskComment);
    }

    loadMultiChoice() {
        const items: {} = {};

        const parseSubKey = (key: string, value: any): any =>
            key.includes('OPTIONS')
                ? value.toString().split(' ').join('').split(',')
                : key.includes('TYPE')
                ? DialogOptionsType.fromString(value)
                : key.includes('filters')
                ? Filters.fromString(value)
                : value;

        /** TODO: add support for optional input? */
        const reserveWords = ['TYPE', 'IDENTIFIER', 'OPTIONS', 'DEFAULT', 'FILTERS', 'TITLE'];
        _.forEach(this.variables, ({ value }, k) => {
            if (k.includes('MULTI-CHOICE.')) {
                const subKey = k.substring(13);
                const iDot = subKey.indexOf('.');
                const name = iDot && iDot >= 0 ? subKey.substring(0, iDot) : '_';
                const subName = iDot && iDot >= 0 ? subKey.substring(iDot) : subKey;
                _.set(items, `${name}.name`, name);
                _.set(items, `${name}.variables`, this.variables);
                _.set(
                    items,
                    name === '_' ? `_.${subKey}` : `${name}${subName.toLowerCase()}`,
                    parseSubKey(subKey, value),
                );
            }
        });
        const tmpDialogs: DialogOptions[] = [];
        _.forEach(items, (item) => {
            tmpDialogs.push(new DialogOptions(item));
        });
        this.completeDialogOptions.value = {
            isValidationRequired:
                (this.variables.isValidationRequired && this.variables.isValidationRequired.value) || null,
            valid: true,
        };
        tmpDialogs.push(this.completeDialogOptions);
        this.dialogs = tmpDialogs;
    }

    getNotNull(obj: any = {}, variables: string[] = []): boolean {
        let notNull = true;
        variables.forEach((variable) => (notNull = notNull && !!obj[variable]));
        return notNull;
    }
}
