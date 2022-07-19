import { Group } from './group.model';
import { SelectItem } from 'primeng/api';
import * as _ from 'lodash';

export class User {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
    realmRoles: string[];
    groups: Group[];

    constructor(obj: any = {}) {
        this.username = obj.username;
        this.firstName = obj.firstName;
        this.lastName = obj.lastName;
        this.email = obj.email;
        this.roles = obj.roles ? obj.roles : [];
        this.realmRoles = obj.realmRoles ? obj.realmRoles : [];
        this.groups = obj.groups ? obj.groups.map((group) => new Group(group)) : [];
    }

    toSelectItem(): SelectItem {
        return { label: `${this.firstName} ${this.lastName}`, value: this.username };
    }

    toSelectItemFull(): SelectItem {
        return { label: `${this.firstName} ${this.lastName}`, value: this };
    }

    getCommuneAccesses = (comunneAccesses: any): string[] => _.values(_.pick(comunneAccesses, this.roles));

    hasEveryPermission = (permissions: string[] = []) => permissions.every(this.hasPermission);

    hasSomePermissions = (permissions: string[] = []) => permissions.some(this.hasPermission);

    hasPermission = (permission: string) => this.roles.includes(permission);
}
