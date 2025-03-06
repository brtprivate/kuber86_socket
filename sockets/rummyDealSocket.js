const db = require('../models')
const Sequelize = require('sequelize');
const UserModel = db.user

var timeoutArr = {};
var intervalArr = {};
const timeout_time = 30000;
var rummy_timer = (timeout_time/1000);
var interval_id;

module.exports = function (rummy_deal_socket, request, timer, BASE_URL) {

    rummy_deal_socket.on('connection', (socket) => {
        console.log("New Connection Rummy Deal ", socket.id)

        socket.on('get-table', msg => {
            // socket.join("");
            var user_id = msg.user_id;
            var boot_value = msg.boot_value;
            var token = msg.token;
            var res = {};

            UserModel.findOne({ where: { id: user_id, token: token, isDeleted: 0 } }).then(user => {
                if (user) {
                    var userData = user.toJSON();
                    // console.log(userData.rummy_deal_table_id);

                    var options = {
                        'method': 'POST',
                        'url': BASE_URL+'/api/rummyDeal/get_table',
                        'headers': {
                            'token': 'c7d3965d49d4a59b0da80e90646aee77548458b3377ba3c0fb43d5ff91d54ea28833080e3de6ebd4fde36e2fb7175cddaf5d8d018ac1467c3d15db21c11b6909',
                            'Cookie': 'ci_session=ql4u3d0569peintlo3clko0vftbg0ni2; ci_session=mmo9qqjgcpk00r04ll9dcqaohrir95pe'
                        },
                        formData: {
                            'user_id': user_id,
                            'token': token,
                            'boot_value': boot_value
                        }
                    };
                    request(options, function (error, response) {
                        if (error) throw new Error(error);
                        // console.log(response.body);
                        console.log("get-table", response.body);
                        socket.emit('get-table', response.body);
                        var body = JSON.parse(response.body);
                        var rummy_deal_table_id = body.table_data[0].table_id;
                        socket.join("room" + rummy_deal_table_id);
                        rummy_deal_socket.in("room" + rummy_deal_table_id).emit('trigger', "call_status");
                        var clients = rummy_deal_socket.adapter.rooms.get("room" + rummy_deal_table_id);
                        const numClients = clients ? clients.size : 0;
                        console.log("No of Users - ", numClients);

                        if(numClients>1){
                            var options = {
                                'method': 'POST',
                                'url': BASE_URL+'/api/rummyDeal/start_game',
                                'headers': {
                                    'token': 'c7d3965d49d4a59b0da80e90646aee77548458b3377ba3c0fb43d5ff91d54ea28833080e3de6ebd4fde36e2fb7175cddaf5d8d018ac1467c3d15db21c11b6909',
                                    'Cookie': 'ci_session=ql4u3d0569peintlo3clko0vftbg0ni2; ci_session=mmo9qqjgcpk00r04ll9dcqaohrir95pe'
                                },
                                formData: {
                                    'user_id': user_id,
                                    'token': token,
                                }
                            };
                            request(options, function (error, response) {
                                if (error) throw new Error(error);
                                // console.log(response.body);
                                console.log("start-game", response.body);
                                socket.emit('start-game', response.body);
                                var body = JSON.parse(response.body);
                                if(body.game_id!==undefined){
                                    // rummy_deal_socket.in("room" + rummy_deal_table_id).emit('trigger', "" + body.game_id);

                                    var roomname = "room"+rummy_deal_table_id;
                                    rummy_deal_socket.in(roomname).emit('trigger', ""+body.game_id);
                                    if(timeoutArr[roomname]!==undefined){
                                        console.log("Timer is Remaining - ",timeoutArr[roomname].getStateRunning())
                                        timeoutArr[roomname].stop();
                                        clearInterval(intervalArr[roomname]);
                                    }
                                    timeoutArr[roomname] = new timer(function() { autochaal(rummy_deal_table_id) }, timeout_time)
                                    intervalArr[roomname] = setInterval(function(){rummy_deal_socket.in(roomname).emit('rummy_timer', Math.round(timeoutArr[roomname].getTimeLeft()/1000))}, 1000);
                                }else{
                                    // rummy_deal_socket.in("room" + rummy_deal_table_id).emit('trigger', "call_status");
                                }
                                
                            });
                        }
                    });
                }
                else {
                    res['code'] = 201;
                    res['message'] = 'Invalid Table';
                    socket.emit('get-table', res);
                }

            });
        });

        socket.on('get-private-table', msg => {
            // socket.join("");
            var user_id = msg.user_id;
            var boot_value = msg.boot_value;
            var token = msg.token;
            var res = {};

            UserModel.findOne({ where: { id: user_id, token: token, isDeleted: 0 } }).then(user => {
                if (user) {
                    var userData = user.toJSON();
                    var options = {
                        'method': 'POST',
                        'url': BASE_URL+'/api/rummyDeal/get_private_table',
                        'headers': {
                            'token': 'c7d3965d49d4a59b0da80e90646aee77548458b3377ba3c0fb43d5ff91d54ea28833080e3de6ebd4fde36e2fb7175cddaf5d8d018ac1467c3d15db21c11b6909',
                            'Cookie': 'ci_session=ql4u3d0569peintlo3clko0vftbg0ni2; ci_session=mmo9qqjgcpk00r04ll9dcqaohrir95pe'
                        },
                        formData: {
                            'user_id': user_id,
                            'token': token,
                            'boot_value': boot_value
                        }
                    };
                    request(options, function (error, response) {
                        if (error) throw new Error(error);
                        // console.log(response.body);
                        console.log("get-private-table", response.body);
                        socket.emit('get-private-table', response.body);
                        var body = JSON.parse(response.body);
                        socket.join("room" + body.table_data[0].table_id);
                        rummy_deal_socket.in("room" + body.table_data[0].table_id).emit('trigger', "call_status");
                        var clients = rummy_deal_socket.adapter.rooms.get("room" + body.table_data[0].table_id);
                        const numClients = clients ? clients.size : 0;
                        console.log("No of Users - ", numClients);
                    });
                }
                else {
                    res['code'] = 201;
                    res['message'] = 'Invalid Table';
                    socket.emit('get-customise-table', res);
                }
            });
        });

        socket.on('join-table', msg => {
            // socket.join("");
            var user_id = msg.user_id;
            var table_id = msg.table_id;
            var token = msg.token;
            var res = {};

            UserModel.findOne({ where: { id: user_id, token: token, isDeleted: 0 } }).then(user => {
                if (user) {
                    var userData = user.toJSON();
                    var options = {
                        'method': 'POST',
                        'url': BASE_URL+'/api/rummyDeal/join_table',
                        'headers': {
                            'token': 'c7d3965d49d4a59b0da80e90646aee77548458b3377ba3c0fb43d5ff91d54ea28833080e3de6ebd4fde36e2fb7175cddaf5d8d018ac1467c3d15db21c11b6909',
                            'Cookie': 'ci_session=ql4u3d0569peintlo3clko0vftbg0ni2; ci_session=mmo9qqjgcpk00r04ll9dcqaohrir95pe'
                        },
                        formData: {
                            'user_id': user_id,
                            'table_id': table_id,
                            'token': token,
                        }
                    };
                    request(options, function (error, response) {
                        if (error) throw new Error(error);
                        // console.log(response.body);
                        console.log("join-table", response.body);
                        socket.emit('join-table', response.body);
                        var body = JSON.parse(response.body);
                        socket.join("room" + body.table_data[0].table_id);
                        rummy_deal_socket.in("room" + userData.rummy_deal_table_id).emit('trigger', "call_status");
                    });
                }
                else {
                    res['code'] = 201;
                    res['message'] = 'Invalid User';
                    socket.emit('join-table', res);
                }

            });
        });

        socket.on('join-table-with-code', msg => {
            // socket.join("");
            var user_id = msg.user_id;
            var code = msg.code;
            var token = msg.token;
            var res = {};

            UserModel.findOne({ where: { id: user_id, token: token, isDeleted: 0 } }).then(user => {
                if (user) {
                    var userData = user.toJSON();
                    var options = {
                        'method': 'POST',
                        'url': BASE_URL+'/api/rummyDeal/join_table_with_code',
                        'headers': {
                            'token': 'c7d3965d49d4a59b0da80e90646aee77548458b3377ba3c0fb43d5ff91d54ea28833080e3de6ebd4fde36e2fb7175cddaf5d8d018ac1467c3d15db21c11b6909',
                            'Cookie': 'ci_session=ql4u3d0569peintlo3clko0vftbg0ni2; ci_session=mmo9qqjgcpk00r04ll9dcqaohrir95pe'
                        },
                        formData: {
                            'user_id': user_id,
                            'code': code,
                            'token': token,
                        }
                    };
                    request(options, function (error, response) {
                        if (error) throw new Error(error);
                        // console.log(response.body);
                        console.log("join-table-with-code", response.body);
                        socket.emit('join-table-with-code', response.body);
                        var body = JSON.parse(response.body);
                        socket.join("room" + body.table_data[0].table_id);
                        rummy_deal_socket.in("room" + userData.rummy_deal_table_id).emit('trigger', "call_status");
                    });
                }
                else {
                    res['code'] = 201;
                    res['message'] = 'Invalid User';
                    socket.emit('join-table-with-code', res);
                }

            });
        });

        socket.on('start-game', msg => {
            // socket.join("");
            var user_id = msg.user_id;
            var blind_1 = msg.blind_1;
            var token = msg.token;
            var res = {};

            UserModel.findOne({ where: { id: user_id, token: token, isDeleted: 0 } }).then(user => {
                if (user) {
                    var userData = user.toJSON();
                    var options = {
                        'method': 'POST',
                        'url': BASE_URL+'/api/rummyDeal/start_game',
                        'headers': {
                            'token': 'c7d3965d49d4a59b0da80e90646aee77548458b3377ba3c0fb43d5ff91d54ea28833080e3de6ebd4fde36e2fb7175cddaf5d8d018ac1467c3d15db21c11b6909',
                            'Cookie': 'ci_session=ql4u3d0569peintlo3clko0vftbg0ni2; ci_session=mmo9qqjgcpk00r04ll9dcqaohrir95pe'
                        },
                        formData: {
                            'user_id': user_id,
                            'token': token,
                        }
                    };
                    request(options, function (error, response) {
                        if (error) throw new Error(error);
                        // console.log(response.body);
                        console.log("start-game", response.body);
                        socket.emit('start-game', response.body);
                        var body = JSON.parse(response.body);
                        if(body.game_id!==undefined){

                            var roomname = "room" + userData.rummy_deal_table_id;
                            rummy_deal_socket.in(roomname).emit('trigger', "" + body.game_id);

                            if(timeoutArr[roomname]!==undefined){
                                console.log("Timer is Remaining - ",timeoutArr[roomname].getStateRunning())
                                timeoutArr[roomname].stop();
                                clearInterval(intervalArr[roomname]);
                            }
                            timeoutArr[roomname] = new timer(function() { autochaal(userData.rummy_deal_table_id) }, timeout_time)
                            intervalArr[roomname] = setInterval(function(){rummy_deal_socket.in(roomname).emit('rummy_timer', Math.round(timeoutArr[roomname].getTimeLeft()/1000))}, 1000);
                        }else{
                            // rummy_deal_socket.in("room" + userData.rummy_deal_table_id).emit('trigger', "call_status");
                        }
                        
                    });
                }
                else {
                    res['code'] = 201;
                    res['message'] = 'Invalid User';
                    socket.emit('start-game', res);
                }

            });
        });

        socket.on('leave-table', msg => {
            // socket.join("");
            var user_id = msg.user_id;
            var token = msg.token;
            var game_id = msg.game_id;
            // var table_id = msg.table_id;

            var res = {};

            UserModel.findOne({ where: { id: user_id, token: token, isDeleted: 0 } }).then(user => {
                if (user) {
                    var userData = user.toJSON();
                    var options = {
                        'method': 'POST',
                        'url': BASE_URL+'/api/rummyDeal/leave_table',
                        'headers': {
                            'token': 'c7d3965d49d4a59b0da80e90646aee77548458b3377ba3c0fb43d5ff91d54ea28833080e3de6ebd4fde36e2fb7175cddaf5d8d018ac1467c3d15db21c11b6909',
                            'Cookie': 'ci_session=ql4u3d0569peintlo3clko0vftbg0ni2; ci_session=mmo9qqjgcpk00r04ll9dcqaohrir95pe'
                        },
                        formData: {
                            'user_id': user_id,
                            'token': token,
                        }
                    };
                    request(options, function (error, response) {
                        if (error) throw new Error(error);
                        // console.log(response.body);
                        console.log("leave-game", response.body);
                        socket.emit('leave-table', response.body);
                        var body = JSON.parse(response.body);
                        rummy_deal_socket.in("room" + userData.rummy_deal_table_id).emit('trigger', "call_status");
                        socket.leave("room" + userData.rummy_deal_table_id);
                    });
                }
                else {
                    res['code'] = 201;
                    res['message'] = 'Invalid User';
                    socket.emit('leave-table', res);
                }
            });
        });

        socket.on('pack-game', msg => {
            // socket.join("");
            var user_id = msg.user_id;
            var game_id = msg.game_id;
            var timeout = 0;
            var json = msg.json;
            var token = msg.token;

            var res = {};

            UserModel.findOne({ where: { id: user_id, token: token, isDeleted: 0 } }).then(user => {
                if (user) {
                    var userData = user.toJSON();
                    var options = {
                        'method': 'POST',
                        'url': BASE_URL+'/api/rummyDeal/pack_game',
                        'headers': {
                            'token': 'c7d3965d49d4a59b0da80e90646aee77548458b3377ba3c0fb43d5ff91d54ea28833080e3de6ebd4fde36e2fb7175cddaf5d8d018ac1467c3d15db21c11b6909',
                            'Cookie': 'ci_session=ql4u3d0569peintlo3clko0vftbg0ni2; ci_session=mmo9qqjgcpk00r04ll9dcqaohrir95pe'
                        },
                        formData: {
                            'user_id': user_id,
                            'token': token,
			    'json': json,
                            'timeout': timeout,
                        }
                    };
                    request(options, function (error, response) {
                        if (error) throw new Error(error);
                        // console.log(response.body);
                        console.log("pack-game", response.body);
                        socket.emit('pack-game', response.body);
                        // console.log(response.body);
                        var body = JSON.parse(response.body);
                        rummy_deal_socket.in("room" + userData.rummy_deal_table_id).emit('trigger', "call_status");
                    });
                }
                else {
                    res['code'] = 201;
                    res['message'] = 'Invalid User';
                    socket.emit('leave-table', res);
                }
            });
        });

        socket.on('my-card', msg => {
            // socket.join("");
            var user_id = msg.user_id;
            var token = msg.token;
            var res = {};

            UserModel.findOne({ where: { id: user_id, token: token, isDeleted: 0 } }).then(user => {
                if (user) {
                    var userData = user.toJSON();
                    var options = {
                        'method': 'POST',
                        'url': BASE_URL+'/api/rummyDeal/my_card',
                        'headers': {
                            'token': 'c7d3965d49d4a59b0da80e90646aee77548458b3377ba3c0fb43d5ff91d54ea28833080e3de6ebd4fde36e2fb7175cddaf5d8d018ac1467c3d15db21c11b6909',
                            'Cookie': 'ci_session=ql4u3d0569peintlo3clko0vftbg0ni2; ci_session=mmo9qqjgcpk00r04ll9dcqaohrir95pe'
                        },
                        formData: {
                            'user_id': user_id,
                            'token': token,
                        }
                    };
                    request(options, function (error, response) {
                        if (error) throw new Error(error);
                        // console.log(response.body);
                        console.log("my-card", response.body);
                        socket.emit('my-card', response.body);
                        // rummy_deal_socket.in("room" + userData.rummy_deal_table_id).emit('trigger', "call_status");
                    });
                }
                else {
                    res['code'] = 201;
                    res['message'] = 'Invalid User';
                    socket.emit('my-card', res);
                }
            });
        });

        socket.on('check-my-card', msg => {
            // socket.join("");
            var user_id = msg.user_id;
            var token = msg.token;
            var res = {};

            UserModel.findOne({ where: { id: user_id, token: token, isDeleted: 0 } }).then(user => {
                if (user) {
                    var userData = user.toJSON();
                    var options = {
                        'method': 'POST',
                        'url': BASE_URL+'/api/rummyDeal/my_card',
                        'headers': {
                            'token': 'c7d3965d49d4a59b0da80e90646aee77548458b3377ba3c0fb43d5ff91d54ea28833080e3de6ebd4fde36e2fb7175cddaf5d8d018ac1467c3d15db21c11b6909',
                            'Cookie': 'ci_session=ql4u3d0569peintlo3clko0vftbg0ni2; ci_session=mmo9qqjgcpk00r04ll9dcqaohrir95pe'
                        },
                        formData: {
                            'user_id': user_id,
                            'token': token,
                        }
                    };
                    request(options, function (error, response) {
                        if (error) throw new Error(error);
                        // console.log(response.body);
                        console.log("check-my-card", response.body);
                        socket.emit('check-my-card', response.body);
                        rummy_deal_socket.in("room" + userData.rummy_deal_table_id).emit('trigger', "call_status");
                    });
                }
                else {
                    res['code'] = 201;
                    res['message'] = 'Invalid User';
                    socket.emit('check-my-card', res);
                }
            });
        });

        socket.on('card-value', msg => {
            // socket.join("");
            var user_id = msg.user_id;
            var token = msg.token;
            var card_1 = msg.card_1;
            var card_2 = msg.card_2;
            var card_3 = msg.card_3;
            var card_4 = (msg.card_4===undefined)?'':msg.card_4;
            var card_5 = (msg.card_5===undefined)?'':msg.card_5;
            var card_6 = (msg.card_6===undefined)?'':msg.card_6;
            var res = {};

            UserModel.findOne({ where: { id: user_id, token: token, isDeleted: 0 } }).then(user => {
                if (user) {
                    var userData = user.toJSON();
                    var options = {
                        'method': 'POST',
                        'url': BASE_URL+'/api/rummyDeal/card_value',
                        'headers': {
                            'token': 'c7d3965d49d4a59b0da80e90646aee77548458b3377ba3c0fb43d5ff91d54ea28833080e3de6ebd4fde36e2fb7175cddaf5d8d018ac1467c3d15db21c11b6909',
                            'Cookie': 'ci_session=ql4u3d0569peintlo3clko0vftbg0ni2; ci_session=mmo9qqjgcpk00r04ll9dcqaohrir95pe'
                        },
                        formData: {
                            'user_id': user_id,
                            'token': token,
                            'card_1': card_1,
                            'card_2': card_2,
                            'card_3': card_3,
                            'card_4': card_4,
                            'card_5': card_5,
                            'card_6': card_6
                          }
                    };
                    request(options, function (error, response) {
                        if (error) throw new Error(error);
                        // console.log(response.body);
                        console.log("card-value", response.body);
                        socket.emit('card-value', response.body);
                        rummy_deal_socket.in("room" + userData.rummy_deal_table_id).emit('trigger', "call_status");
                    });
                }
                else {
                    res['code'] = 201;
                    res['message'] = 'Invalid User';
                    socket.emit('card-value', res);
                }
            });
        });

        socket.on('drop-card', msg => {
            // socket.join("");
            var user_id = msg.user_id;
            var token = msg.token;
            var card = msg.card;
            var json = msg.json;

            var res = {};

            UserModel.findOne({ where: { id: user_id, token: token, isDeleted: 0 } }).then(user => {
                if (user) {
                    var userData = user.toJSON();
                    var options = {
                        'method': 'POST',
                        'url': BASE_URL+'/api/rummyDeal/drop_card',
                        'headers': {
                            'token': 'c7d3965d49d4a59b0da80e90646aee77548458b3377ba3c0fb43d5ff91d54ea28833080e3de6ebd4fde36e2fb7175cddaf5d8d018ac1467c3d15db21c11b6909',
                            'Cookie': 'ci_session=ql4u3d0569peintlo3clko0vftbg0ni2; ci_session=mmo9qqjgcpk00r04ll9dcqaohrir95pe'
                        },
                        formData: {
                            'user_id': user_id,
                            'token': token,
                            'json': json,
                            'card': card
                          }
                    };
                    request(options, function (error, response) {
                        if (error) throw new Error(error);
                        // console.log(response.body);
                        console.log("drop-card", response.body);
                        socket.emit('drop-card', response.body);
                        // rummy_deal_socket.in("room" + userData.rummy_deal_table_id).emit('trigger', "call_status");

                        var roomname = "room"+userData.rummy_deal_table_id;
                        rummy_deal_socket.in(roomname).emit('trigger', "call_status");

                        // console.log("timeoutArr.roomname",timeoutArr[roomname]);

                        if(timeoutArr[roomname]!==undefined){
                            console.log("Timer is Remaining - ",timeoutArr[roomname].getStateRunning())
                            timeoutArr[roomname].stop();
                            clearInterval(intervalArr[roomname]);
                        }
                        timeoutArr[roomname] = new timer(function() { autochaal(userData.rummy_deal_table_id) }, timeout_time)
                        intervalArr[roomname] = setInterval(function(){rummy_deal_socket.in(roomname).emit('rummy_timer', Math.round(timeoutArr[roomname].getTimeLeft()/1000))}, 1000);
                    });
                }
                else {
                    res['code'] = 201;
                    res['message'] = 'Invalid User';
                    socket.emit('drop-card', res);
                }
            });
        });

        socket.on('get-card', msg => {
            // socket.join("");
            var user_id = msg.user_id;
            var token = msg.token;

            var res = {};

            UserModel.findOne({ where: { id: user_id, token: token, isDeleted: 0 } }).then(user => {
                if (user) {
                    var userData = user.toJSON();
                    var options = {
                        'method': 'POST',
                        'url': BASE_URL+'/api/rummyDeal/get_card',
                        'headers': {
                            'token': 'c7d3965d49d4a59b0da80e90646aee77548458b3377ba3c0fb43d5ff91d54ea28833080e3de6ebd4fde36e2fb7175cddaf5d8d018ac1467c3d15db21c11b6909',
                            'Cookie': 'ci_session=ql4u3d0569peintlo3clko0vftbg0ni2; ci_session=mmo9qqjgcpk00r04ll9dcqaohrir95pe'
                        },
                        formData: {
                            'user_id': user_id,
                            'token': token
                          }
                    };
                    request(options, function (error, response) {
                        if (error) throw new Error(error);
                        // console.log(response.body);
                        console.log("get-card", response.body);
                        socket.emit('get-card', response.body);
                        rummy_deal_socket.in("room" + userData.rummy_deal_table_id).emit('trigger', "call_status");
                    });
                }
                else {
                    res['code'] = 201;
                    res['message'] = 'Invalid User';
                    socket.emit('get-card', res);
                }
            });
        });

        socket.on('get-drop-card', msg => {
            // socket.join("");
            var user_id = msg.user_id;
            var token = msg.token;

            var res = {};

            UserModel.findOne({ where: { id: user_id, token: token, isDeleted: 0 } }).then(user => {
                if (user) {
                    var userData = user.toJSON();
                    var options = {
                        'method': 'POST',
                        'url': BASE_URL+'/api/rummyDeal/get_drop_card',
                        'headers': {
                            'token': 'c7d3965d49d4a59b0da80e90646aee77548458b3377ba3c0fb43d5ff91d54ea28833080e3de6ebd4fde36e2fb7175cddaf5d8d018ac1467c3d15db21c11b6909',
                            'Cookie': 'ci_session=ql4u3d0569peintlo3clko0vftbg0ni2; ci_session=mmo9qqjgcpk00r04ll9dcqaohrir95pe'
                        },
                        formData: {
                            'user_id': user_id,
                            'token': token
                          }
                    };
                    request(options, function (error, response) {
                        if (error) throw new Error(error);
                        // console.log(response.body);
                        console.log("get-drop-card", response.body);
                        socket.emit('get-drop-card', response.body);
                        rummy_deal_socket.in("room" + userData.rummy_deal_table_id).emit('trigger', "call_status");
                    });
                }
                else {
                    res['code'] = 201;
                    res['message'] = 'Invalid User';
                    socket.emit('get-drop-card', res);
                }
            });
        });

        socket.on('declare', msg => {
            // socket.join("");
            var user_id = msg.user_id;
            var token = msg.token;
            var json = msg.json;

            var res = {};

            UserModel.findOne({ where: { id: user_id, token: token, isDeleted: 0 } }).then(user => {
                if (user) {
                    var userData = user.toJSON();
                    var options = {
                        'method': 'POST',
                        'url': BASE_URL+'/api/rummyDeal/declare',
                        'headers': {
                            'token': 'c7d3965d49d4a59b0da80e90646aee77548458b3377ba3c0fb43d5ff91d54ea28833080e3de6ebd4fde36e2fb7175cddaf5d8d018ac1467c3d15db21c11b6909',
                            'Cookie': 'ci_session=ql4u3d0569peintlo3clko0vftbg0ni2; ci_session=mmo9qqjgcpk00r04ll9dcqaohrir95pe'
                        },
                        formData: {
                            'user_id': user_id,
                            'token': token,
                            'json': json
                          }
                    };
                    request(options, function (error, response) {
                        if (error) throw new Error(error);
                        // console.log(response.body);
                        console.log("declare", response.body);
                        socket.emit('declare', response.body);
                        rummy_deal_socket.in("room" + userData.rummy_deal_table_id).emit('trigger', "call_status");
                    });
                }
                else {
                    res['code'] = 201;
                    res['message'] = 'Invalid User';
                    socket.emit('declare', res);
                }
            });
        });

        socket.on('declare-back', msg => {
            // socket.join("");
            var user_id = msg.user_id;
            var token = msg.token;
            var json = msg.json;

            var res = {};

            UserModel.findOne({ where: { id: user_id, token: token, isDeleted: 0 } }).then(user => {
                if (user) {
                    var userData = user.toJSON();
                    var options = {
                        'method': 'POST',
                        'url': BASE_URL+'/api/rummyDeal/declare_back',
                        'headers': {
                            'token': 'c7d3965d49d4a59b0da80e90646aee77548458b3377ba3c0fb43d5ff91d54ea28833080e3de6ebd4fde36e2fb7175cddaf5d8d018ac1467c3d15db21c11b6909',
                            'Cookie': 'ci_session=ql4u3d0569peintlo3clko0vftbg0ni2; ci_session=mmo9qqjgcpk00r04ll9dcqaohrir95pe'
                        },
                        formData: {
                            'user_id': user_id,
                            'token': token,
                            'json': json,
                          }
                    };
                    request(options, function (error, response) {
                        if (error) throw new Error(error);
                        // console.log(response.body);
                        console.log("declare-back", response.body);
                        socket.emit('declare-back', response.body);
                        rummy_deal_socket.in("room" + userData.rummy_deal_table_id).emit('trigger', "call_status");
                    });
                }
                else {
                    res['code'] = 201;
                    res['message'] = 'Invalid User';
                    socket.emit('declare-back', res);
                }
            });
        });

        socket.on('status', msg => {
            // socket.join("");
            var user_id = msg.user_id;
            var token = msg.token;
            var game_id = (msg.game_id===undefined)?'':msg.game_id;

            var res = {};

            UserModel.findOne({ where: { id: user_id, token: token, isDeleted: 0 } }).then(user => {
                if (user) {
                    var userData = user.toJSON();
                    var options = {
                        'method': 'POST',
                        'url': BASE_URL+'/api/rummyDeal/status',
                        'headers': {
                            'token': 'c7d3965d49d4a59b0da80e90646aee77548458b3377ba3c0fb43d5ff91d54ea28833080e3de6ebd4fde36e2fb7175cddaf5d8d018ac1467c3d15db21c11b6909',
                            'Cookie': 'ci_session=ql4u3d0569peintlo3clko0vftbg0ni2; ci_session=mmo9qqjgcpk00r04ll9dcqaohrir95pe'
                        },
                        formData: {
                            'user_id': user_id,
                            'token': token,
                            'game_id': game_id
                          }
                    };
                    request(options, function (error, response) {
                        if (error) throw new Error(error);
                        // console.log(response.body);
                        console.log("status", response.body);
                        socket.emit('status', response.body);
                        var body = JSON.parse(response.body);

                        // var roomname = "room"+userData.rummy_table_id;
                        // rummy_socket.in(roomname).emit('trigger', "call_status");

                        // console.log("timeoutArr.roomname",timeoutArr[roomname]);
                        
                    });
                }
                else {
                    res['code'] = 201;
                    res['message'] = 'Invalid User';
                    socket.emit('drop-card', res);
                }
            });
        });

        socket.on("disconnect", (reason) => {
            console.log("User Disconnected Rummy Deal - " + socket.id + " reason - " + reason);
        });

    });

    function autochaal(room_id){
        var options = {
            'method': 'GET',
            'url': BASE_URL+'/api/cron/rummy_deal_socket/'+room_id
        };
        request(options, function (error, response) {
            if (error) throw new Error(error);
            // console.log(response.body);
            console.log("auto-chaal - "+room_id,response.body);
            rummy_deal_socket.in("room"+room_id).emit('trigger', "call_status");
            var roomname = "room"+room_id;
            // if(timeoutArr.roomname!==undefined){
                timeoutArr[roomname].stop();
                clearInterval(intervalArr[roomname]);
            // }
            var clients = rummy_deal_socket.adapter.rooms.get("room" + room_id);
            const numClients = clients ? clients.size : 0;
            console.log("Stop Autochaal No of Users - ", numClients);
            if(response.body=='Running'){
                timeoutArr[roomname] = new timer(function() { autochaal(room_id) }, timeout_time)
                intervalArr[roomname] = setInterval(function(){rummy_deal_socket.in(roomname).emit('rummy_timer', Math.round(timeoutArr[roomname].getTimeLeft()/1000))}, 1000);
            }
        });
    }
}
