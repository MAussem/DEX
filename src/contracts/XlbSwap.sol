pragma solidity ^0.5.0;

import "./Token.sol";

contract XlbSwap {
    string public name = "Xlb Swap";
    Token public token;
    uint256 public rate = 100;

    event TokensPurchased(
        address account,
        address token,
        uint256 amount,
        uint256 rate
    );

    event TokensSold(
        address account,
        address token,
        uint256 amount,
        uint256 rate
    );

    constructor(Token _token) public {
        token = _token;
    }

    function buyTokens() public payable {
        // calc number of tokens to buy
        uint256 tokenAmount = msg.value * rate;

        // Require that Swap has enough tokens to buy
        // this refrences the contract address of XlbSwap
        require(token.balanceOf(address(this)) >= tokenAmount);

        // transfer tokens to the user
        token.transfer(msg.sender, tokenAmount);

        // Emit an event
        emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint256 _amount) public {
        // user cant sell more than they have
        require(token.balanceOf(msg.sender) >= _amount);

        // calc the amount of ether to redeem
        uint256 etherAmount = _amount / rate;

        // require xlbSwap has enough ether
        require(address(this).balance >= etherAmount);

        // preform sale
        token.transferFrom(msg.sender, address(this), _amount);
        msg.sender.transfer(etherAmount);

        // emit event
        emit TokensSold(msg.sender, address(token), _amount, rate);
    }
}
