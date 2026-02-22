describe('RaSTA Application', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the application and display the main components', () => {
    // Assert that the main title (RaSTA) in the navigation bar is visible and bold
    cy.get('nav strong').should('contain', 'RaSTA').and('be.visible');

    // Assert that the full title text is visible within the list item (li)
    cy.get('nav li').first().should('contain', 'RaSTA (Rank a Season\'s Tickets Automatically)').and('be.visible');

    // Assert that the file upload section is visible with the correct prompt text
    cy.contains('h3', 'Upload CSV File').should('be.visible');
    cy.contains('small', 'Please upload a CSV file containing your season schedule, or use this example from the 2026 gmen.').should('be.visible');
  });

  it('should reset the application state when the title link is clicked', () => {
    // Load example data to move past the initial screen
    cy.contains('button', 'example').click();
    cy.contains('h3', 'Set Ranking Preferences').should('be.visible');

    // Click the title link to reset the app
    cy.get('nav li').first().find('a').click();

    // Verify that the application has returned to the initial file upload screen
    cy.contains('h3', 'Upload CSV File').should('be.visible');
    cy.contains('small', 'Please upload a CSV file containing your season schedule, or use this example from the 2026 gmen.').should('be.visible');
  });
});
