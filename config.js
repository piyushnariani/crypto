const MINE_RATE = 1000; //Mining should not take more than 1000ms i.e. 1 second
const INITIAL_DIFFICULTY = 4; //Difficulty level, i.e. number of leading zeros

//Genesis block data
const GENESIS_DATA = {
    timestamp: 1,
    lastHash: '_____',
    hash: 'hash-one',
    difficulty: INITIAL_DIFFICULTY,
    nonce: 0,
    data: []
};

const STARTING_BALANCE = 1000; //Initial balance when the wallet is initiated.

const REWARD_INPUT = { address: '*authorized-rewards*' }

const MINING_REWARD = 50;

module.exports = { GENESIS_DATA, MINE_RATE, STARTING_BALANCE, REWARD_INPUT, MINING_REWARD };