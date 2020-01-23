const Block = require('./block');
const Transaction = require('../wallet/transaction');
const {cryptoHash} = require('../util');
// const Wallet = require('../wallet');
// const {REWARD_INPUT, MINING_REWARD} = require('../config');

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock({ data }) {
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length-1],
            data
        });

        this.chain.push(newBlock);
    }

    trackProduct(productId){
        let path = [];
        for(let i=1; i< this.chain.length; i++){
            const block = this.chain[i];
            for(let transaction of block.data){
                if(transaction.outputMap['productId'] == productId) {
                    path.push([transaction.input.address, transaction.input.timestamp, transaction.outputMap['recipient']]);
                }
            }
        }
        console.log(path);
        if(path.length === 0){
            return new Error('Product not found');
        }
        else{
            return path;
        }
    }

    validTransactionData({chain}){
        for(let i = 1; i< chain.length; i++){
            const block = chain[i];
            const transactionSet = new Set();
            for(let transaction of block.data){
                if(!Transaction.validTransaction(transaction)){
                    console.error('Invalid Transaction');
                    return false;
                }

                if(transactionSet.has(transaction)) {
                    console.error('Identical transaction appears more than once in the block');
                    return false;
                } else {
                    transactionSet.add(transaction);
                }
            }

            // const transactionSet = new Set();
            // let rewardTransactionCount = 0;

            // for(let transaction of block.data) {
            //     if(transaction.input.address === REWARD_INPUT.address){
            //         rewardTransactionCount += 1;

            //         if(rewardTransactionCount > 1) {
            //             console.error('Miner rewards exceed limit');
            //             return false;
            //         }

            //         if(Object.values(transaction.outputMap)[0] !== MINING_REWARD){
            //             console.error('Miner reward amount is invalid');
            //             return false;
            //         }
            //     } else {
            //         if(!Transaction.validTransaction(transaction)){
            //             console.error('Invalid transaction');
            //             return false;
            //         }

            //         const trueBalance = Wallet.calculateBalance({
            //             chain: this.chain,
            //             address: transaction.input.address
            //         });

            //         if(transaction.input.amount !== trueBalance){
            //             console.error('Invalid input amount');
            //             return false;
            //         }

            //         if(transactionSet.has(transaction)) {
            //             console.error('Identical transaction appears more than once in the block');
            //             return false;
            //         } else {
            //             transactionSet.add(transaction);
            //         }
            //     }
            // }
        }
        return true;
    }

    static isValidChain(chain) {
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false;
        }

        for(let i = 1; i<chain.length; i++){
            const {timestamp, lastHash, hash, data, nonce, difficulty} = chain[i];

            const actualLastHash = chain[i-1].hash;
            const lastDifficulty = chain[i-1].difficulty;

            if(lastHash != actualLastHash) return false;
            
            const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
            if(hash != validatedHash) return false;

            if(Math.abs(lastDifficulty - difficulty)>1) return false;
        }
        return true;
    }

    replaceChain(chain, validateTransactions, onSuccess) {
        if(chain.length <= this.chain.length) {
            console.error('Incoming chain must be longer.');
            return;
        }

        if(!Blockchain.isValidChain(chain)) {
            console.error('The incoming chain must be valid.');
            return;
        }

        if(validateTransactions && !this.validTransactionData({chain})){
            console.error('The incoming chain must be valid');
            return;
        }
        if(onSuccess) onSuccess();
        console.log('Replacing the chain with', chain);
        this.chain = chain;
    }
}

module.exports = Blockchain;