import { xFN } from '@app/data/models/types/fns.type';
import { Observable } from 'rxjs';

export interface ServicesInterface<T = any> {
    getAll: xFN<Observable<T[]>>;
    getOne: xFN<Observable<T>>;
    setOne: xFN<Observable<T>>;
    delOne: xFN<Observable<T>>;
}
