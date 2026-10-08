describe("SauceDemo - Usuario bloqueado", () => {
  it("CP-E2E-06: locked_out_user no puede iniciar sesión", () => {
    cy.visit("https://www.saucedemo.com/");

    cy.get('[data-test="username"]').type("locked_out_user");
    cy.get('[data-test="password"]').type("secret_sauce");
    cy.get('[data-test="login-button"]').click();

    cy.get('[data-test="error"]')
      .should("be.visible")
      .and("contain", "locked out");
    cy.url().should("not.include", "/inventory.html");
  });
});
