import { Observable } from 'rxjs';
import { RepoOptions } from '@app/data/models/interfaces/RepoOptions.interface';

export type repoFN<T> = (options: RepoOptions<T>) => T;
export type repoFN$<T> = repoFN<Observable<T>>;
