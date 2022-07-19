import { Component, ContentChild, EventEmitter, Input, OnDestroy, Output, TemplateRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { RowSizes } from '@app/core/models/rowSize.model';
import { TableCols } from '@app/core/models/tableCols';
import { TableConfig } from '@app/core/models/tableConfig';
import { Task } from '@app/core/models/task.model';
import { TaskComment } from '@app/core/models/taskComment.model';
import { User } from '@app/core/models/user.model';
import { ProcessService } from '@app/core/services/process.service';
import { UserService } from '@app/core/services/user.service';
import { TaskDialogsService } from '@app/registration/task/dialogs/taskDialogs.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
    selector: 'eland-discussion',
    templateUrl: './eland-discussion.component.html'
})
export class ElandDiscussionComponent implements OnDestroy {

    @Input() displayModal: boolean;
    @Input() taskComments: TaskComment[] = [];
    @Input() task: Task;

    @Output() hide = new EventEmitter();

    private taskCommentSubscription = new Subscription();

    rowSizes: any = RowSizes;
    isLoading: boolean = false;
    errorMessage: string;

    cols: TableCols[] = [];

    tableConfig: TableConfig = {
        title: this.translateService.instant('COMMON.ACTIONS.CHAT'),
        titleTooltip: this.translateService.instant('COMMON.ACTIONS.CHAT'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'discussion',
        displayAction: false,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        enableExport: false,
        enableReload: false,
        expandable: true,
        searchBarField: ['subject', 'username', 'dateTime', 'taskName'],
    }

    discussionForm = this.fb.group({
        subject: ['', Validators.required],
        message: ['', Validators.required],
    });

    user: User;

    constructor(private translateService: TranslateService, private fb: FormBuilder,
        private taskDialogsService: TaskDialogsService, private processService: ProcessService,
        private userService: UserService) {

        this.user = this.userService.getCurrentUser();

        this.cols = [
            { field: 'subject', header: this.translateService.instant('TASK.COMMENT.SUBJECT'), sortable: true, filterable: false, type: 'text', width: '20%'},
            { field: 'username', header: this.translateService.instant('TASK.COMMENT.USERNAME'), sortable: true, filterable: false, type: 'text', width: '10%'},
            { field: 'dateTime', header: this.translateService.instant('TASK.COMMENT.DATE'), sortable: true, filterable: false, type: 'date', width: '10%'},
            { field: 'taskName', header: this.translateService.instant('TASK.COMMENT.TASK_NAME'), sortable: true, filterable: false, type: 'text', width: '55%' },
        ];
    }

    ngOnDestroy(): void {
        this.taskCommentSubscription.unsubscribe();
    }

    hideModal = () => this.hide.emit();

    onSubmit() {
        // TODO: Use EventEmitter with form value
        console.warn(this.discussionForm.value);
        let taskComment = this.discussionForm.value;
        taskComment.taskName = this.task.name;
        taskComment.username = this.user.username;
        taskComment.dateTime = new Date();
        this.taskComments.unshift(taskComment);
        this.taskComments = [].concat(this.taskComments);
        
        this.taskCommentSubscription.add(
            this.processService
                .putInstanceVariableJson(this.task.processInstanceId, this.taskComments, 'comments')
                .subscribe(() => this.discussionForm.reset()),
        );
    }
    
}
