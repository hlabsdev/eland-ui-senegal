export const environment = {
    production: false,
    api: 'http://localhost:8281',
    workflowApi: 'http://localhost:8581',
    translationApi: 'http://localhost:3200',
    version: require('../../package.json').version,
    defaultLanguage: 'fr',
    defaultLocale: 'fr-SN',
    availableLanguages: ['en', 'fr-SN'],
    app: null,
    environment: 'no-tt',
    localCache: 3600000, // 1 hour TTL (time to live) in milliseconds
};
