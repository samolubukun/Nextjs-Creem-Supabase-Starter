describe("Dashboard guard", () => {
  it("redirects unauthenticated users from dashboard to login", () => {
    cy.visit("/dashboard", { failOnStatusCode: false });
    cy.location("pathname", { timeout: 20000 }).should("eq", "/login");
  });
});
