EJERCICIO E2E - SauceDemo (Opcion 2)
Herramienta: Cypress 16.1.1 (Node.js LTS)
Sitio probado: https://www.saucedemo.com/

REQUISITOS
- Node.js LTS y Git
- Google Chrome

PASOS PARA EJECUTAR
1. Abrir una terminal en la carpeta raiz del proyecto.
2. npm install
3. npx cypress install   (descarga el binario de Cypress si hace falta)
4. Modo visual: npx cypress open  -> E2E Testing -> Chrome -> elegir el archivo.
5. Modo consola: npx cypress run --browser chrome --spec "cypress/e2e/e2e/*.cy.js"

ARCHIVOS
- cypress/e2e/e2e/saucedemo.cy.js : flujo de compra (login, 2 productos, carrito, formulario y mensaje THANK YOU FOR YOUR ORDER).
- cypress/e2e/e2e/saucedemo-bloqueado.cy.js : caso negativo con locked_out_user.
- cypress/e2e/hallazgos/saucedemo-hallazgos.cy.js : verificacion de hallazgos. Una prueba en rojo significa que el defecto existe (falla a proposito).
- cypress/e2e/evidencias/evidencias.cy.js : genera capturas anotadas como evidencia.
- cypress/screenshots, cypress/videos, cypress/reports : evidencias de ejecucion (capturas, videos y reportes HTML/JSON de mochawesome).
- docs/ : documento de pruebas QA (manuales y automatizadas, con capturas).
