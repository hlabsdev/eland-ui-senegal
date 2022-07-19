export const environment = {
    production: false,
    api: 'http://localhost:8281',
    workflowApi: 'http://localhost:8581',
    translationApi: 'http://dev-eland-sgf-worker01.az.sogema.local:3200/fasApi',
    version: require('../../package.json').version,
    defaultLanguage: 'fr',
    defaultLocale: 'fr-SN',
    availableLanguages: ['en', 'fr-SN'],
    app: null,
    environment: 'dev',
    localCache: 3600000, // 1 hour TTL (time to live) in milliseconds
};

