
module.exports = function (aviator_socket, Sequelize, sequelize, dateTime) {
    var moment = require('moment'); // require
    var format = require('date-format');
    const db = require('../models')
    const UserModel = db.user
    const GameModel = db.game
    const setting_model = db.setting
    const Aviator = db.aviator
    const DirectProfitStatement = db.direct_profit_statement
    const user_connected = 0;
    let connectCounter = 0;
    var avaitor_timer = 20
    var timer = avaitor_timer;
    var sec;
    var game_id = 0;
    var interval_id;
    var game_created = false;
    aviator_socket.on('connection', (socket) => {
        console.log('aviator connected')
        // setInterval(aviator_timer_function, 15000);
    });

    function randomNumber(min, max) {
        return (Math.random() * (max - min) + min).toFixed(2);
    }

    // if(user_count>0){
    interval_id = setInterval(aviator_timer_function, 1000);
    // }


    async function aviator_timer_function() {
        var user_count = aviator_socket.sockets.size;
        if (timer <= 0) {
            clearInterval(interval_id);
            // if (user_count > 0) {
            console.log("user count " + user_count)
            const game_data = await getActiveGame();
            //  console.log('game_date',game_data);
            if (game_data) {
                //stop bet and change status
                await GameModel.update({ status: 1 }, { where: { id: game_data.id } })

                const bucket_amount_query = await getBucketAmount();
                const bucket_amount = bucket_amount_query.aviator_bucket;
                const total_bet_query = await getTotalBet(game_data.id);
                total_bet = total_bet_query.get('total_amount') || 0;
                total_winning = total_bet_query.get('total_winning') || 0;
                if (!total_bet) {
                    sec = randomNumber(2, 3);
                } else {
                    sec = (bucket_amount / total_bet).toFixed(2);
                    if (sec > 3) {
                        sec = randomNumber(2, 3);
                    }
                }

                sec = (sec < 0) ? 1 : sec;

                let blastmillisecond = 0;
                if (sec > 1.00 && sec <= 1.10) {
                    blastmillisecond = 0.9;
                } else if (sec > 1.10 && sec <= 1.20) {
                    blastmillisecond = 1.35;
                } else if (sec > 1.20 && sec <= 1.40) {
                    blastmillisecond = 2.25;
                } else if (sec > 1.40 && sec <= 1.60) {
                    blastmillisecond = 3.50;
                } else if (sec > 1.60 && sec <= 1.80) {
                    blastmillisecond = 4.05;
                } else if (sec > 1.80 && sec <= 2) {
                    blastmillisecond = 4.95;
                } else if (sec > 2 && sec <= 2.20) {
                    blastmillisecond = 5.85;
                } else if (sec > 2.20 && sec <= 2.40) {
                    blastmillisecond = 6.75;
                } else if (sec > 2.40 && sec <= 2.60) {
                    blastmillisecond = 7.65;
                } else if (sec > 2.60 && sec <= 2.80) {
                    blastmillisecond = 8.55;
                } else if (sec > 2.80 && sec <= 3) {
                    blastmillisecond = 9.45;
                }

                var dt = dateTime.create();
                var current_datetime = dt.format('Y-m-d H:M:S');
                var end_time = moment(current_datetime).add(blastmillisecond, 'seconds').format('YYYY-MM-DD HH:mm:ss');

                await GameModel.update({ blast_time: sec, end_datetime: end_time }, { where: { id: game_data.id } });
                aviator_socket.emit('Game', { 'time': sec, 'game_id': game_data.id });
                var admin_coin=total_bet-total_winning;
                //  directProfitStatementLog('Aviator',admin_coin,game_data.id)

                setTimeout(async() => {
                    let data = {
                        status: 2,
                        total_amount: total_bet
                    }
                    await game.update(data, { where: { id: game_data.id } })
                    aviator_socket.emit('Blast', 'Plane flew for this game id ' + game_data.id)
                }, (blastmillisecond * 1000));
            }
            const game = sequelize.define('tbl_aviator', {
                room_id: Sequelize.INTEGER,
                main_card: Sequelize.TEXT,
                status: Sequelize.INTEGER,
                winning_amount: Sequelize.FLOAT,
                user_amount: Sequelize.FLOAT,
                comission_amount: Sequelize.FLOAT,
                total_amount: Sequelize.FLOAT,
                admin_profit: Sequelize.FLOAT,
                winning: Sequelize.INTEGER,
                added_date: Sequelize.STRING,
                updated_date: Sequelize.STRING,
                blast_time: Sequelize.TEXT,
                end_datetime: Sequelize.STRING,
            }, {
                tableName: 'tbl_aviator',
                timestamps: false
            });
            // if (user_count > 0 && !game_created) {
                game_created=true;
            await game.create({
                room_id: 1,
                main_card: '',
                status: 0,
                winning_amount: 0,
                user_amount: 0,
                comission_amount: 0,
                total_amount: 0,
                admin_profit: 0,
                winning: 0,
                added_date: current_datetime,
                updated_date: current_datetime
            }).then(function (res) {
                if (res) {
                    console.log("Next Game Id",res.id)
                    // console.log(res)
                    aviator_socket.emit('next_game_id', res.id)
                  
                } else {
                    console.log('game is not creating')
                }
            });
            // setTimeout(function () {
            interval_id = setInterval(aviator_timer_function, 1000);
            // }, 5000);
            timer = avaitor_timer;
            // }
        } else {
            aviator_socket.emit('aviator_timer', timer);
            timer--;
        }

    }

    //Aviator table
    const getActiveGame = async () => {
        return await GameModel.findOne({ where: { status: 0 }, order: [['id', 'DESC']], attributes: ['id'], limit: 1 })
    }

    const getTotalBet = async(game_id) => {
        // console.log("game_id",game_id);
        // return Aviator.findOne({
        //     attributes: [
        //         [sequelize.fn('SUM', sequelize.col('amount')), 'total_bet'] // To add the aggregation...
        //     ], where: { dragon_tiger_id: game_id }
        // });

        return await Aviator.findOne({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount'],
                [sequelize.fn('SUM', sequelize.col('winning_amount')), 'total_winning']
            ], where: { dragon_tiger_id: game_id }
        });
    }

    // 3. get user
    const getTotalUser = async(aviator_id) => {
        return await UserModel.findAndCountAll({ where: { aviator_room_id: aviator_id } })
    }

    const getBucketAmount = async() => {
        return await setting_model.findOne({ attributes: ['aviator_bucket'], where: { id: 1 } })
    }

    const directProfitStatementLog = async (source, admin_commission, source_id=0) => {
        if(admin_commission){
        const setting =  await getSetting(1)
        let data = {
            admin_coin: Sequelize.literal('admin_coin+' + admin_commission),
        }
        await setting_model.update(data, { where: { id: 1 } })
        var admin_current_wallet=parseInt(setting.admin_coin)+parseInt(admin_commission);
    console.log('current_Wallet',admin_current_wallet)
    console.log('admin_coin',setting.admin_coin)
    console.log('admin_commission',admin_commission)
        let info = {
            source: source,
            source_id: source_id,
            admin_commission: admin_commission,
            admin_coin:admin_current_wallet,
            added_date: format.asString(new Date()),
        }
        return DirectProfitStatement.create(info)
    }
    }
    const getSetting = async(admin_id) => {
        return await setting_model.findOne({ attributes: ['admin_coin'], where: { id: 1 } })
    }
}