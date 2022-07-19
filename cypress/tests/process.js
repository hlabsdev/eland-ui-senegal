import { files } from '../support/generate';

describe.only('Process', () => {
    const user = cy;

    before(() => {
        user.ServiceCheck().then(_ => {
            cy.loginKeyCloak('superuser', 'Test1234')
        })
    });

    it('Should trigger error with wrong file', (done) => {
        cy
            .goToMenu('/processes')
            .queryByTestId('process')
            .should('exist')
            .queryByTestId('process-upload')
            .click()
            .get('input[type="file"]')
            .uploadFile(files.logo) // send incorrect file
            .get('div.ui-messages-error')
            .should('be.visible')
            .queryByTestId('saveProcess')
            .click()
            .get('.alert.alert-danger')
            .should('be.visible')
            .queryByTestId('cancel')
            .click()
            .then(() => {
                cy.closeHeaderDropdown();
                done();
            })
    })

    it('Should upload a correct bpmn file', (done) => {
        const fileName = `deploymentTest123`
        cy
            .goToMenu('/processes')
            .queryByTestId('process-upload')
            .click()
            .queryByTestId('deploymentName')
            .clear()
            .type(fileName)
            .get('input[type="file"]')
            .uploadFile(files.sampleBpmn) // send incorrect file
            .queryByTestId('saveProcess')
            .click()
            .then(_ => {
                cy.contains(fileName);
                cy.screenshot();
                done()
            })
    })

    it('Should START A ', (done) => {
        const fileName = `deploymentTest123`
        cy
            .goToMenu('/processes')
            .queryByTestId('process-upload')
            .click()
            .queryByTestId('deploymentName')
            .clear()
            .type(fileName)
            .get('input[type="file"]')
            .uploadFile(files.sampleBpmn) // send incorrect file
            .queryByTestId('saveProcess')
            .click()
            .then(_ => {
                cy.contains(fileName);
                cy.closeHeaderDropdown()
                done()
            })
    })

})