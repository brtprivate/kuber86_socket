const { v4: uuidv4 } = require('uuid');
class UtilHelper {
    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    async getAmountByPercentage(amount, percentage) {
        const singleUnitPrice = (percentage / 100).toFixed(2);
        return (amount * parseFloat(singleUnitPrice)).toFixed(2);
    }

    getRoundNumber(amount, roundNumber) {
        return amount.toFixed(roundNumber);
    }

    getAttributes(attributes) {
        return attributes.length > 0 ? { attributes } : {};
    }

    async getAmountByPercentageWithoutRound(amount, percentage) {
        const singleUnitPrice = (percentage / 100);
        return (amount * parseFloat(singleUnitPrice)).toFixed(2);
    }

    generateUniqueNumber() {
        const uuid = uuidv4();
        return uuid.replace(/-/g, '').slice(0, 10);
    }

    trimByUnderscor(string) {
        return string.replace(/^_+|_+$/g, '');
    }
}

module.exports = new UtilHelper();