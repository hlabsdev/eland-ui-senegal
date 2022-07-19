import { Observable } from 'rxjs';

export const AutoConvert =
    (type: any): typeof type | typeof type[] =>
    (source: Observable<any>) =>
        new Observable((observer) =>
            source.subscribe({
                next(value: any) {
                    typeof value === 'object' && !!value.length
                        ? observer.next(value.map((s) => new type(s)) as typeof type[])
                        : observer.next(new type(value) as typeof type);
                },
                error(err) {
                    observer.error(err);
                },
                complete() {
                    observer.complete();
                },
            }),
        );
