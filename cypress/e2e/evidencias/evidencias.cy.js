const API = "https://petstore.swagger.io/v2/user";
const json = (o) => JSON.stringify(o, null, 2);
const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Rotulo rojo con el dato medido, solo para la captura
const rotulo = (texto) =>
  cy.document().then((doc) => {
    const d = doc.createElement("div");
    d.textContent = texto;
    d.style.cssText =
      "position:fixed;top:0;left:0;right:0;z-index:99999;background:#b00020;color:#fff;font:bold 16px Arial;padding:8px;text-align:center";
    doc.body.appendChild(d);
  });

const login = (user) => {
  cy.visit("https://www.saucedemo.com/");
  cy.get('[data-test="username"]').type(user);
  cy.get('[data-test="password"]').type("secret_sauce");
  cy.get('[data-test="login-button"]').click();
};

// Dibuja request y response en una pagina para poder capturarlos
const mostrarApi = (nombre, peticion, respuesta) => {
  cy.visit("https://petstore.swagger.io/");
  cy.document().then((doc) => {
    const texto = `${nombre}\n\nREQUEST\n${peticion}\n\nRESPONSE\n${respuesta}`;
    doc.body.innerHTML =
      '<pre style="font:14px Consolas,monospace;padding:16px;white-space:pre-wrap">' +
      esc(texto) +
      "</pre>";
  });
  cy.screenshot(nombre);
};

const nuevo = (extra = {}) => ({
  id: Date.now(),
  username: `qa_evid_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  firstName: "Luis",
  lastName: "Castillo",
  email: "luis@correo.com",
  password: "Clave123",
  phone: "8095551234",
  userStatus: 1,
  ...extra,
});

describe("Evidencias SauceDemo", () => {
  it("H-01 telemetria con 401", () => {
    cy.intercept("POST", "**backtrace.io/**").as("telemetria");
    login("standard_user");
    cy.wait("@telemetria").then(({ request, response }) => {
      cy.log(`POST ${request.url} -> ${response.statusCode}`);
      expect(response.statusCode).to.eq(401);
      rotulo(`H-01: POST a events.backtrace.io respondio ${response.statusCode}`);
    });
    cy.screenshot("H-01-telemetria-401");
    cy.screenshot("H-01-telemetria-401-runner", { capture: "runner" });
  });

  it("H-02 problem_user", () => {
    login("problem_user");
    cy.get(".inventory_item_img img").then(($i) => {
      const distintas = new Set([...$i].map((i) => i.getAttribute("src"))).size;
      rotulo(`H-02: ${$i.length} productos y solo ${distintas} imagen distinta`);
    });
    cy.screenshot("H-02a-imagenes-problem-user");
    cy.get('button[data-test^="add-to-cart"]').each(($b) => cy.wrap($b).click());
    cy.get('[data-test="shopping-cart-badge"]')
      .invoke("text")
      .then((n) => rotulo(`H-02: se agregaron 6 productos y el carrito muestra ${n}`));
    cy.screenshot("H-02b-carrito-problem-user");
  });

  it("H-03 error_user", () => {
    let errorApp = "";
    cy.on("uncaught:exception", (err) => {
      errorApp = err.message;
      return false;
    });
    login("error_user");
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    cy.get('[data-test="shopping-cart-link"]').click();
    cy.get('[data-test="checkout"]').click();
    cy.get('[data-test="firstName"]').type("Luis");
    cy.get('[data-test="lastName"]').type("Castillo");
    cy.get('[data-test="postalCode"]').type("10101");
    cy.then(() => {
      rotulo(errorApp ? `H-03: error de la aplicacion: ${errorApp}` : "H-03: sin error detectado");
    });
    cy.screenshot("H-03-error-user");
  });

  it("H-04 performance_glitch_user", () => {
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
      .then(() => rotulo(`H-04: el login tardo ${Date.now() - inicio} ms`));
    cy.screenshot("H-04-login-lento");
  });

  it("H-05 visual_user", () => {
    login("visual_user");
    cy.get('[data-test="inventory-item-price"]')
      .first()
      .invoke("text")
      .then((precioInv) => {
        cy.get('button[data-test^="add-to-cart"]').first().click();
        cy.get('[data-test="shopping-cart-link"]').click();
        cy.get('[data-test="inventory-item-price"]')
          .first()
          .invoke("text")
          .then((precioCar) => rotulo(`H-05: inventario ${precioInv} / carrito ${precioCar}`));
      });
    cy.screenshot("H-05-precio-visual-user");
  });

  it("H-06 carrito persistente", () => {
    login("standard_user");
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    cy.get("#react-burger-menu-btn").click();
    cy.get("#logout_sidebar_link").click();
    cy.get('[data-test="username"]').type("standard_user");
    cy.get('[data-test="password"]').type("secret_sauce");
    cy.get('[data-test="login-button"]').click();
    cy.get('[data-test="shopping-cart-badge"]')
      .invoke("text")
      .then((n) => rotulo(`H-06: tras Logout y nuevo login el carrito muestra ${n}`));
    cy.screenshot("H-06-carrito-persistente");
  });

  it("H-07 codigo postal sin validacion", () => {
    login("standard_user");
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    cy.get('[data-test="shopping-cart-link"]').click();
    cy.get('[data-test="checkout"]').click();
    cy.get('[data-test="firstName"]').type("Luis");
    cy.get('[data-test="lastName"]').type("Castillo");
    cy.get('[data-test="postalCode"]').type("abc!@#");
    cy.get('[data-test="continue"]').click();
    cy.get("body").then(($b) => {
      const hayError = $b.find('[data-test="error"]').length > 0;
      rotulo(
        hayError
          ? "H-07: se muestra un error de validacion"
          : "H-07: con abc!@# en Postal Code no se muestra ningun error"
      );
    });
    cy.screenshot("H-07-codigo-postal");
  });
});

describe("Evidencias API - hallazgos", () => {
  it("H-09 type unknown", () => {
    const u = nuevo();
    cy.request({ method: "POST", url: API, body: u, failOnStatusCode: false }).then((res) =>
      mostrarApi("H-09-type-unknown", `POST ${API}\n${json(u)}`, `Status ${res.status}\n${json(res.body)}`)
    );
  });

  it("H-10 username duplicado", () => {
    const u = nuevo();
    cy.request("POST", API, u);
    cy.request({ method: "POST", url: API, body: u, failOnStatusCode: false }).then((res) =>
      mostrarApi(
        "H-10-duplicado",
        `POST ${API} (mismo username, segunda vez)\n${json(u)}`,
        `Status ${res.status}\n${json(res.body)}`
      )
    );
  });

  it("H-11 password en el GET", () => {
    const u = nuevo();
    cy.request("POST", API, u);
    cy.request("GET", `${API}/${u.username}`).then((res) =>
      mostrarApi("H-11-password-expuesto", `GET ${API}/${u.username}`, `Status ${res.status}\n${json(res.body)}`)
    );
  });

  it("H-12 body invalido", () => {
    const malo = { id: "no-es-numero", username: 12345 };
    cy.request({ method: "POST", url: API, body: malo, failOnStatusCode: false }).then((res) =>
      mostrarApi(
        "H-12-body-invalido",
        `POST ${API}\n${json(malo)}`,
        `Status ${res.status}\n${typeof res.body === "string" ? res.body : json(res.body)}`
      )
    );
  });

  it("H-13 email y telefono invalidos", () => {
    const u = nuevo({ email: "abc", phone: "letras" });
    cy.request({ method: "POST", url: API, body: u, failOnStatusCode: false }).then((res) =>
      mostrarApi("H-13-formato-invalido", `POST ${API}\n${json(u)}`, `Status ${res.status}\n${json(res.body)}`)
    );
  });
});

describe("Evidencias API - CRUD (entradas y salidas)", () => {
  const u = nuevo();

  it("CP-API-01 crear", () => {
    cy.request({ method: "POST", url: API, body: u, failOnStatusCode: false }).then((res) =>
      mostrarApi("CP-API-01-crear", `POST ${API}\n${json(u)}`, `Status ${res.status}\n${json(res.body)}`)
    );
  });

  it("CP-API-02 consultar", () => {
    cy.request("GET", `${API}/${u.username}`).then((res) =>
      mostrarApi("CP-API-02-consultar", `GET ${API}/${u.username}`, `Status ${res.status}\n${json(res.body)}`)
    );
  });

  it("CP-API-03 actualizar", () => {
    const act = { ...u, firstName: "Luis Editado", email: "nuevo@correo.com" };
    cy.request({ method: "PUT", url: `${API}/${u.username}`, body: act, failOnStatusCode: false }).then((res) =>
      mostrarApi("CP-API-03-actualizar", `PUT ${API}/${u.username}\n${json(act)}`, `Status ${res.status}\n${json(res.body)}`)
    );
  });

  it("CP-API-04 consultar actualizado", () => {
    cy.request("GET", `${API}/${u.username}`).then((res) =>
      mostrarApi("CP-API-04-consultar-actualizado", `GET ${API}/${u.username}`, `Status ${res.status}\n${json(res.body)}`)
    );
  });

  it("CP-API-05 eliminar y verificar", () => {
    cy.request({ method: "DELETE", url: `${API}/${u.username}`, failOnStatusCode: false }).then((del) => {
      cy.request({ method: "GET", url: `${API}/${u.username}`, failOnStatusCode: false }).then((get) =>
        mostrarApi(
          "CP-API-05-eliminar",
          `DELETE ${API}/${u.username}\nGET ${API}/${u.username} (despues de eliminar)`,
          `DELETE -> Status ${del.status}\n${json(del.body)}\n\nGET -> Status ${get.status}\n${json(get.body)}`
        )
      );
    });
  });
});
