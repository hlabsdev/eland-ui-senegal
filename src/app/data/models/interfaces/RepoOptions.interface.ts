import { xxFN } from '@app/data/models/types/fns.type';

export interface RepoOptions<T> {
    url?: string;
    urlFn?: xxFN<any, string>;
    exec?: xxFN<any, T>;
    Inter?: xxFN<any, string>;
    id?: string;
    item?: T;
    items?: T[];
}
