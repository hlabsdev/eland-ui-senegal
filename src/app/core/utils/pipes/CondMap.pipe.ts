import { OperatorFunction } from 'rxjs/src/internal/types';
import { Observable } from 'rxjs/src/internal/Observable';
import { MapOperator } from 'rxjs/src/internal/operators/map';

export function condMap<T, R>(project: (value: T, index: number) => R, thisArg?: any): OperatorFunction<T, R> {
    return function mapOperation(source: Observable<T>): Observable<R> {
        if (typeof project !== 'function') {
            throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');
        }
        return source.lift(new MapOperator(project, thisArg));
    };
}
