/*jshint esversion: 6 */
import { users } from '../support/generate';

describe('Login & Logout', () => {
    const user = cy;
    beforeEach(() => {
        cy.logoutKeycloak()
    });

    it('should Check all services are up', () => {
        user.ServiceCheck()
    })

    it('should log user in', (done) => {
        user
            .get('#username')
            .type(users.su.username)
            .get('#password')
            .type(users.su.password)
            .get('#kc-login')
            .click()
            .location()
            .its('href')
            .should('include','localhost')
            .then( _ => done())

    })

})
