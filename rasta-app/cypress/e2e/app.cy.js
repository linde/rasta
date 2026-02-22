describe('RASTA Application', () => {
  it('should load the application and display the main components', () => {
    cy.visit('/'); // Visit the base URL configured in cypress.config.js

    // Assert that the main title in the navigation bar is visible
    cy.contains('strong', 'RASTA (Rank A Season\'s Tickets Automatically)').should('be.visible');

    // Assert that the file upload section is visible with the correct prompt text
    cy.contains('h3', 'Upload CSV File').should('be.visible');
    cy.contains('small', 'Please upload a CSV file containing your season schedule, or use this example from the 2026 gmen.').should('be.visible');
  });
});
