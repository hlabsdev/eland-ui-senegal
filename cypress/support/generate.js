// /*jshint esversion: 6 */
// constants file
const users = {
    su: {
        username: 'superuser',
        password: 'Test1234'
    }
};

const keycloak = {
     root : 'http://dev-keycloak01.az.sogema.local:8080',
     realm  : 'foncier',
     client  : 'foncier-ui',
     redirect_uri  : 'http://localhost:4200/'
}


const files = {
    sampleBpmn : '../../src/assets/workflows/GrantOfFreehold.bpmn',
    logo : '../../src/assets/land-icon.png',

}

export {
 users, keycloak, files
};
