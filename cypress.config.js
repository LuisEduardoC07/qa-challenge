const { defineConfig } = require("cypress");

module.exports = defineConfig({
    video: true,
    screenshotOnRunFailure: true,
    reporter: "mochawesome",
    reporterOptions: {
        reportDir: "cypress/reports",
        overwrite: false,
        html: true,
        json: true,
    },
    e2e: {
        specPattern: "cypress/e2e/**/*.cy.js",
        supportFile: false,
    },
});