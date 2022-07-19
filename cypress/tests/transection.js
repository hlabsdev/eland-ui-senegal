import { files } from '../support/generate';

describe('Transaction', () => {
    const user = cy;

    before(() => {
        user
        .ServiceCheck()
        .then(_ => {
            const fileName = `deploymentForTransaction`

            cy
            .loginKeyCloak('superuser', 'Test1234')
            .then(_ => {
                cy
                .goToMenu('[routerlink=""]')
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
                    })
            })
        })

    });


    it('Should START A ', (done) => {
        const fileName = `deploymentTest123`
        cy
        .goToMenu('[routerlink="processes"]')
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

})