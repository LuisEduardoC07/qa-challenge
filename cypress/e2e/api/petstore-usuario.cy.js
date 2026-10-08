describe("Petstore - CRUD de usuario", () => {
  const api = "https://petstore.swagger.io/v2/user";
  const username = `luis_qa_${Date.now()}`;
  const user = {
    id: Date.now(),
    username,
    firstName: "Luis",
    lastName: "Castillo",
    email: "luis@correo.com",
    password: "Clave123",
    phone: "8095551234",
    userStatus: 1,
  };

  it("1. Crear usuario", () => {
    cy.request("POST", api, user).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.code).to.eq(200);
    });
  });

  it("2. Buscar el usuario creado", () => {
    cy.request("GET", `${api}/${username}`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.username).to.eq(username);
      expect(res.body.email).to.eq("luis@correo.com");
    });
  });

  it("3. Actualizar nombre y correo", () => {
    const actualizado = { ...user, firstName: "Luis Editado", email: "nuevo@correo.com" };
    cy.request("PUT", `${api}/${username}`, actualizado).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  it("4. Buscar el usuario actualizado", () => {
    cy.request("GET", `${api}/${username}`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.firstName).to.eq("Luis Editado");
      expect(res.body.email).to.eq("nuevo@correo.com");
    });
  });

  it("5. Eliminar el usuario", () => {
    cy.request("DELETE", `${api}/${username}`).then((res) => {
      expect(res.status).to.eq(200);
    });
    cy.request({ method: "GET", url: `${api}/${username}`, failOnStatusCode: false })
      .then((res) => {
        expect(res.status).to.eq(404);
      });
  });
});
