import {
    Component,
    ComponentFactoryResolver,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewContainerRef,
    AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Task } from '@app/core/models/task.model';
import { Subscription } from 'rxjs';
import { TaskStateManagerService } from '../taskManager.service';

@Component({
    templateUrl: './tasks.main.component.html',
})
export class TasksMainComponent implements OnInit, OnDestroy, AfterViewInit {
    sidebarFormat: string;
    taskId: string;
    changeTaskListViewSub: Subscription;
    taskSub: Subscription;

    @ViewChild('lazyTasks', { read: ViewContainerRef })
    private lazyTasksVcRef: ViewContainerRef;

    @ViewChild('lazyTasksDetail', { read: ViewContainerRef })
    private lazyTasksDetailVcRef: ViewContainerRef;

    constructor(
        private route: ActivatedRoute,
        protected taskManagerService: TaskStateManagerService,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
    ) {}

    ngOnInit(): void {
        this.loadLazyComponent().then(_ => console.log("LOADING ALL TASK LIST....") );
        this.changeTaskListViewSub = this.taskManagerService.changeTaskListViewChange$.subscribe((value) => {
            this.sidebarFormat = value;
        });
        this.route.params.subscribe((params: Params) => {
            if (params['taskId']) {
                this.taskManagerService.changeSelectedTask(new Task({ id: params['taskId'] }));
            }
        });


        this.taskSub = this.taskManagerService.selectedTaskChange$.subscribe((task) => {
            if (task) {
                this.taskId = task.id;
                setTimeout(() => {
                    this.loadLazyComponentDetail().then(_=> console.log("FIRST FORM LOADING...."));
                }, 100);
            } else {
                this.taskId = null;
            }
        });
    }

    ngAfterViewInit() {
        // this.loadLazyComponent().then(_ => console.log("LOADING ALL TASK LIST....") );
    }

    async loadLazyComponentDetail() {
        this.lazyTasksDetailVcRef.clear();
        const { TaskFormComponent } = await import('../taskForm.component');
        this.lazyTasksDetailVcRef.createComponent(this.cfr.resolveComponentFactory(TaskFormComponent));
    }

    async loadLazyComponent() {
        this.viewContainerRef.clear();
        const { TasksComponent } = await import('../tasks/tasks.component');
        this.lazyTasksVcRef.createComponent(this.cfr.resolveComponentFactory(TasksComponent));
    }

    changeTaskView(viewType: string) {
        this.taskManagerService.changeTaskListView(viewType);
    }

    ngOnDestroy(): void {
        this.changeTaskListViewSub.unsubscribe();
        this.taskSub.unsubscribe();
    }
}
