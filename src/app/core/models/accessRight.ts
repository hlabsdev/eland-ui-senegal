export class AccessRight {
    value: AccessRightEnum;

    constructor(value: AccessRightEnum) {
        this.value = value;
    }
}

export type AccessRightEnum =
    | 'SYSTEM_ADMINISTRATOR'
    | 'SEE_TRANSACTION_INSTANCES'
    | 'SIGTAS'
    | 'MANUALLY_START_TRANSACTION'
    | 'SEE_WORKSTATION_MENU';

export const AccessRights = {
    SYSTEM_ADMINISTRATOR: 'SYSTEM_ADMINISTRATOR' as AccessRightEnum,
    SEE_TRANSACTION_INSTANCES: 'SEE_TRANSACTION_INSTANCES' as AccessRightEnum,
    SIGTAS: 'SIGTAS' as AccessRightEnum,
    MANUALLY_START_TRANSACTION: 'MANUALLY_START_TRANSACTION' as AccessRightEnum,
    SEE_WORKSTATION_MENU: 'SEE_WORKSTATION_MENU' as AccessRightEnum,
    GIS_OFFICE: 'GIS_OFFICE' as AccessRightEnum,
};
