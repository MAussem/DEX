import React, { Component } from 'react'
import Web3 from 'web3'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const xlbTokenABI = [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    ]
    const xlbSwapABI = [
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amountOutMin",
            "type": "uint256"
          },
          {
            "internalType": "address[]",
            "name": "path",
            "type": "address[]"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "name": "swapExactETHForTokensSupportingFeeOnTransferTokens",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amountIn",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountOutMin",
            "type": "uint256"
          },
          {
            "internalType": "address[]",
            "name": "path",
            "type": "address[]"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "name": "swapExactTokensForETHSupportingFeeOnTransferTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
    ]
    const web3 = new Web3(window.web3.currentProvider);

    const xlbToken = "0x4B034645BC8B43A300739f83AEaCdbF0E1a90a38";
    const xlbRouter = "0xB36590a4Ce34870682228873aBE1de2E2cA4a413"; 

    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const ethBalance = await web3.eth.getBalance(this.state.account)
    this.setState({ ethBalance })

    // Load Token
    // const networkId =  await web3.eth.net.getId()
    if(xlbToken) {
      const token = new web3.eth.Contract(xlbTokenABI, xlbToken)
      this.setState({ xlbToken: token})
      let tokenBalance = await token.methods.balanceOf(this.state.account).call()
      this.setState({ tokenBalance: tokenBalance.toString() })
    } else {
      window.alert('Token contract not deployed to detected network.')
    }

    // Load XlbSwap
    if(xlbSwapABI) {
      const xlbSwap = new web3.eth.Contract(xlbSwapABI, xlbRouter)
      this.setState({ xlbSwap })
    } else {
      window.alert('XlbSwap contract not deployed to detected network.')
    }

    this.setState({ loading: false })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  buyTokens = async (etherAmount)  => {
    const web3 = new Web3(window.web3.currentProvider);
    const accounts = await web3.eth.requestAccounts()
    this.setState({ loading: true })
    console.dir(this.state);
    this.state.xlbSwap.methods.swapExactETHForTokensSupportingFeeOnTransferTokens(
      web3.utils.toBN(0),
      ["0xF6262304F3A41535549De2afA925f8b7FFc6d779", "0x4B034645BC8B43A300739f83AEaCdbF0E1a90a38"],
      accounts[0],
      web3.utils.toBN(2).pow(web3.utils.toBN(255)))
      .send({from: accounts[0], value: etherAmount }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  sellTokens = async (tokenAmount) => {
    const web3 = new Web3(window.web3.currentProvider);
    const accounts = await web3.eth.requestAccounts()
    this.setState({ loading: true })
    console.dir(tokenAmount);
    this.state.xlbToken.methods.approve("0xB36590a4Ce34870682228873aBE1de2E2cA4a413", web3.utils.toBN(tokenAmount)).send({ from: accounts[0] }).on('receipt', (hash) => {
      this.state.xlbSwap.methods.swapExactTokensForETHSupportingFeeOnTransferTokens(          
        web3.utils.toBN(tokenAmount),
        web3.utils.toBN(0),
        ["0x4B034645BC8B43A300739f83AEaCdbF0E1a90a38", "0xF6262304F3A41535549De2afA925f8b7FFc6d779"],
        accounts[0],
        web3.utils.toBN(2).pow(web3.utils.toBN(255)))
        .send({ from: accounts[0] }).on('receipt', (hash) => {
        this.setState({ loading: false })
    })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      xlbToken: {},
      xlbSwap: {},
      ethBalance: '0',
      tokenBalance: '0',
      loading: true
    }
  }

  render() {
    let content
    if(this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main
        ethBalance={this.state.ethBalance}
        tokenBalance={this.state.tokenBalance}
        buyTokens={this.buyTokens}
        sellTokens={this.sellTokens}
      />
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
