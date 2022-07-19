export const environment = {
    production: true,
    api: 'api',
    workflowApi: 'workflowApi',
    translationApi: 'fasApi',
    version: require('../../package.json').version,
    defaultLanguage: 'fr',
    defaultLocale: 'fr-SN',
    availableLanguages: ['en', 'fr-SN'],
    app: null,
    environment: 'prod',
    localCache: 3600000, // 1 hour TTL (time to live) in milliseconds
};
