describe("Checkout flow", () => {
  it("unauthenticated checkout request returns unauthorized", () => {
    cy.visit("/pricing");

    cy.intercept("POST", "/api/checkout").as("checkout");
    cy.contains("Initiate Payment").first().click();

    cy.wait("@checkout").its("response.statusCode").should("eq", 401);
  });
});
