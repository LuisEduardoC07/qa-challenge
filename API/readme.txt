EJERCICIO APIs - Swagger Petstore (Opcion 3, CRUD de usuario)
Herramienta: Cypress 16.1.1 (cy.request)
Servicio probado: https://petstore.swagger.io/v2/user

REQUISITOS
- Node.js LTS y Git
- Conexion a internet (Petstore es un servidor publico compartido)

PASOS PARA EJECUTAR
1. Abrir una terminal en la carpeta raiz del proyecto.
2. npm install
3. npx cypress install   (descarga el binario de Cypress si hace falta)
4. Modo visual: npx cypress open  -> E2E Testing -> Chrome -> petstore-usuario.
5. Modo consola: npx cypress run --browser chrome --spec "cypress/e2e/api/*.cy.js"

ARCHIVOS
- cypress/e2e/api/petstore-usuario.cy.js : ciclo completo (crear, buscar, actualizar, buscar de nuevo, eliminar y verificar 404). Las pruebas dependen una de otra; no cambiar el orden.
- cypress/e2e/hallazgos/petstore-hallazgos.cy.js : verificacion de hallazgos. Una prueba en rojo significa que el defecto existe (falla a proposito).
- cypress/e2e/evidencias/evidencias.cy.js : genera capturas con el request (entrada) y la response (salida) de cada caso.
- cypress/screenshots, cypress/videos, cypress/reports : evidencias de ejecucion.
- docs/ : documento de pruebas QA.
