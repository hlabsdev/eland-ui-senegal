const formList = {
    'APP-SPATIAL-UNITS': {
        label: 'APP-SPATIAL-UNITS',
        value: 'APP-SPATIAL-UNITS',
        name: 'APP-SPATIAL-UNITS',
    },
    'APP-PARTIES': {
        label: 'APP-PARTIES',
        value: 'APP-PARTIES',
        name: 'APP-PARTIES',
    },
    'APP-CHECKLIST': {
        label: 'APP-CHECKLIST',
        value: 'APP-CHECKLIST',
        name: 'APP-CHECKLIST',
    },
    'APP-BA-UNIT-CONTEXT': {
        label: 'APP-BA-UNIT-CONTEXT',
        value: 'APP-BA-UNIT-CONTEXT',
        name: 'APP-BA-UNIT-CONTEXT',
    },
    'APP-BA-UNIT': {
        label: 'APP-BA-UNIT',
        value: 'APP-BA-UNIT',
        name: 'APP-BA-UNIT',
    },
    'APP-BA-UNIT-PICKER': {
        label: 'APP-BA-UNIT-PICKER',
        value: 'APP-BA-UNIT-PICKER',
        name: 'APP-BA-UNIT-PICKER',
    },
    'APP-APPLICANT': {
        label: 'APP-APPLICANT',
        value: 'APP-APPLICANT',
        name: 'APP-APPLICANT',
    },
    'APP-SOURCES': {
        label: 'APP-SOURCES',
        value: 'APP-SOURCES',
        name: 'APP-SOURCES',
    },
    'APP-PREREGISTRATION-FORMALITY': {
        label: 'APP-PREREGISTRATION-FORMALITY',
        value: 'APP-PREREGISTRATION-FORMALITY',
        name: 'APP-PREREGISTRATION-FORMALITY',
    },
    'APP-RRRS': {
        label: 'APP-RRRS',
        value: 'APP-RRRS',
        name: 'APP-RRRS',
    },
    'APP-BA-SOURCES': {
        label: 'APP-BA-SOURCES',
        value: 'APP-BA-SOURCES',
        name: 'APP-BA-SOURCES',
    },
    'APP-BA-UNIT-SET-BATCH-TRANSACTIONS': {
        label: 'APP-BA-UNIT-SET-BATCH-TRANSACTIONS',
        value: 'APP-BA-UNIT-SET-BATCH-TRANSACTIONS',
        name: 'APP-BA-UNIT-SET-BATCH-TRANSACTIONS',
    },
    'APP-DOC-GENERATION-CONTEXT': {
        label: 'APP-DOC-GENERATION-CONTEXT',
        value: 'APP-DOC-GENERATION-CONTEXT',
        name: 'APP-DOC-GENERATION-CONTEXT',
    },
    'APP-RDAI': {
        label: 'APP-RDAI',
        value: 'APP-RDAI',
        name: 'APP-RDAI',
    },
    'APP-DIVISION-REGISTRY': {
        label: 'APP-DIVISION-REGISTRY',
        value: 'APP-DIVISION-REGISTRY',
        name: 'APP-DIVISION-REGISTRY',
    },
    'APP-GENERAL-FORMALITY-REGISTRY': {
        label: 'APP-GENERAL-FORMALITY-REGISTRY',
        value: 'APP-GENERAL-FORMALITY-REGISTRY',
        name: 'APP-GENERAL-FORMALITY-REGISTRY',
    },
    'APP-OPPOSITION-REGISTRY': {
        label: 'APP-OPPOSITION-REGISTRY',
        value: 'APP-OPPOSITION-REGISTRY',
        name: 'APP-OPPOSITION-REGISTRY',
    },
    'APP-RDA': {
        label: 'APP-RDA',
        value: 'APP-RDA',
        name: 'APP-RDA',
    },
    'APP-PUBLICATION': {
        label: 'APP-PUBLICATION',
        value: 'APP-PUBLICATION',
        name: 'APP-PUBLICATION',
    },
    'APP-APPLICATION': {
        label: 'APP-APPLICATION',
        value: 'APP-APPLICATION',
        name: 'APP-APPLICATION',
    },
    'APP-COMPLEMENTARY-INFO': {
        label: 'APP-COMPLEMENTARY-INFO',
        value: 'APP-COMPLEMENTARY-INFO',
        name: 'APP-COMPLEMENTARY-INFO',
    },
    'APP-BULLETIN': {
        label: 'APP-BULLETIN',
        value: 'APP-BULLETIN',
        name: 'APP-BULLETIN',
    },
    'APP-LINKS': {
        label: 'APP-LINKS',
        value: 'APP-LINKS',
        name: 'APP-LINKS',
    },
    'APP-NOTICE': {
        label: 'APP-NOTICE',
        value: 'APP-NOTICE',
        name: 'APP-NOTICE',
    },
    'APP-CONSISTENCY-CHANGE': {
        label: 'APP-CONSISTENCY-CHANGE',
        value: 'APP-CONSISTENCY-CHANGE',
        name: 'APP-CONSISTENCY-CHANGE',
    },
    'APP-BA-CCP': {
        label: 'APP-BA-CCP',
        value: 'APP-BA-CCP',
        name: 'APP-BA-CCP',
    },
    'APP-SPATIAL-UNIT-PICKER': {
        label: 'APP-SPATIAL-UNIT-PICKER',
        value: 'APP-SPATIAL-UNIT-PICKER',
        name: 'APP-SPATIAL-UNIT-PICKER',
    },
    'APP-CREATE-BAUNIT': {
        label: 'APP-CREATE-BAUNIT',
        value: 'APP-CREATE-BAUNIT',
        name: 'APP-CREATE-BAUNIT',
    },
    'APP-RRR-PICKER-DEL': {
        label: 'APP-RRR-PICKER-DEL',
        value: 'APP-RRR-PICKER-DEL',
        name: 'APP-RRR-PICKER-DEL',
    },
    'APP-RRR-RADIATION-PICKER': {
        label: 'RRRS_PICKER',
        value: 'RRRS_PICKER',
        name: 'RRRS_PICKER',
    },
    'APP-GIS-OFFICE': {
        label: 'APP_GIS_OFFICE',
        value: 'APP_GIS_OFFICE',
        name: 'APP_GIS_OFFICE',
    },
};

export interface FORMSINTERFACE {
    name;
    label;
    value;
    parentObj?;
    childPath?;
}

export class FORMS implements FORMSINTERFACE {
    formName: string;
    name: string;
    label: string;
    value: string;
    parentObj: string;
    childPath: string;

    constructor(name: any, formName?: string) {
        this.name = name;
        this.formName = formName;
    }
    static ['APP-SPATIAL-UNITS'] = () => new FORMS('APP-SPATIAL-UNITS');
    static ['APP-PARTIES'] = () => new FORMS('APP-PARTIES');
    static ['APP-CHECKLIST'] = () => new FORMS('APP-CHECKLIST');
    static ['APP-BA-UNIT-CONTEXT'] = () => new FORMS('APP-BA-UNIT-CONTEXT');
    static ['APP-BA-UNIT'] = () => new FORMS('APP-BA-UNIT');
    static ['APP-BA-UNIT-PICKER'] = () => new FORMS('APP-BA-UNIT-PICKER');
    static ['APP-APPLICANT'] = () => new FORMS('APP-APPLICANT');
    static ['APP-SOURCES'] = () => new FORMS('APP-SOURCES');
    static ['APP-PREREGISTRATION-FORMALITY'] = () => new FORMS('APP-PREREGISTRATION-FORMALITY');
    static ['APP-RRRS'] = () => new FORMS('APP-RRRS');
    static ['APP-RRR-RADIATION-PICKER'] = () => new FORMS('APP-RRR-RADIATION-PICKER');
    static ['APP-BA-SOURCES'] = () => new FORMS('APP-BA-SOURCES');
    static ['APP-BA-UNIT-SET-BATCH-TRANSACTIONS'] = () => new FORMS('APP-BA-UNIT-SET-BATCH-TRANSACTIONS');
    static ['APP-DOC-GENERATION-CONTEXT'] = () => new FORMS('APP-DOC-GENERATION-CONTEXT');
    static ['APP-RDAI'] = () => new FORMS('APP-RDAI');
    static ['APP-DIVISION-REGISTRY'] = () => new FORMS('APP-DIVISION-REGISTRY');
    static ['APP-GENERAL-FORMALITY-REGISTRY'] = () => new FORMS('APP-GENERAL-FORMALITY-REGISTRY');
    static ['APP-OPPOSITION-REGISTRY'] = () => new FORMS('APP-OPPOSITION-REGISTRY');
    static ['APP-RDA'] = () => new FORMS('APP-RDA');
    static ['APP-PUBLICATION'] = () => new FORMS('APP-PUBLICATION');
    static ['APP-APPLICATION'] = () => new FORMS('APP-APPLICATION');
    static ['APP-COMPLEMENTARY-INFO'] = () => new FORMS('APP-COMPLEMENTARY-INFO');
    static ['APP-BULLETIN'] = () => new FORMS('APP-BULLETIN');
    static ['APP-LINKS'] = () => new FORMS('APP-LINKS');
    static ['APP-NOTICE'] = () => new FORMS('APP-NOTICE');
    static ['FORM-LIST'] = () => new FORMS('FORM-LIST');
    static ['APP-GIS-OFFICE'] = () => new FORMS('APP-GIS-OFFICE');
    static getByName = (name) => FORMS[name]();

    static GET_FORMS_LIST = function (): string[] {
        return Object.keys(formList);
    };
    static GET_FORMS_LIST_OBJ = function (): any[] {
        const keys = FORMS.GET_FORMS_LIST();
        const formsArr: any[] = [];
        for (const key of keys) {
            formsArr.push(formList[key]);
        }
        return formsArr;
    };
}
