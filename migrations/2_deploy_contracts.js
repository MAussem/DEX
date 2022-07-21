const Token = artifacts.require("Token");
const XlbSwap = artifacts.require("XlbSwap");

module.exports = async function(deployer) {
  // deploy Token 
  await deployer.deploy(Token);
  const token = await Token.deployed()


 // deploy XlbSwap
  await deployer.deploy(XlbSwap, token.address);
  const xlbSwap = await XlbSwap.deployed()

  // transfer all tokens to swap 1 Million
  await token.transfer(xlbSwap.address, '1000000000000000000000000')
};