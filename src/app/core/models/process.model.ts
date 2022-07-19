import { Selectable } from '../interfaces/selectable.interface';
import { SelectItem } from 'primeng/api';
import * as _ from 'lodash';

export class Process implements Selectable {
    id: string;
    key: string;
    category: string;
    description: string;
    name: string;
    version: number;
    resource: string;
    deploymentId: string;
    diagram: string;
    suspended: boolean;
    tenantId: string;
    versionTag: string;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.key = obj.key;
        this.category = obj.category;
        this.description = obj.description;
        this.name = obj.name;
        this.version = obj.version;
        this.resource = obj.resource;
        this.deploymentId = obj.deploymentId;
        this.diagram = obj.diagram;
        this.suspended = obj.suspended;
        this.tenantId = obj.tenantId;
        this.versionTag = obj.versionTag;
    }

    public toSelectItem(args = null): SelectItem {
        const result = { label: this.key + ' - ' + this.resource + ' v. ' + this.version, value: this.id };
        return args ? _.assign(result, args) : result;
    }
}

// gis integration
export type ProcessTypeEnum = 'REGISTRATION' | 'DIVISION';

export const ProcessTypes = {
    registration: 'REGISTRATION' as ProcessTypeEnum,
    division: 'DIVISION' as ProcessTypeEnum,
};
// gis integration
