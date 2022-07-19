import { Injectable } from '@angular/core';
import { Task } from '@app/core/models/task.model';
import { BehaviorSubject, Subject } from 'rxjs';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';

@Injectable()
export class TaskStateManagerService {
    private baUnitSelectedTabIndexSubject = new BehaviorSubject<number>(0);
    baUnitSelectedTabIndexChange$ = this.baUnitSelectedTabIndexSubject.asObservable();

    private selectedTaskSubject = new BehaviorSubject<Task | null>(null);
    selectedTaskChange$ = this.selectedTaskSubject.asObservable();

    private selectedFormKeySubject = new BehaviorSubject<{
        formVariables: FormVariables;
        form: any;
        task: Task;
    } | null>(null);
    selectedFormKeyChange$ = this.selectedFormKeySubject.asObservable();

    private refreshTaskFormSubject = new Subject<Task>();
    refreshTaskFormChange$ = this.refreshTaskFormSubject.asObservable();

    private completeTaskSubject = new Subject<any>();
    completeTaskChange$ = this.completeTaskSubject.asObservable();

    private changeTaskListViewSubject = new BehaviorSubject<string>('small');
    changeTaskListViewChange$ = this.changeTaskListViewSubject.asObservable();

    private requiredFormsSubject = new BehaviorSubject<string[]>([]);
    requiredFormsChange$ = this.requiredFormsSubject.asObservable();

    private requiredErrorFormsSubject = new BehaviorSubject<string[]>([]);
    requiredErrorFormsChange$ = this.requiredErrorFormsSubject.asObservable();

    private refreshFormSubject = new Subject();
    refreshFormChange$ = this.refreshFormSubject.asObservable();

    get selectedFormKey() {
        return this.selectedFormKey.value;
    }

    constructor() {}

    changeSelectedTask(selectedTask: Task) {
        this.selectedTaskSubject.next(selectedTask);
    }

    changeSelectedFormKey(selectedFormKey: { formVariables: FormVariables; form: any; task: Task }) {
        this.selectedFormKeySubject.next(selectedFormKey);
    }

    refreshForm() {
        this.refreshFormSubject.next(1);
    }

    refreshTaskForm(task: Task) {
        this.refreshTaskFormSubject.next(task);
    }

    changeTaskListView(viewType: string) {
        this.changeTaskListViewSubject.next(viewType);
    }

    changeBaUnitSelectedTabIndex(selectedTabIndex: number) {
        this.baUnitSelectedTabIndexSubject.next(selectedTabIndex);
    }

    completeTask() {
        this.completeTaskSubject.next(1);
        this.releaseTask();
    }

    releaseTask() {
        this.changeSelectedTask(null);
        this.changeSelectedFormKey(null);
    }

    setRequiredForms(requiredForms: string[]) {
        this.requiredFormsSubject.next(requiredForms);
    }
    setRequiredErrorForms(requiredErrorForms: string[]) {
        this.requiredErrorFormsSubject.next(requiredErrorForms);
    }
}
