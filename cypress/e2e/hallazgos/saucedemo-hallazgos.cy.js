const login = (user) => {
  cy.visit("https://www.saucedemo.com/");
  cy.get('[data-test="username"]').type(user);
  cy.get('[data-test="password"]').type("secret_sauce");
  cy.get('[data-test="login-button"]').click();
};

const irAlResumen = (user) => {
  login(user);
  cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  cy.get('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
  cy.get('[data-test="shopping-cart-link"]').click();
  cy.get('[data-test="checkout"]').click();
  cy.get('[data-test="firstName"]').type("Luis");
  cy.get('[data-test="lastName"]').type("Castillo");
  cy.get('[data-test="postalCode"]').type("10101");
  cy.get('[data-test="continue"]').click();
};

const num = (t) => parseFloat(t.replace(/[^0-9.]/g, ""));

describe("Hallazgos SauceDemo", () => {
  it("H-02 problem_user: cada producto tiene su propia imagen", () => {
    login("problem_user");
    cy.get(".inventory_item_img img").then(($imgs) => {
      const srcs = [...$imgs].map((i) => i.getAttribute("src"));
      expect(new Set(srcs).size, "imagenes distintas").to.eq(srcs.length);
    });
  });

  it("H-02 problem_user: todos los botones Add to cart funcionan", () => {
    login("problem_user");
    cy.get('button[data-test^="add-to-cart"]').each(($b) => {
      cy.wrap($b).click();
    });
    cy.get('[data-test="shopping-cart-badge"]').should("have.text", "6");
  });

  it("H-03 error_user: se puede completar la compra", () => {
    login("error_user");
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    cy.get('[data-test="shopping-cart-link"]').click();
    cy.get('[data-test="checkout"]').click();
    cy.get('[data-test="firstName"]').type("Luis");
    cy.get('[data-test="lastName"]').type("Castillo").should("have.value", "Castillo");
    cy.get('[data-test="postalCode"]').type("10101");
    cy.get('[data-test="continue"]').click();
    cy.get('[data-test="finish"]').click();
    cy.url().should("include", "checkout-complete");
  });

  it("H-04 performance_glitch_user: login en menos de 2 segundos", () => {
    let inicio;
    cy.visit("https://www.saucedemo.com/");
    cy.get('[data-test="username"]').type("performance_glitch_user");
    cy.get('[data-test="password"]').type("secret_sauce");
    cy.then(() => {
      inicio = Date.now();
    });
    cy.get('[data-test="login-button"]').click();
    cy.url({ timeout: 20000 })
      .should("include", "/inventory.html")
      .then(() => {
        const ms = Date.now() - inicio;
        cy.log(`Tiempo de login: ${ms} ms`);
        expect(ms, "ms de login").to.be.lessThan(2000);
      });
  });

  it("H-05 visual_user: el precio es igual en inventario y carrito", () => {
    login("visual_user");
    cy.get('[data-test="inventory-item-price"]')
      .first()
      .invoke("text")
      .then((precioInventario) => {
        cy.get('button[data-test^="add-to-cart"]').first().click();
        cy.get('[data-test="shopping-cart-link"]').click();
        cy.get('[data-test="inventory-item-price"]')
          .first()
          .invoke("text")
          .should("eq", precioInventario);
      });
  });

  it("H-06 standard_user: el carrito queda vacio tras cerrar sesion", () => {
    login("standard_user");
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    cy.get("#react-burger-menu-btn").click();
    cy.get("#logout_sidebar_link").click();
    cy.get('[data-test="username"]').type("standard_user");
    cy.get('[data-test="password"]').type("secret_sauce");
    cy.get('[data-test="login-button"]').click();
    cy.get('[data-test="shopping-cart-badge"]').should("not.exist");
  });

  it("H-07 standard_user: el codigo postal rechaza letras y simbolos", () => {
    login("standard_user");
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    cy.get('[data-test="shopping-cart-link"]').click();
    cy.get('[data-test="checkout"]').click();
    cy.get('[data-test="firstName"]').type("Luis");
    cy.get('[data-test="lastName"]').type("Castillo");
    cy.get('[data-test="postalCode"]').type("abc!@#");
    cy.get('[data-test="continue"]').click();
    cy.get('[data-test="error"]').should("be.visible");
  });

  it("H-08 standard_user: Total = Item total + Tax", () => {
    irAlResumen("standard_user");
    cy.get('[data-test="subtotal-label"]').invoke("text").then((s) => {
      cy.get('[data-test="tax-label"]').invoke("text").then((t) => {
        cy.get('[data-test="total-label"]').invoke("text").then((tot) => {
          const esperado = Math.round((num(s) + num(t)) * 100) / 100;
          expect(num(tot), "total").to.eq(esperado);
        });
      });
    });
  });
});
