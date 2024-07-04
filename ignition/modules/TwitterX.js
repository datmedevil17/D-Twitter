const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TwitterX", (m) => {
  

  const TwitterX = m.contract("TwitterX");

  return { TwitterX };
});
