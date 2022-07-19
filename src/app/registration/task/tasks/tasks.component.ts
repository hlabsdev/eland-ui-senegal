import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ParametersService } from '@app/admin/parameters/parameters.service';
import { Registry } from '@app/core/models/registry.model';
import { RowSizes } from '@app/core/models/rowSize.model';
import { Task } from '@app/core/models/task.model';
import { Transaction } from '@app/core/models/transaction.model';
import { User } from '@app/core/models/user.model';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { TaskService } from '@app/core/services/task.service';
import { TransactionService } from '@app/core/services/transaction.service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '@app/core/services/user.service';
import { UtilService } from '@app/core/utils/util.service';
import * as _ from 'lodash';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { SelectItem } from 'primeng/api';
import { forkJoin, Subscription } from 'rxjs';
import { TaskFilterEnum, TaskFilters } from '../taskFilter';
import { TaskStateManagerService } from '../taskManager.service';
import { TableConfig } from '@app/core/models/tableConfig';
import { TableCols } from '@app/core/models/tableCols';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Router,NavigationStart, Event as NavigationEvent } from '@angular/router';
import { Location } from '@angular/common';


@Component({
    selector: 'app-tasks-list',
    templateUrl: './tasks.component.html',
    styleUrls: ['./tasks.component.scss'],
})
export class TasksComponent implements OnInit, OnDestroy {
    @Input() expandTaskList: boolean;
    @Input() searchFilter: string;
    @Output() clickedEvent = new EventEmitter<any>();

    selectedTaskId: string;
    tasks: Task[];
    items:any[];
    cols: TableCols[];
    groupId: string;
    user: User;
    sidebarFormat: string;

    //  search
    pagination = {
        first: 0,
        rows: RowSizes.SMALL,
    };
    totalRecords: number;
    transactions: SelectItem[];
    selectedTransaction: Transaction;
    search: string;
    searchTitleNumber: string;
    searchTaskName: string;
    urgentTransaction: boolean;
    rowSizes: any = RowSizes;
    searchTypes: SelectItem[];
    searchType = 'taskName';
    taskFilters = TaskFilters;
    taskFilter: any = TaskFilters.CLAIMED_TASKS;
    registryAccesses: Registry[];
    subscription: Subscription;
    activeCategorizeButton: number = 0;
    currentSortField = 'created';
    currentSortOrder = -1;
    selectedValue : string;
    visibleSidebar1;
    isExpanding = false;

    tableConfig: TableConfig = {
        title: this.translateService.instant('TASK.TASKS'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'tasks',
        displayAction: true,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: false,
        enableExport: true,
        enableReload: true,
        searchBarField: ['name', 'created'],
        actions: [{
            type: 'custom',
            callback: 'custom',
        }]
    }

    toggle: boolean = false;
    showRoute: boolean = false;

    @ViewChild('tasksTable') table: Table;

    // preloader message
    preloaderMessage = '...';

    event$;

    taskCategories: any;

    constructor(
        protected translateService: TranslateService,
        private taskService: TaskService,
        private route: ActivatedRoute,
        private alertService: AlertService,
        private userService: UserService,
        private transactionService: TransactionService,
        private utilService: UtilService,
        private parametersService: ParametersService,
        private taskManagerService: TaskStateManagerService,
        private ngxLoader: NgxUiLoaderService,
        private location: Location,
        private breakpointObserver: BreakpointObserver, 
        router: Router
    ) {
        this.location.path() === '/administration' ? this.showRoute = false : this.showRoute = true;
        this.event$
        = router.events
            .subscribe(
                (event: NavigationEvent) => {
                if(event instanceof NavigationStart) {
                    event.url === '/administration' ? this.showRoute = false : this.showRoute = true;
                }
            });
    }

    ngOnInit() {
        this.taskCategories = [
            { 'name': this.translateService.instant('HEADER.MY_TASKS'), 'fn': this.taskFilters.CLAIMED_TASKS},
            { 'name': this.translateService.instant('COMMON.ACTIONS.CLAIM'), 'fn': this.taskFilters.UNCLAIMED_TASKS},
            { 'name': this.translateService.instant('HEADER.ALL_TASKS'), 'fn': this.taskFilters.ALL_TASKS},
        ];
        this.breakpointObserver.observe([
            "(max-width: 768px)"
          ]).subscribe((result: BreakpointState) => result.matches ? this.toggle = true : this.toggle = false);

        this.subscription = this.taskManagerService.selectedTaskChange$.subscribe(
            (selectedTask) => (this.selectedTaskId = selectedTask && selectedTask.id),
        );

        this.subscription = this.taskManagerService.completeTaskChange$.subscribe(() => this.loadTasks());

        this.user = this.userService.getCurrentUser();
        this.tableConfig.customData = { 'user': this.user };
        this.groupId = this.route.snapshot.params['groupId'];
        this.getCommuneAccesses();

        this.getTransactions();

        this.taskManagerService.changeTaskListViewChange$.subscribe((value) => {
            this.sidebarFormat = value;
            this.getColumns(value);
        });

        this.getSearchTypes();

        // To be reworked : Setting active My Tasks by default (logic regression here)
        this.setActive(0);
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
        this.event$.unsubscribe();
    }
    
    toggleMenu(){
        var sidebar = document.getElementById('sidebar');
        sidebar.classList.contains('active') ? this.toggle = false : this.toggle = true;
    }

    getCurrentSorting = () => ({
        sortBy: this.currentSortField,
        sortOrder: this.currentSortOrder === -1 ? 'desc' : 'asc',
    });

    getCommuneAccesses() {
        this.parametersService.getAllRegistries(true).subscribe((registries: Registry[]) => {
            this.registryAccesses = registries;
            this.loadTasks({ getCount: true });
        });
    }

    getSearchTypes() {
        const taskNameObs = this.translateService.get('TASK.TASK');
        const titleNameObs = this.translateService.get('BA_UNIT.TITLE_LIST');
        const applicationNumberObs = this.translateService.get('APPLICATION.SEARCH_TITLE');

        forkJoin([taskNameObs, titleNameObs, applicationNumberObs]).subscribe((result) => {
            this.searchTypes = [
                { label: result[0], value: 'taskName' },
                { label: result[1], value: 'titleNumber' },
                { label: result[2], value: 'applicationNumber' },
            ];
        });
    }

    getNextPage($event) {
        this.pagination = $event;
        this.loadTasks();
    }

    buildTasksQuery(filters: any = {}) {
        let processVariables: any = [];
        if ( this.searchTitleNumber) {
            processVariables = [{ name: 'titleNumber', operator: 'eq', value: this.searchTitleNumber.trim() }];
        } else if (this.search) {
            processVariables = [{ name: 'applicationNumber', operator: 'eq', value: this.search.trim() }];
        }

        const queryConfig: any = {
            processDefinitionId: this.selectedTransaction && this.selectedTransaction.workflowProcessId,
            processVariables,
            nameLike: this.searchTaskName && this.searchTaskName.trim(),
            sorting: [this.getCurrentSorting()],
        };

        if (this.taskFilter === this.taskFilters.ALL_TASKS) {
            queryConfig.includeAssignedTasks = true;
            queryConfig.candidateGroups = this.user.roles;
        }

        if (this.taskFilter === this.taskFilters.CLAIMED_TASKS) {
            queryConfig.assignee = this.user.username;
        }

        if (this.taskFilter === this.taskFilters.UNCLAIMED_TASKS) {
            queryConfig.candidateGroups = this.user.roles;
        }

        const { requestBody } = this.taskService.buildQuery(queryConfig);

        const query = {
            firstResult: this.pagination.first,
            maxResults: this.pagination.rows,
        };

        if (this.urgentTransaction) {
            processVariables.push({
                name: 'urgentApplication',
                operator: 'eq',
                value: this.urgentTransaction,
            });
            query.firstResult = 0;
            if (this.table) {
                this.table.reset();
            }
        }

        _.assign(requestBody, this.taskService.generateRegistryFilter(this.registryAccesses));

        return { requestBody, query };
    }

    loadTasks(args: any = {}, event?: LazyLoadEvent) {
        if (event) {
            this.currentSortOrder = event.sortOrder || this.currentSortOrder;
            this.currentSortField = event.sortField || this.currentSortField;
        }

        this.ngxLoader.start();

        const { getCount, sort, task } = args;

        const { requestBody, query } = this.buildTasksQuery(args);

        return Promise.all([
            this.taskService.getTasksRequestBody({ requestBody, query }).toPromise(),
            this.taskService.getTasksRequestBodyCount({ requestBody, query }).toPromise(),
        ])
            .then(([tasks, count]) => {
                this.tasks = tasks;
                // this.items[0].name=this.tasks[0].name;
                // this.items[0].created=this.tasks[0].created;
                // setting the preloader message
                this.preloaderMessage = this.getPreloaderMessage();

                // stopping the preloading
                this.ngxLoader.stop();

                if (count !== undefined) {
                    this.totalRecords = count;
                }

                this.getColumns(this.sidebarFormat);
                if (task) {
                    this.edit(task);
                }
            })
            .catch((err) => this.alertService.camundaError(err));
    }

    getPreloaderMessage() {
        if (this.tasks.length === 0) {
            return '...';
        } else if (this.tasks.length === 1) {
            return (
                this.translateService.instant('PRELOADER.ONE_MOMENT') +
                ', ' +
                this.tasks.length +
                ' ' +
                this.translateService.instant('PRELOADER.TASK') +
                ' ' +
                this.translateService.instant('PRELOADER.IS_LOADING') +
                '.'
            );
        } else {
            return (
                this.translateService.instant('PRELOADER.ONE_MOMENT') +
                ', ' +
                this.tasks.length +
                ' ' +
                this.translateService.instant('PRELOADER.TASKS') +
                ' ' +
                this.translateService.instant('PRELOADER.ARE_LOADING') +
                '.'
            );
        }
    }

    getTransactions() {
        return this.transactionService
            .getTransactions()
            .toPromise()
            .then((transactions) => {
                this.transactions = transactions.map((t) => t.toSelectItem());
                this.transactions.unshift(this.utilService.getSelectPlaceholder('TRANSACTION.FILTER_BY_TRANSACTION'));
            })
            .catch((err) => this.alertService.apiError(err));
    }

    getColumns(format: string) {
        this.cols = [
            { field: 'name', header: this.translateService.instant('TASK.TASK'),sortable: true, filterable: true, type: 'text' },
            { field: 'created', header: this.translateService.instant('TASK.MODIFIED'),sortable: true, filterable: true, type: 'date' },
            { field: 'processDefinitionId', header: this.translateService.instant('TASK.PROCESS_DEFINITION_ID'),sortable: true, filterable: true, type: 'text' },
        ];
    }

    edit(task: Task): void {
        this.selectedTaskId = task.id;
        this.alertService.clear();
        this.taskManagerService.changeSelectedTask(task);
    }

    checkboxTrigger(data: any): void {
        switch (data.assignee) {
            case this.user.username:
                this.edit(data);
                break;
            case null:
                this.claim(data, this.user);
                break;
            default:
                break;
        }
    }

    claim(task: Task, user: User) {
        this.taskService
            .getTask(task)
            .toPromise()
            .then((tsk) => {
                const currentUser = this.userService.getCurrentUser();
                if (tsk.assignee && tsk.assignee !== currentUser.firstName) {
                    const error = this.translateService.instant('COMMON.ACTIONS.TASK_TAKEN');
                    this.alertService.warning(error);
                    this.loadTasks();
                } else {
                    this.taskService.claimTask(tsk, user).subscribe(
                        (tasks) => {
                            this.alertService.success('MESSAGES.TASK_CLAIMED');
                            this.taskFilter = TaskFilters.CLAIMED_TASKS;
                            this.loadTasks({ task: tsk });
                            this.taskManagerService.releaseTask();
                        },
                        (err) => this.alertService.camundaError(err),
                    );
                }
            });
    }

    unclaim(task: Task, user: User) {
        this.taskService.unclaimTask(task).subscribe(
            (tasks) => {
                this.alertService.success('MESSAGES.TASK_UNCLAIMED');
                this.selectedTaskId = null;
                this.taskManagerService.releaseTask();
                this.loadTasks();
            },
            (err) => this.alertService.camundaError(err),
        );
    }

    refresh() {
        this.loadTasks();
        this.alertService.success('MESSAGES.CONTENT_REFRESHED');
    }

    formatMessage(message: string): string {
        if (!this.expandTaskList && null != message && message.length > 13) {
            return message.substring(0, 10) + '...';
        } else {
            return message;
        }
    }

    /**
     * filter task list mine or mine and my groups (default)
     **/
    filterTasks(filter: TaskFilterEnum, index: number, user?: User) {
        if (user) {
            this.user = user;
        }
        this.taskFilter = filter;
        this.setActive(index);
        this.loadTasks();
    }

    // activity event toggles on tasklist-categorize buttons
    isActive(index: number) {
        return this.activeCategorizeButton === index;
    }
    setActive(index: number) {
        this.activeCategorizeButton = index;
    }

    toggleSideBar() {
      this.isExpanding = !this.isExpanding;
    }

    reload = () => this.loadTasks();
    
    startFn(item: Task){
        this.checkboxTrigger(<Task>item);
        this.taskManagerService.changeTaskListView("large");
        this.clickedEvent.emit();
    }

    unClaimFn(item: Task){
        this.unclaim(<Task>item, this.user);
    }
}
