describe("SauceDemo - Flujo de compra", () => {
  it("Compra dos productos hasta la confirmación", () => {
    cy.visit("https://www.saucedemo.com/");

    cy.get('[data-test="username"]').type("standard_user");
    cy.get('[data-test="password"]').type("secret_sauce");
    cy.get('[data-test="login-button"]').click();
    cy.url().should("include", "/inventory.html");

    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    cy.get('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    cy.get('[data-test="shopping-cart-badge"]').should("have.text", "2");

    cy.get('[data-test="shopping-cart-link"]').click();
    cy.get('[data-test="inventory-item"]').should("have.length", 2);

    cy.get('[data-test="checkout"]').click();
    cy.get('[data-test="firstName"]').type("Luis");
    cy.get('[data-test="lastName"]').type("Castillo");
    cy.get('[data-test="postalCode"]').type("10101");
    cy.get('[data-test="continue"]').click();

    cy.get('[data-test="finish"]').click();
    cy.get('[data-test="complete-header"]')
      .invoke("text")
      .then((t) => {
        expect(t.toUpperCase()).to.eq("THANK YOU FOR YOUR ORDER!");
      });
  });
});
