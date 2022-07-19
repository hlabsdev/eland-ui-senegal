import { quicklinksReducer } from '@app/features/quicklink/store/quicklink.reducers';
import { quicklinkKey } from '@features/quicklink/store/quicklink.reducers';
import { QuicklinkState } from '@features/quicklink/store/quicklink.state';
import { ActionReducerMap } from '@ngrx/store';

export interface AppState {
    [quicklinkKey]: QuicklinkState;
}

export const rootReducers: ActionReducerMap<any> = {
    [quicklinkKey]: quicklinksReducer,
};
