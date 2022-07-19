export const environment = {
    production: false,
    api: 'http://dev-eland-sgf-worker01.az.sogema.local:8281',
    workflowApi: 'http://dev-eland-sgf-worker01.az.sogema.local:8581',
    translationApi: 'http://dev-eland-sgf-worker01.az.sogema.local:3200/fasApi',
    version: require('../../package.json').version,
    defaultLanguage: 'fr',
    defaultLocale: 'fr-SN',
    availableLanguages: ['en', 'fr-SN'],
    app: null,
    environment: 'dev-sn',
    localCache: 3600000, // 1 hour TTL (time to live) in milliseconds
};
