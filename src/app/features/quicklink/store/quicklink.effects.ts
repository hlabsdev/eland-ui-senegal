import { Injectable } from '@angular/core';
import { QuicklinkService } from '@app/features/quicklink/services/quicklink.service';
import { AppState } from '@app/reducers/index';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Quicklink } from '@app/features/quicklink/models/quicklink.model';
import * as fromQuicklinkActions from '@app/features/quicklink/store/quicklink.actions';

@Injectable()
export class QuicklinkEffects {
    constructor(
        private quicklinkService: QuicklinkService,
        private actions$: Actions,
        private store: Store<AppState>,
    ) {}

    getAllQuicklinks$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(fromQuicklinkActions.getAllQuicklinks),
                switchMap(() =>
                    this.quicklinkService.getQuicklinks().pipe(
                        map((_quicklinks: any) => {
                            const quicklinks: Quicklink[] = _quicklinks.map(
                                (_quicklink: any) => _quicklink as Quicklink,
                            );
                            return fromQuicklinkActions.quicklinksRetrieved({
                                quicklinks,
                            });
                        }),
                        catchError((error: any) => of(fromQuicklinkActions.quicklinkError({ error }))),
                    ),
                ),
            ),
        // { dispatch: true }
    );
}
