const responseCode = require('./responseCode');
const game = require('./game');
const roulette = require('./roulette');
const colorPrediction = require('./coloPrediction');
const rummy = require('./rummy');
const BASE_URL = process.env.BASE_URL || 'https://socket.brtmultisoftware.com/';

module.exports = {
    ...responseCode,
    ...game,
    ...roulette,
    ...colorPrediction,
    ...rummy,
    BASE_URL
};