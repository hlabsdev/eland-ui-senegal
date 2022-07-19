import { fn$ } from '@app/data/models/fn$.model';
import { xxFN } from '@app/data/models/types/fns.type';

export interface DataElement {
    name?: string;
    baseName?: string;
    serviceNames: string[];
    fn?: fn$;
    baseFn?: any;
    baseOn?: string;
    baseOnFn?: xxFN<any, string | string[]>;
    subscriberFn?: xxFN<any, any>;
    contextSubscriberFn?: xxFN<any, xxFN<any, any>>;
}
