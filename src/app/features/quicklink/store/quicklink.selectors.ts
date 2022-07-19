import { AppState } from '@app/reducers/index';
import { QuicklinkState } from '@features/quicklink/store/quicklink.state';
import { createSelector } from '@ngrx/store';
import { Quicklink, QuicklinksGroup } from '@app/features/quicklink/models/quicklink.model';

const selectState = (state: AppState) => state.quicklinkKey;

export const selectAllQuicklinks = createSelector(selectState, (state: QuicklinkState) => state.quicklinks);

export const selectAllGroupedQuicklinks = (_groupsToFilter: QuicklinksGroup[]) =>
    createSelector(selectAllQuicklinks, (quicklinks: Quicklink[]) => {
        const isGroupToSelect = (element: QuicklinksGroup) => element.quicklinks !== [];
        let groupsToSelect = _groupsToFilter.map((_groupToSelect: QuicklinksGroup) => {
            if (_groupsToFilter.some(isGroupToSelect)) {
                return {
                    groupName: _groupToSelect.groupName,
                    quicklinks: quicklinks.filter((quicklink) => quicklink.group === _groupToSelect.groupName),
                };
            } else {
            }
        });
        groupsToSelect = groupsToSelect.filter((obj) => obj.quicklinks.length !== 0);
        return groupsToSelect;
    });
