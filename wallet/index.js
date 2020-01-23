const { STARTING_BALANCE } = require('../config');
const { ec, cryptoHash } = require('../util');
const Transaction = require('./transaction');

class Wallet {
    constructor() {
        this.inventory = [];
        this.keyPair = ec.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    sign(data) {
        return this.keyPair.sign(cryptoHash(data));
    }

    createTransaction({recipient, productId, chain, temp, waterQuality}){
        let path = [];
        for(let i=1; i< chain.length; i++){
            const block = chain[i];
            for(let transaction of block.data){
                if(transaction.outputMap['productId'] === productId) {
                    path.push([transaction.input.address, transaction.input.timestamp, transaction.outputMap['recipient']]);
                    console.log(path);
                }
            }
        }

        if(path.length!==0){
            let owner = path[path.length-1][2];
            if(this.publicKey!==owner){
                throw new Error('Not authorized to create this transaction');
            };
        }
        

        // if(chain){
        //     this.balance = Wallet.calculateBalance({
        //         chain,
        //         address: this.publicKey
        //     });
        // }

        // if(amount> this.balance){
        //     throw new Error('Amount exceeds balance');
        // }

        return new Transaction({senderWallet: this, recipient, productId});
    }


    addProduct({productId, chain}){
        let path = [];
        for(let i=1; i< chain.length; i++){
            const block = chain[i];
            for(let transaction of block.data){
                if(transaction.outputMap['productId'] === productId) {
                    path.push([transaction.input.address, transaction.input.timestamp, transaction.outputMap['recipient']]);
                    // console.log(path);
                }
            }
        }

        if(path.length!==0){
            // let owner = path[path.length-1][2];
            // if(this.publicKey!==owner){
            //     throw new Error('Not authorized to create this transaction');
            // };
            throw new Error('Not authorized to add this product');
        }

        // if(chain){
        //     this.balance = Wallet.calculateBalance({
        //         chain,
        //         address: this.publicKey
        //     });
        // }

        // if(amount> this.balance){
        //     throw new Error('Amount exceeds balance');
        // }

        return new Transaction({senderWallet: this, recipient: this, productId});
    }

    static calculateBalance({chain, address}){
        let hasConductedTransaction = false;
        let outputsTotal = 0;

        for(let i = chain.length-1; i > 0; i--){
            const block = chain[i];

            for(let transaction of block.data) {
                if(transaction.input.address === address){
                    hasConductedTransaction = true;
                }
                const addressOutput = transaction.outputMap[address];
                if(addressOutput){
                    outputsTotal += addressOutput;
                }
            }
            if(hasConductedTransaction) {
                break;
            }
        }
        return hasConductedTransaction ? outputsTotal:  STARTING_BALANCE + outputsTotal;
    }
}

module.exports = Wallet;