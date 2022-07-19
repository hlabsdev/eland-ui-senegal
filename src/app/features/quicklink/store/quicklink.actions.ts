import { Quicklink, QuicklinksGroup } from '@app/features/quicklink/models/quicklink.model';
import { createAction, props } from '@ngrx/store';

export enum QuicklinkActionTypes {
    GET_ALL_QUICKLINKS = '[Quicklink] Get All Quicklinks',
    QUICKLINKS_RETRIEVED = '[Quicklink] Quicklinks Retrieved',
    GET_ALL_QUICKLINKS_GROUPS = '[Quicklink] Get All Quicklinks Groups',
    QUICKLINKS_GROUPS_RETRIEVED = '[Quicklink] Quicklinks Groups Retrieved',
    SET_QUICKLINK = '[Quicklink] Set Quicklink',
    DUPLICATE_QUICKLINK = '[Quicklink] Duplicate Quicklink',
    DELETE_QUICKLINK = '[Quicklink] Delete Quicklink',
    QUICKLINK_ERROR = '[Quicklink] Error',
}

// Get All Quicklinks
export const getAllQuicklinks = createAction(QuicklinkActionTypes.GET_ALL_QUICKLINKS);

export const quicklinksRetrieved = createAction(
    QuicklinkActionTypes.QUICKLINKS_RETRIEVED,
    props<{ quicklinks: Quicklink[] }>(),
);

// Get all Quicklinks Grouped
export const getAllQuicklinksGroups = createAction(QuicklinkActionTypes.GET_ALL_QUICKLINKS_GROUPS);

export const quicklinksGroupsRetrieved = createAction(
    QuicklinkActionTypes.QUICKLINKS_GROUPS_RETRIEVED,
    props<{ quicklinksGroups: QuicklinksGroup[] }>(),
);

// Set Quicklink
export const setQuicklink = createAction(QuicklinkActionTypes.SET_QUICKLINK, props<{ quicklinkToSet: Quicklink }>());

// Duplicate Quicklink
export const duplicateQuicklink = createAction(
    QuicklinkActionTypes.DUPLICATE_QUICKLINK,
    props<{ quicklinkToDuplicate: Quicklink }>(),
);

// Delete Quicklink
export const deleteQuicklink = createAction(
    QuicklinkActionTypes.DELETE_QUICKLINK,
    props<{ quicklinkToDelete: Quicklink['id'] }>(),
);

// Error handdling
export const quicklinkError = createAction(QuicklinkActionTypes.QUICKLINK_ERROR, props<{ error: any }>());
