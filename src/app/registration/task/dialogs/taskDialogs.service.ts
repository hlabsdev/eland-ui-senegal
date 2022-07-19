import { EventEmitter, Injectable, Output } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TaskComment } from '@app/core/models/taskComment.model';

@Injectable()
export class TaskDialogsService {
    _dialogVisibility: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    @Output() dialogVisibility$: Observable<boolean> = this._dialogVisibility.asObservable();

    _commentDialogVisibility: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    @Output() commentDialogVisibility$: Observable<boolean> = this._commentDialogVisibility.asObservable();

    @Output() resetTaskComment$: EventEmitter<void> = new EventEmitter<void>();
    @Output() newTaskComment: EventEmitter<TaskComment> = new EventEmitter<TaskComment>();

    setDisplayVisibility(visibility: boolean) {
        this._dialogVisibility.next(visibility);
    }

    setCommentDisplayVisibility(visibility: boolean) {
        this._commentDialogVisibility.next(visibility);
    }

    addCommentEventEmit(newTask: TaskComment) {
        this.newTaskComment.emit(newTask);
    }

    resetTaskComment() {
        this.resetTaskComment$.emit();
    }
}
