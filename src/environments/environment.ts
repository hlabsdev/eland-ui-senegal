// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

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
    environment: 'local',
    localCache: 3600000, // 1 hour TTL (time to live) in milliseconds
};
