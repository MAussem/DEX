const { assert } = require('chai')
const Token = artifacts.require('Token')
const XlbSwap = artifacts.require('XlbSwap')

require('chai')
.use(require('chai-as-promised'))
.should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

contract('XlbSwap', (accounts) => {
  let token, xlbSwap

  before(async ()=> {
    token = await Token.new()
    xlbSwap = await XlbSwap.new(token.address)
    // transfer all tokens to swap 1 Million
    await token.transfer(xlbSwap.address, tokens('1000000'))
  })

  describe('Token Deployment', async () => {
    it('contract has a name', async () => {
      const name = await token.name()
      assert.equal(name, 'DApp Token')
    })
  })

  describe('XlbSwap Deployment', async () => {
    it('contract has a name', async () => {
      const name = await xlbSwap.name()
      assert.equal(name, 'Xlb Swap')
    })

    it('contract has tokens', async () => {
      let balance = await token.balanceOf(xlbSwap.address)
      assert.equal(balance.toString(), tokens('1000000'))
    })
  })

  describe('buyTokens()', async () => {
    let result
    
    before(async ()=> {
      // Purchase Tokens before each example
      result = await xlbSwap.buyTokens({from: accounts[1], value: web3.utils.toWei('1', 'ether')})
    })

    it('Allows user to instantly purchase tokens from ethSwap for a fixed price', async () => {
      // check account[1](investor) balance after purchase
      let investorBalance = await token.balanceOf(accounts[1])
      assert.equal(investorBalance.toString(), tokens('100'))

      // check swap balance 
      let xlbSwapBalance = await token.balanceOf(xlbSwap.address)
      assert.equal(xlbSwapBalance.toString(), tokens('999900'))
      xlbSwapBalance = await web3.eth.getBalance(xlbSwap.address)
      assert.equal(xlbSwapBalance.toString(), web3.utils.toWei('1', 'Ether'))

      // check logs to ensure event was emitted with correct data
      const event = result.logs[0].args
      assert.equal(event.account, accounts[1])
      assert.equal(event.token, token.address)
      assert.equal(event.amount.toString(), tokens('100').toString())
      assert.equal(event.rate.toString(), '100')

    })
  })

  describe('sellTokens()', async () => {
    let result
    
    before(async ()=> {
      // investor must approve the purchase
      await token.approve(xlbSwap.address, tokens('100'), {from: accounts[1]} )
      // sell tokens
      result = await xlbSwap.sellTokens(tokens('100'), {from: accounts[1]})
    })

    it('Allows user to instantly sell tokens to xlbSwap for a fixed price', async () => {
      // check account[1](investor) balance after purchase
      let investorBalance = await token.balanceOf(accounts[1])
      assert.equal(investorBalance.toString(), tokens('0'))

      // check swap balance 
      let xlbSwapBalance = await token.balanceOf(xlbSwap.address)
      assert.equal(xlbSwapBalance.toString(), tokens('1000000'))
      xlbSwapBalance = await web3.eth.getBalance(xlbSwap.address)
      assert.equal(xlbSwapBalance.toString(), web3.utils.toWei('0', 'Ether'))

      // check logs to ensure event was emitted with correct data
      const event = result.logs[0].args
      assert.equal(event.account, accounts[1])
      assert.equal(event.token, token.address)
      assert.equal(event.amount.toString(), tokens('100').toString())
      assert.equal(event.rate.toString(), '100')

      // FAILURER: inverstor cant sell more tokens than they hahve
      await xlbSwap.sellTokens(tokens('500'), {from: accounts[1]}).should.be.rejected

    })
  })

})