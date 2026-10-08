const api = "https://petstore.swagger.io/v2/user";

const nuevo = (extra = {}) => ({
  id: Date.now(),
  username: `qa_hallazgo_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  firstName: "Luis",
  lastName: "Castillo",
  email: "luis@correo.com",
  password: "Clave123",
  phone: "8095551234",
  userStatus: 1,
  ...extra,
});

const borrar = (u) =>
  cy.request({ method: "DELETE", url: `${api}/${u}`, failOnStatusCode: false });

describe("Hallazgos Petstore", () => {
  it("H-09 la respuesta del POST es descriptiva (type distinto de unknown)", () => {
    const u = nuevo();
    cy.request("POST", api, u).then((res) => {
      expect(res.body.type, "type").to.not.eq("unknown");
      expect(res.body.message, "message").to.not.match(/^\d+$/);
    });
    borrar(u.username);
  });

  it("H-10 un username duplicado devuelve 409", () => {
    const u = nuevo();
    cy.request("POST", api, u);
    cy.request({ method: "POST", url: api, body: u, failOnStatusCode: false }).then(
      (res) => {
        expect(res.status, "status del duplicado").to.eq(409);
      }
    );
    borrar(u.username);
  });

  it("H-11 el GET no devuelve la contrasena", () => {
    const u = nuevo();
    cy.request("POST", api, u);
    cy.request("GET", `${api}/${u.username}`).then((res) => {
      expect(res.body, "body").to.not.have.property("password");
    });
    borrar(u.username);
  });

  it("H-12 un body invalido devuelve 400", () => {
    cy.request({
      method: "POST",
      url: api,
      body: { id: "no-es-numero", username: 12345 },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status, "status").to.eq(400);
    });
  });

  it("H-13 rechaza email y telefono con formato invalido", () => {
    const u = nuevo({ email: "abc", phone: "letras" });
    cy.request({ method: "POST", url: api, body: u, failOnStatusCode: false }).then(
      (res) => {
        expect(res.status, "status").to.eq(400);
      }
    );
    borrar(u.username);
  });

  it("H-14 el servidor responde en menos de 2 segundos", () => {
    const u = nuevo();
    cy.request("POST", api, u).then((res) => {
      cy.log(`POST: ${res.duration} ms`);
      expect(res.duration, "ms POST").to.be.lessThan(2000);
    });
    cy.request("GET", `${api}/${u.username}`).then((res) => {
      cy.log(`GET: ${res.duration} ms`);
      expect(res.duration, "ms GET").to.be.lessThan(2000);
    });
    borrar(u.username);
  });
});
