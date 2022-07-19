export class ExternalServiceConfig {
    ['workflow-url']: string;
    defaultTimeZone: string;

    mailer: {
        service: string;
        host: string;
        port: number;
        secure: boolean;
        auth: {
            user: string;
            pass: string;
        };
    };

    workflow: {
        workflowGroupType: string;
        systemGroupType: string;
        adminGroupId: string;
    };

    keycloakServiceProperties: {
        keyCloakUrl: string;
        keyCloakRealm: string;
        keyCloakClientId: string;
    };

    sigtas: {
        domain: string;
        path: string;
    };

    communeRoleMap: any;

    arcGIS: {
        mapUrl: string;
        printServiceUrl: string;
        mapCenter: string;
        mapScale: number;
        mapBaseMap: string;
        mapCopyright: string;
        mapRestApiUrl: string;
    };
}
