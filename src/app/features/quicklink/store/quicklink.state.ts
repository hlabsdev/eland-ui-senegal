import { Quicklink } from '@app/features/quicklink/models/quicklink.model';

export interface QuicklinkState {
    idCount: number;
    quicklinks: Quicklink[];
    quicklinksLoading?: boolean;
    error?: null;
}

export const quicklinkInitialState: QuicklinkState = {
    idCount: 3,
    quicklinks: [],
    quicklinksLoading: false,
    error: null,
};
