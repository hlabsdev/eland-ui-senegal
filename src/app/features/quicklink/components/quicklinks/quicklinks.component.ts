import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationPreferencesService } from '@app/core/services/application-preferences.service';
import * as fromQuicklinkAction from '@app/features/quicklink/store/quicklink.actions';
import { deleteQuicklink, duplicateQuicklink, setQuicklink } from '@app/features/quicklink/store/quicklink.actions';
import { selectAllGroupedQuicklinks } from '@app/features/quicklink/store/quicklink.selectors';
import { AppState } from '@app/reducers/index';
import { Quicklink, QuicklinksGroup } from '@features/quicklink/models/quicklink.model';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, Subscription } from 'rxjs';
import { delay, map } from 'rxjs/operators';

@Component({
    selector: 'app-quicklinks',
    templateUrl: './quicklinks.component.html',
    styleUrls: ['./quicklinks.component.scss'],
    animations: [
        trigger('qlActionsState', [
            state(
                'show',
                style({
                    opacity: 1,
                }),
            ),
            state(
                'hide',
                style({
                    opacity: 0,
                }),
            ),
            transition('show => hide', animate('600ms ease-out')),
            transition('hide => show', animate('1000ms ease-in')),
        ]),
    ],
})
export class QuicklinksComponent implements OnInit {
    groupNameToDisplay: string;
    aGroupNameHovered = false;
    showQLActions = false;
    quicklinksGroups$: Observable<QuicklinksGroup[]>;
    @Output() quicklinksGroupsCurrent = new EventEmitter<Observable<QuicklinksGroup[]>>();

    translateLinks: Subscription;
    selectedQuicklinkIdToSet: number;
    home: string;
    tasks: string;

    get qlActionsStateName() {
        return this.showQLActions ? 'show' : 'hide';
    }

    pageUrl: string;
    constructor(
        private applicationPreferencesService: ApplicationPreferencesService,
        private store: Store<AppState>,
        private translateService: TranslateService,
        private router: Router,
    ) {
        this.initQLs();
        this.store.dispatch(fromQuicklinkAction.getAllQuicklinks());
    }

    ngOnInit() {
        this.pageUrl = this.router.url;
        this.getPageName();
    }

    initQLs() {
        this.translateLinks = this.translateService.stream(['HEADER']).subscribe((values) => {
            const appPreference =
                this.applicationPreferencesService.getApplicationPreferenceFromStore('applicationPreferences');

            const groupsToFilter = [
                {
                    groupName: values.HEADER.HOME,
                    quicklinks: [],
                },
                {
                    groupName: values.HEADER.ADMIN,
                    quicklinks: [],
                },
                {
                    groupName: values.HEADER.WORKSTATION,
                    quicklinks: [],
                },
                {
                    groupName: values.HEADER.PROFILE_AND_PREFERENCES,
                    quicklinks: [],
                },
                {
                    groupName: appPreference.organizationName,
                    quicklinks: [],
                },
            ];

            this.quicklinksGroups$ = this.store.pipe(
                select(selectAllGroupedQuicklinks(groupsToFilter)),
                delay(0),
                map((_quicklinksGroups: QuicklinksGroup[]) => {
                    this.quicklinksGroupsCurrent.emit(of(_quicklinksGroups));
                    return _quicklinksGroups;
                }),
            );
        });
    }

    showHGN(group: QuicklinksGroup) {
        this.groupNameToDisplay = group.groupName;
        if (!this.aGroupNameHovered) {
            this.aGroupNameHovered = true;
        }
    }
    hideHGN() {
        this.getPageName();
    }

    getPageName() {
        this.translateService.stream(['HEADER']).subscribe((values) => {
            switch (this.pageUrl) {
                case '/home': {
                    this.groupNameToDisplay = values.HEADER.HOME;
                    break;
                }
                case '/tasks-list': {
                    this.groupNameToDisplay = values.HEADER.TASKS;
                    break;
                }
                default: {
                    this.groupNameToDisplay = values.HEADER.HOME;
                }
            }
        });
    }
    // Actions on Quicklinks
    toggleQLActions(e: any, id: number) {
        this.selectedQuicklinkIdToSet = id;
        const sibl = e.target.nextElementSibling;
        if (!this.showQLActions) {
            sibl.style.display = 'block';
            this.showQLActions = true;
        } else {
            sibl.style.display = 'none';
            this.showQLActions = false;
        }
    }

    setQl(_quicklinkToSet: Quicklink) {
        this.store.dispatch(
            deleteQuicklink({
                quicklinkToDelete: this.selectedQuicklinkIdToSet,
            }),
        );

        this.store.dispatch(
            setQuicklink({
                quicklinkToSet: {
                    ..._quicklinkToSet,
                    id: this.selectedQuicklinkIdToSet,
                },
            }),
        );
    }

    duplicateQl(_quicklinkToDuplicate: Quicklink) {
        this.store.dispatch(
            duplicateQuicklink({
                quicklinkToDuplicate: {
                    ..._quicklinkToDuplicate,
                    id: this.selectedQuicklinkIdToSet + 1,
                },
            }),
        );
    }

    deleteQl(id: number) {
        this.store.dispatch(
            deleteQuicklink({
                quicklinkToDelete: id,
            }),
        );
    }

    // handling quicklink routing involving query params
    handleQuicklinkRouting(link: Quicklink) {
        if (link.queryParamsKey) {
            this.router.navigate([link.url], { queryParams: this.getQueryParams(link) });
        } else {
            this.router.navigate([link.url]);
        }
    }

    getQueryParams(link: Quicklink) {
        switch (link.queryParamsKey) {
            case 'param': {
                return {
                    param: link.queryParamsValue,
                };
            }
            case 'setting': {
                return {
                    setting: link.queryParamsValue,
                };
            }
            default: {
                return {
                    setting: link.queryParamsValue,
                };
            }
        }
    }
}
