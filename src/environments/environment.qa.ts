export const environment = {
    production: false,
    api: 'http://qa-fon-worker01.az.sogema.local:300',
    workflowApi: 'http://qa-fon-worker01.az.sogema.local:8581',
    translationApi: 'http://qa-fon-worker01.az.sogema.local:3200',
    version: require('../../package.json').version,
    defaultLanguage: 'fr',
    defaultLocale: 'fr-SN',
    availableLanguages: ['en', 'fr-SN'],
    app: null,
    environment: 'qa',
    localCache: 3600000, // 1 hour TTL (time to live) in milliseconds
};
