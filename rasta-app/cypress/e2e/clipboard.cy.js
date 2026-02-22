describe('Clipboard Copy Functionality', () => {
  beforeEach(() => {
    cy.visit('/');
    // Load example data and complete mapping
    cy.contains('button', 'example').click();
    cy.contains('h3', 'Set Ranking Preferences').should('be.visible');

    // Set some preferences (e.g., for Oracle Park)
    cy.contains('label', 'Oracle Park - San Francisco')
      .siblings('input[type="range"]')
      .invoke('val', 10)
      .trigger('change');
    cy.contains('button', 'Generate Ranking').click();
    cy.contains('h3', 'Ranked Games').should('be.visible');
  });

  it('should copy the ranked games to clipboard and display a success message', () => {
    // Click the share button
    cy.get('button.secondary').first().click(); // Assuming share button is the first secondary button

    // Verify success message
    cy.contains('Copied to clipboard!').should('be.visible');
    
    // Allow message to disappear
    cy.wait(3500);
    cy.contains('Copied to clipboard!').should('not.exist');

    // Verify clipboard content
    // This is the tricky part, as direct programmatic read from clipboard can be restricted.
    // We'll use a workaround: simulate paste into a temporary element.
    cy.window().then((win) => {
      // Create a temporary textarea to paste into
      const textArea = win.document.createElement('textarea');
      win.document.body.appendChild(textArea);
      textArea.focus();

      // Simulate paste
      // Note: cy.realPress or similar is needed for actual paste simulation
      // For basic functionality, we can just read the text if available programmatically.
      // If clipboard read is disallowed, this part might fail in headless modes without specific config.
      if (win.navigator.clipboard && win.navigator.clipboard.readText) {
        return win.navigator.clipboard.readText().then(clipboardText => {
          expect(clipboardText).to.include('My Ranked Season Tickets:');
          expect(clipboardText).to.include('Oracle Park - San Francisco');
          // Add more specific assertions based on expected content from generateShareText
        });
      } else {
        // Fallback or skip if readText is not available (e.g., in some CI environments)
        cy.log('navigator.clipboard.readText not available, skipping direct clipboard content verification.');
      }
    });
  });
});
