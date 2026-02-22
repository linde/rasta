describe('Season Ticket Ranker App', () => {
  it('should load the application and display the welcome message', () => {
    cy.visit('/'); // Visit the base URL configured in cypress.config.js
    cy.contains('h1', 'Welcome to the Season Ticket Ranker').should('be.visible');
    cy.contains('p', 'Upload your CSV file to get started.').should('be.visible');
  });
});
