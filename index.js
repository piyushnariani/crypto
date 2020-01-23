const express = require('express');
const cors = require('cors');
const request = require('request');
const path = require('path');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');
const TransactionMiner = require('./app/transaction-miner');

const isDevelopment = process.env.ENV === 'development';

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool, wallet });
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub});

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDEESS = `http://localhost:${DEFAULT_PORT}`;

setTimeout(() => pubsub.broadcastChain(), 1000);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.get('/api/track/:productId', (req, res) => {
    let path = blockchain.trackProduct(req.params.productId);
    res.json(path);
});


app.post('/api/addProduct', (req, res) => {
    const{productId} = req.body;
    transaction = wallet.createTransaction({productId, chain: blockchain.chain});
    transactionPool.setTransaction(transaction);
    pubsub.broadcastTransaction(transaction);
    res.redirect('/api/mine-transactions');
});

app.post('/api/mine', (req, res) => {
    const {data} = req.body;

    blockchain.addBlock({data});
    pubsub.broadcastChain();
    res.redirect('/api/blocks');
});

app.post('/api/transact', (req, res) => {
    const {productId, recipient} = req.body;
    let transaction = transactionPool.existingTransaction({inputAddress: wallet.publicKey});
    try{
        if(transaction){
            transaction.update({senderWallet: wallet, recipient, amount });
        } else {
            transaction = wallet.createTransaction({recipient, productId, chain: blockchain.chain});
        }
    } catch(err) {
        return res.status(400).json({type:'error', message: err.message});
    }
    transactionPool.setTransaction(transaction);
    pubsub.broadcastTransaction(transaction);
    transactionMiner.mineTransactions();
    res.json({type: 'success', transaction });
});

app.get('/api/transaction-pool-map', (req, res) => {
    res.json(transactionPool.transactionMap);
});

app.get('/api/mine-transactions', (req, res) => {
    transactionMiner.mineTransactions();
    res.redirect('/api/blocks');
});

app.get('/api/wallet-info', (req, res) => {
    const address = wallet.publicKey;
    res.json({
        address
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
})

const syncWithRootState = () => {
    request({url: `${ROOT_NODE_ADDEESS}/api/blocks`}, (err, res, body) => {
        if(!err && res.statusCode === 200) {
            const rootChain = JSON.parse(body);
            console.log('replace chain on a sync with', rootChain);
            blockchain.replaceChain(rootChain);
        }
    });
    request({url: `${ROOT_NODE_ADDEESS}/api/transaction-pool-map`}, (err, res, body) => {
        if(!err && res.statusCode === 200){
            const rootTransactionPoolMap = JSON.parse(body);
            console.log('replace transaction pool map on a sync with', rootTransactionPoolMap);
            transactionPool.setMap(rootTransactionPoolMap);
        }
    });
}
if(isDevelopment) {
    const walletFoo = new Wallet();
    const walletBar = new Wallet();

    const generateWalletTransaction = ({wallet, recipient, productId}) => {
        const transaction = wallet.createTransaction({
            recipient, productId, chain: blockchain.chain
        });

        transactionPool.setTransaction(transaction);
    };

    const walletInAction = () => generateWalletTransaction({
        wallet, recipient: wallet.publicKey, productId: "1"
    });

    const walletAction = () => generateWalletTransaction({
        wallet, recipient: walletFoo.publicKey, productId: "1"
    });

    const walletFooAction = () => generateWalletTransaction({
        wallet: walletFoo, recipient: walletBar.publicKey, productId: "1"
    });

    const walletBarAction = () => generateWalletTransaction({
        wallet: walletBar, recipient: wallet.publicKey, productId: "1"
    });

    walletInAction();
    walletAction();
    walletFooAction();
    // walletBarAction();

    transactionMiner.mineTransactions();
}



let PEER_PORT;

if(process.env.GENERATE_PEER_PORT === 'true'){
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`listening at localhost:${PORT}`);

    if(PORT !== DEFAULT_PORT){
        syncWithRootState();
    }
})