const { Op } = require('sequelize');
const db = require('../models');
const User = db.user;
const BotUser = db.BotUser;
class UserService {
    async getAll() {
        try {
            return await User.findAll();
        } catch (error) {
            console.log("CUST_ERR GET ALL USERS", error);
            throw new Error('Error fetching users');
        }
    }

    async getById(id, attributes = []) {
        try {
            let user = null;
            if (attributes.length > 0) {
                user = await User.findByPk(id, {
                    attributes
                });
            } else {
                user = await User.findByPk(id);
            }

            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            console.log("CUST_ERR GET USER", error)
            throw new Error('Error fetching user');
        }
    }

    async create(data) {
        try {
            return await User.create(data);
        } catch (error) {
            console.log("CUST_ERR CREATE USER", error);
            throw new Error('Error creating user');
        }
    }

    async update(id, data) {
        try {
            await User.update(data, {
                where: { id }
            });
        } catch (error) {
            console.log("CUST_ERR UPDATE USER", error);
            throw new Error('Error updating user');
        }
    }

    async updateByConditions(condisions, data) {
        try {
            await User.update(data, {
                where: { ...condisions }
            });
        } catch (error) {
            throw new Error('Error updating user');
        }
    }

    async delete(id) {
        try {
            const user = await User.findByPk(id);
            if (!user) {
                throw new Error('User not found');
            }
            await user.destroy();
            return { message: 'User deleted successfully' };
        } catch (error) {
            console.log("CUST_ERR DELETE USER", error);
            throw new Error('Error deleting user');
        }
    }

    async getByConditions(conditions, attributes = []) {
        try {
            const options = attributes.length > 0 ? { attributes } : {};
            options.where = conditions;
            const users = await User.findAll(options);
            return users;
        } catch (error) {
            console.log("CUST_ERR GET USER", error)
            throw new Error('Error fetching user');
        }
    }

    async getSingleByConditions(conditions, attributes = []) {
        try {
            const options = attributes.length > 0 ? { attributes } : {};
            options.where = conditions;
            return await User.findOne(options);
        } catch (error) {
            console.log("CUST_ERR GET USER", error)
            throw new Error('Error fetching user');
        }
    }

    /////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////// BOT USERS /////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

    async getAllPredefinedBots() {
        try {
            const options = {
                order: db.sequelize.random(),
                limit: 6
            };
            return await BotUser.findAll(options);
        } catch (error) {
            console.log(error);
            throw new Error('Error while fetch bots');
        }
    }

    async getFreeRummyBots(amount = 1000) {
        try {
            const whereConditions = {
                status: false,
                rummy_table_id: 0,
                user_type: 1,
                wallet: {
                    [Op.gte]: amount
                }
            }
            return await User.findAll({
                where: whereConditions
            });
        } catch (error) {
            console.log(error);
            throw new Error('Error while fetch bots');
        }
    }
}

module.exports = new UserService();