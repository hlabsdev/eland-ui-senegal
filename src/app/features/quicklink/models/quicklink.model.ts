export class Quicklink {
    id: number;
    name: string;
    url: string;
    group: string;
    target: string;
    queryParamsKey?: any;
    queryParamsValue?: any;
    queryParamsFragment?: any;
    queryParamsHandling?: any;
}

export interface QuicklinksGroup {
    groupName: string;
    quicklinks: Quicklink[];
}
