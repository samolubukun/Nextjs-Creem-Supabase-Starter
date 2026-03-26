describe("Auth flows", () => {
  it("loads signup page", () => {
    cy.visit("/signup");
    cy.contains("Start Your System").should("be.visible");
    cy.get('input[id="email"]').should("be.visible");
    cy.get('input[id="password"]').should("be.visible");
  });

  it("loads login page", () => {
    cy.visit("/login");
    cy.contains("Welcome Back").should("be.visible");
    cy.get('input[id="email"]').should("be.visible");
    cy.get('input[id="password"]').should("be.visible");
  });
});
