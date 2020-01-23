import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'

class App extends Component {
    state = {walletInfo: {}}
    componentDidMount(){
        fetch(`${document.location.origin}/api/wallet-info`)
            .then(response => response.json())
            .then(json => this.setState({walletInfo: json}));
    }
    render() {
        const {address} = this.state.walletInfo;
        return (
            <div className='App'>
                <img className='logo' src={logo}></img>
                <br/>
                <div>
                    <h1>Welcome to WineChain</h1>
                </div>
                <br/>
                <div><Link to='/blocks'>Blocks</Link></div>
                <div><Link to='/conduct-transaction'>Conduct a Transaction</Link></div>
                <div><Link to='/transaction-pool'>Transaction Pool</Link></div>
                <br/>
                <div className='WalletInfo'>Address: {address}</div>
            </div>
        );
    }
}

export default App;