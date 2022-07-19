import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ErrorResult } from '@app/core/utils/models/errorResult.model';
import { WarningResult } from '@app/core/utils/models/warningResult.model';
import { ProcessService } from '@app/core/services/process.service';
import { TaskComment } from '@app/core/models/taskComment.model';
import { DialogOptions } from '@app/registration/task/dialogs/multi-dialogs/dialog-options.model';
import { Step } from '@app/registration/task/dialogs/multi-dialogs/step.model';
import { TaskDialogsService } from '@app/registration/task/dialogs/taskDialogs.service';
import { Observable, of } from 'rxjs';
import { Task } from '@app/core/models/task.model';

/* eslint-disable */
@Component({
  selector: 'app-multi-dialog',
  templateUrl: './multi-dialogs.component.html'
})
export class MultiDialogsComponent implements OnChanges {
  @Input() errorMessage: string;
  @Input() task: Task;
  @Input() saveMode = false;
  @Output() completed: EventEmitter<
    DialogOptions | DialogOptions[]
  > = new EventEmitter<DialogOptions | DialogOptions[]>();
  @Output() commentSave: EventEmitter<TaskComment> = new EventEmitter<
    TaskComment
  >();
  @Input() dialogs: DialogOptions[] = null;
  @Input() dialog: DialogOptions = null;
  header: string;
  currentDialog: DialogOptions = null;
  dialogItems: Step[];
  gotNext: boolean;
  currentIndex = 0;
  @Output() visibleChange = new EventEmitter<boolean>();

  constructor(
    private processService: ProcessService,
    private taskDialogsService: TaskDialogsService
  ) { }

  _visible: boolean;

  get visible(): boolean {
    return this._visible;
  }

  @Input() set visible(v: boolean) {
    this._visible = v;
    this.visibleChange.emit(this._visible);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.dialogs) {
      if (this.dialogs.length === 1) {
        this.currentDialog = this.dialogs[0];
        this.currentIndex = 0;
        this.gotNext = false;
      } else if (this.dialogs.length > 1) {
        this.dialogItems = this.dialogs.map(dialog =>
          dialog.toStep('TASK.MULTIPLE_CHOICES.')
        );
        this.currentDialog = this.dialogs[0];
        this.currentIndex = 0;
        this.gotNext = true;
      }
    }
    if (this.dialog) {
      this.currentDialog = this.dialog;
      this.currentIndex = 0;
      this.gotNext = false;
    }
  }

  saveComment() {
    this.validateAndSaveComment().subscribe();
  }

  complete() {
    this.validatedNext().subscribe(valid => {
      if (valid) {
        if (this.dialogs.some(dialog => !dialog.isDone)) {
          this.errorMessage = new ErrorResult(
            'MESSAGES.SOME-INCOMPLETE'
          ).toMessage();
        } else {
          this.completed.emit(this.dialog || this.dialogs);
        }
      }
    });
  }

  next() {
    this.validatedNext().subscribe(valid => {
      if (valid) {
        this.currentIndex++;
        this.currentDialog = this.dialogs[this.currentIndex];
        this.gotNext = this.dialogs.length - 1 > this.currentIndex;
      }
    });
  }

  validatedNext(tryValidate: boolean = false): Observable<boolean> {
    switch (this.currentDialog.type.name) {
      case 'add-comment':
        return this.validateAndSaveComment(tryValidate);
      case 'choice-options':
        return this.validateChoiceOptions(tryValidate);
      case 'user-choice':
        return this.validateUserChoice(tryValidate);
      case 'date-options':
        return this.validateUserChoice(tryValidate);
      case 'complete':
        return this.validateComplete();
      default:
        return of(false);
    }
  }

  validateAndSaveComment(tryValidate: boolean = false): Observable<boolean> {
    if (
      this.currentDialog.value &&
      this.currentDialog.value.subject &&
      this.currentDialog.value.message
    ) {
      this.currentDialog.value.taskName = this.currentDialog.value.name;
      this.currentDialog.isDone = true;
      if (this.dialogItems) {
        this.dialogItems[this.currentIndex].isDone = true;
      }
      this.taskDialogsService.addCommentEventEmit(this.currentDialog.value);
      return of(true);
    } else {
      if (!tryValidate) {
        this.errorMessage = new WarningResult(
          'MESSAGES.INVALID_PARAMETERS'
        ).toMessage();
      }
      return of(false);
    }
  }

  validateChoiceOptions(tryValidate: boolean = false): Observable<boolean> {
    if (this.currentDialog.value) {
      this.currentDialog.isDone = true;
      return of(true);
    } else {
      if (!tryValidate) {
        this.errorMessage = new WarningResult(
          'MESSAGES.INVALID_PARAMETERS'
        ).toMessage();
      }
      return of(false);
    }
  }

  validateUserChoice(tryValidate: boolean = false): Observable<boolean> {
    if (this.currentDialog.value) {
      this.currentDialog.isDone = true;
      return of(true);
    } else {
      if (!tryValidate) {
        this.errorMessage = new WarningResult(
          'MESSAGES.INVALID_PARAMETERS'
        ).toMessage();
      }
      return of(false);
    }
  }

  validateComplete(): Observable<boolean> {
    if (this.currentDialog.value && this.currentDialog.value.valid) {
      this.currentDialog.isDone = true;
      return of(true);
    } else {
      this.errorMessage = new ErrorResult(
        'MESSAGES.INVALID_PARAMETERS'
      ).toMessage();
      return of(false);
    }
  }

  validateDateOptions(): Observable<boolean> {
    if (this.currentDialog.value) {
      this.currentDialog.isDone = true;
      return of(true);
    } else {
      this.errorMessage = new ErrorResult(
        'MESSAGES.INVALID_PARAMETERS'
      ).toMessage();
      return of(false);
    }
  }

  indexChanged(event: number) {
    this.validatedNext(true).subscribe(valid => {
      this.currentDialog = this.dialogs[event];
      this.gotNext = this.dialogs.length - 1 > this.currentIndex;
    });
  }
}
