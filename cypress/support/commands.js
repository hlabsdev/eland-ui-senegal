
// like functions, reuseable actions can be grouped as commands.

import { keycloak } from './generate';

Cypress.Commands.add('ServiceCheck', () => {
  cy
    .request('http://dev-keycloak01.az.sogema.local:8080/auth/')
    .request('http://localhost:8280/v1/config')
    .request('http://dev-fon-worker01.az.sogema.local:8581/')
    //   if all request are up and no error is trigger
    .then(_ => expect('API/Keycloak/Workflow', '').to.exist)
})

Cypress.Commands.add('loginKeyCloak', (username, password) => {

  const loginRequest = {
    url: `${keycloak.root}/auth/realms/${keycloak.realm}/protocol/openid-connect/auth`,
    qs: {
      client_id: keycloak.client,
      redirect_uri: keycloak.redirect_uri,
      state: cy.createUUID(),
      nonce: cy.createUUID(),
      response_mode: 'fragment',
      response_type: 'code',
      scope: 'openid'
    }
  };

  return cy.request(loginRequest)
    .then(submitLoginForm)
    .then(_ => cy.visit('/'))

  function submitLoginForm(response) {
    const _el = document.createElement('html');
    _el.innerHTML = response.body;
    const loginForm = _el.getElementsByTagName('form');
    const isAlreadyLogged = !loginForm.length;
    if (isAlreadyLogged) {
      return;
    }
    return cy.request({
      form: true,
      method: 'POST',
      url: loginForm[0].action,
      followRedirect: false,
      body: {
        username: username,
        password: password
      }
    });
  }
});

Cypress.Commands.add('goToMenu', (menu, parent = '#adminDropdown') => {
  return cy
    .get(parent)
    .click()
    .queryByTestId(menu)
    .click()
});

Cypress.Commands.add('closeHeaderDropdown', () => {
  return cy.get('#adminDropdown')
    .click()

});

Cypress.Commands.add('logoutKeycloak', () => {
  return cy.request({
    url: `${keycloak.root}/auth/realms/${keycloak.realm}/protocol/openid-connect/logout`,
    qs: {
      redirect_uri: keycloak.redirect_uri
    }
  }).then(_ => cy.visit('/'));
});

Cypress.Commands.add('createUUID', () => {
  var s = [];
  var hexDigits = '0123456789abcdef';
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4';
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
  s[8] = s[13] = s[18] = s[23] = '-';
  var uuid = s.join('');
  return uuid;
});

Cypress.Commands.add('uploadFile', { prevSubject: 'element' }, (subject, fileName) => {
  return cy.fixture(fileName, 'base64')
    .then(Cypress.Blob.base64StringToBlob)
    .then(blob => {
      const el = subject[0]
      if (el != null) {
        const testFile = new File([blob], fileName)
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(testFile)
        el.files = dataTransfer.files
      }
      return subject
    })
})

Cypress.on('fail', (error, runnable) => {
  const failedRequest = error.message.includes('cy.request()')
  const isKeyCloak = error.message.includes(`dev-keycloak01`)
  const isApi = error.message.includes(`localhost:8280`)
  const workFlow = error.message.includes(`local:8581`)

  if (failedRequest && isKeyCloak) {
    throw new Error('Keycloak is Down/Not reachable')
    return
  }

  if (failedRequest && isApi) {
    throw new Error('Api is Down/Not reachable')
    return
  }

  if (failedRequest && workFlow) {
    throw new Error('WorkFlow is Down/Not reachable')
    return
  }

  throw new Error(error.message);
})
