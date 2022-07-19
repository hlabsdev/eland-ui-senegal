import { quicklinkInitialState, QuicklinkState } from '@app/features/quicklink/store/quicklink.state';
import { createReducer, on } from '@ngrx/store';
import { Quicklink } from '@app/features/quicklink/models/quicklink.model';
import * as fromQuicklinkAction from '@app/features/quicklink/store/quicklink.actions';

export const quicklinkKey = 'quicklinkKey';

export const quicklinksReducer = createReducer(
    quicklinkInitialState,
    on(fromQuicklinkAction.getAllQuicklinks, (state) =>
        Object.assign({}, state, {
            idCount: state.idCount,
            quicklinks: state.quicklinks,
            quicklinksGroups: state.quicklinks,
            quicklinksLoading: true,
        }),
    ),
    on(fromQuicklinkAction.quicklinksRetrieved, (state, payload: { quicklinks: Quicklink[] }) =>
        Object.assign({}, state, {
            idCount: state.idCount,
            quicklinks: payload.quicklinks,
            quicklinksLoading: false,
        }),
    ),
    on(fromQuicklinkAction.setQuicklink, (state: QuicklinkState, { quicklinkToSet: quicklink }) => {
        const _quicklinkToSet: Quicklink = Object.assign({}, quicklink);
        return {
            idCount: state.idCount + 1,
            quicklinks: [...state.quicklinks, _quicklinkToSet],
        };
    }),
    on(fromQuicklinkAction.duplicateQuicklink, (state: QuicklinkState, { quicklinkToDuplicate: quicklink }) => {
        const _quicklinkToDuplicate: Quicklink = Object.assign({}, quicklink);
        return {
            idCount: state.idCount + 1,
            quicklinks: [...state.quicklinks, _quicklinkToDuplicate],
        };
    }),
    on(fromQuicklinkAction.deleteQuicklink, (state: QuicklinkState, { quicklinkToDelete: id }) => ({
        ...state,
        idCount: state.idCount - 1,
        quicklinks: state.quicklinks.filter((ql) => ql.id !== id),
    })),

    on(fromQuicklinkAction.quicklinkError, (state, payload) => Object.assign({}, state, { error: payload.error })),
);
