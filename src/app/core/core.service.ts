import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Dimension } from './models/dimension.model';

@Injectable()
export class CoreService {
    private static _screenSize = new BehaviorSubject<Dimension>({
        width: (window as any).innerWidth,
        height: (window as any).innerHeight,
    });
    public static screenSize$ = CoreService._screenSize.asObservable();

    static set screenSize(screenSize: Dimension) {
        CoreService._screenSize.next(screenSize);
    }

    static get screenSize(): Dimension {
        return CoreService._screenSize.getValue();
    }
}
