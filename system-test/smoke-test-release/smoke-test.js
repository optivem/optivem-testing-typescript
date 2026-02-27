const { Calculator } = require("@optivem/optivem-testing");

// Smoke test: verify the published package can be loaded and instantiated
const calculator = new Calculator();

if (!calculator) {
  throw new Error("Failed to instantiate Calculator");
}

console.log("✅ Package loaded and Calculator instantiated successfully");
