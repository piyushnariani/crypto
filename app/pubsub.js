const PubNub = require('pubnub');

const credentials = { 
    publishKey: 'pub-c-bf444766-04e3-44ab-938d-a0b6a656758b',
    subscribeKey: 'sub-c-a6584ebc-064a-11ea-bc84-32c7c2eb6eff',
    secreyKey: 'sec-c-NmExMDFiNTgtOTg2Ny00MWQ4LTg0N2MtMTQ0NzRlYTczMGVl'
};

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN', 
    TRANSACTION: 'TRANSACTION'
};

class PubSub {
    constructor({ blockchain, transactionPool, wallet }) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubnub = new PubNub(credentials);
        this.pubnub.subscribe({ channels: Object.values(CHANNELS) });
        this.pubnub.addListener(this.listener())
    }

    listener() {
        return {
            message: (messageObject) => {
                const { channel, message } = messageObject;
                console.log(`Message received. Channel: ${channel}. Message: ${message}`);
                const parsedMessage = JSON.parse(message);
                switch(channel) {
                    case CHANNELS.BLOCKCHAIN:
                        this.blockchain.replaceChain(parsedMessage, true, () => {
                            this.transactionPool.clearBlockchainTransactions({
                                chain: parsedMessage
                            });
                        });
                        break;
                    case CHANNELS.TRANSACTION:
                        if(!this.transactionPool.existingTransaction({ inputAddress: this.wallet.publicKey })){
                            this.transactionPool.setTransaction(parsedMessage);
                        }
                        break;
                    default:
                        return;
                }
            }
        };
    }

    publish ({channel, message}) {
        this.pubnub.publish({channel, message});
    }

    broadcastChain() {
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        });
    }

    broadcastTransaction(transaction) {
        this.publish({
            channel: CHANNELS.TRANSACTION,
            message: JSON.stringify(transaction)
        });
    }
}


module.exports = PubSub;