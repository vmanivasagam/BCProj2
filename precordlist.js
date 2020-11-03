'use strict';

// Utility class for collections of ledger states --  a state list
const StateList = require('./ledger-api/statelist.js');

const IRecord = require('./precord.js');

class Precordlist extends StateList {
    constructor(ctx) {
        super(ctx,'org.papernet.irecordlist');
        this.use(IRecord);
    }

    async addIRecord(irecord) {
        return this.addState(irecord);
    }

    async getIRecord(irecordKey) {
        return this.getState(irecordKey);
    }

    async updateIRecord(irecord) {
        return this.updateState(irecord);
    }


}

module.exports = Precordlist;
