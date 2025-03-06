const dbConfig = require('../config/dbConfig.js');
const {Sequelize,DataTypes} = require('sequelize');
const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD,{
        logging: false,
        host: dbConfig.HOST,
        port: dbConfig.PORT,
        dialect: dbConfig.dialect,
        useUTC: false,
        dateStrings: dbConfig.dateStrings,
        timezone:"+05:30"
    },
);

sequelize.authenticate()
// .then(() => {
//     console.log('connected..')
// })   
// .catch(err => {
//     console.log('Error'+ err)
// })

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize
db.aviator = require('./aviatorModel.js')(sequelize, DataTypes);
db.user = require('./userModel.js')(sequelize, DataTypes);
db.game = require('./gameModel.js')(sequelize, DataTypes);
db.setting = require('./settingModel.js')(sequelize, DataTypes);
db.admin = require('./adminModel.js')(sequelize, DataTypes);
db.statement = require('./statementModel.js')(sequelize, DataTypes);
db.direct_profit_statement = require('./directProfitStatementModel.js')(sequelize, DataTypes);


////////////////////////////////// Bet Level Models ///////////////////////////////////////////////
db.BetIncomeLog = require('./bonus/betIncomeLog.js')(sequelize, DataTypes);
db.BetIncomeMaster = require('./bonus/betIncomeMaster.js')(sequelize, DataTypes);
db.SalaryBonus = require('./bonus/salaryBonus.js')(sequelize, DataTypes);
db.SalaryBonusLog = require('./bonus/salaryBonusLog.js')(sequelize, DataTypes);
db.RebateBonus = require('./bonus/rebateBonus.js')(sequelize, DataTypes);
db.DailyMissionRechargeBonus = require('./bonus/dailyMissionRechargeBonus.js')(sequelize, DataTypes);
db.DailyMissionRechargeBonusLog = require('./bonus/dailyMissionRechargeBonusLog.js')(sequelize, DataTypes);
db.AttendenceBonus = require('./bonus/attendenceBonus.js')(sequelize, DataTypes);
db.AttendenceBonusLog = require('./bonus/attendenceBonusLog.js')(sequelize, DataTypes);

db.aviator.hasMany(db.user,{foreignKey: 'id'});
db.user.belongsTo(db.aviator,{foreignKey: 'id'});

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});




db.sequelize.sync({ force: false })
// .then(() => {
//     // console.log('yes re-sync done!')
// })

module.exports = db
