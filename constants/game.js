// Game Number
const DRAGON = 0;
const TIGER = 1;
const TIE = 2;

// Game Names
const GAMES = {
    dragonTiger: "Dragon Tiger",
    cp: "Color Prediction",
    cp1: "Color Prediction1Min",
    cp3: "Color Prediction3Min",
    cp5: "Color Prediction5Min",
    aviator: "Aviator",
    roulette: "Roulette",
    betDailyBonus: "Bet Daily Bonus",
    salaryDailyBonus: "Salary Daily Bonus",
    dailyRebetBonus: "Rebate Bonus",
    dailyMissionRechargeBonus: "Mission Recharge Bonus",
    dailyAttendenceBonus: "Attendence Bonus",
    pointRummy: "Rummy",
    poolRummy: "Rummy Pool",
    dealRummy: "Rummy Deal",
    tournamentRummy: "Rummy Tournament"
}

// Winning amout X Times
const DRAGON_OR_TIGET_MULTIPLY = 2;
const TIE_MULTIPLY = 9;

// Game Start Time
const DRAGON_TIME_FOR_START_NEW_GAME = 5;
const ROULETTE_TIME_FOR_START_NEW_GAME = 5;
const COLOR_PREDICTION_TIME_FOR_START_NEW_GAME = 5;


// Time For Bet
const ROULETTE_TIME_FOR_BET = 10;
const DRAGON_TIME_FOR_BET = 10;
const COLOR_PREDICTION_FOR_BET = 10;




module.exports = {
    DRAGON,
    TIGER,
    TIE,
    GAMES,
    DRAGON_OR_TIGET_MULTIPLY,
    DRAGON_TIME_FOR_BET,
    TIE_MULTIPLY,
    DRAGON_TIME_FOR_START_NEW_GAME,
    ROULETTE_TIME_FOR_START_NEW_GAME,
    ROULETTE_TIME_FOR_BET,
    COLOR_PREDICTION_FOR_BET,
    COLOR_PREDICTION_TIME_FOR_START_NEW_GAME
}