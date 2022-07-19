import { Observable } from 'rxjs';

export type fn$<T = any> = () => Observable<T>;
