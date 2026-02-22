describe('Example CSV Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the example, auto-map columns, and display the ranking form', () => {
    // 1. Find and click the button to load the example
    // The button now only contains the text "example"
    cy.contains('button', 'example').click();

    // 2. Verify that the RankingForm is now visible
    cy.contains('h3', 'Set Ranking Preferences').should('be.visible');

    // 3. Interact with the RankingForm
    cy.contains('h4', 'Locations').should('be.visible');
    // Set a preference for Oracle Park
    cy.contains('label', 'Oracle Park - San Francisco')
      .siblings('input[type="range"]')
      .invoke('val', 10) // Set the range slider value
      .trigger('change');

    // 4. Submit the ranking form
    cy.contains('button', 'Generate Ranking').click();

    // 5. Verify that the GameList is displayed
    cy.contains('h3', 'Ranked Games').should('be.visible');

    // Check for at least one ranked game card/details
    cy.get('div.card, details').should('have.length.greaterThan', 0);
  });
});
