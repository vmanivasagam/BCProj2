/* eslint-disable quote-props */
/* eslint-disable quotes */
/* eslint-disable linebreak-style */
/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';
// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');
const IRecord = require('./precord.js');
const IRecordList = require('./precordlist.js');
let dashcore = require('@dashevo/dashcore-lib');
const got = require('got');
/**
 * A custom context provides easy access to list of all commercial papers
 */
class IRecordContext extends Context {

    constructor() {
        super();
        this.irecordList = new IRecordList(this);
    }

}

/**
 * Define commercial paper smart contract by extending Fabric Contract class
 *
 */
class Precordcontract extends Contract {

    constructor() {
        super('org.asu.irecordcontract');
    }

    /**
     * Define a custom context for commercial paper
    */
    createContext() {
        return new IRecordContext();
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async init(ctx) {
        console.log("Context set and contract instantiated")
    }



    /**
     * Create an insurance record
     * @param {Context} ctx the transaction context
     * @param {String} username username
     * @param {String} name name
     * @param {String} dob date of birth
     * @param {String} gender  gender
     * @param {String} blood_type blood type
     */
    //GRADED FUNCTION
    async createIRecord(ctx,username,name,dob,gender,blood_type, base_url, address, pk, token) {
        //  TASK-1: Rewrite the function to write a OP-RETURN transaction to Dash Public Blockchain
        //  create an IRecord with username,name,dob,gender,blood_type,and transaction ID none
        //  If patient bloodType AB- insert record to blockchain using
        //  addIRecord of IRecordList
        //  Fetch the transactions for the address {address:base_url,address,token}
        //  Compute the total amount of all the raw transactions fetched.
        //  If the total amount  is less than amount+fee raise an error Insufficient funds
        //  Else if total amount  is greater than or equal  to amount+fee
        //  Create a transaction using the {dashcore} library, and send the transaction using ChainRider
        //  Send Raw Transaction API - https://www.chainrider.io/docs/dash/#send-raw-transaction
        //  Resulting transaction ID (dashTx) is used to create an IRecord given in the following code




        let irecord = IRecord.createInstance(username, name, dob, gender, blood_type, dashTx);
        await ctx.irecordList.addIRecord(irecord);
        return irecord.toBuffer()
    }

    /**
     * Update last_checkup_date to an existing record
     * @param {Context} ctx the transaction context
     * @param {String} username username
     * @param {String} name name
     * @param {String} last_checkup_date date string 
     */
    async update_checkup_date(ctx,username,name,last_checkup_date){
        let irecordKey = IRecord.makeKey([username,name]);
        let irecord = await ctx.irecordList.getIRecord(irecordKey);

        irecord.set_last_checkup_date(last_checkup_date);
        await ctx.irecordList.updateIRecord(irecord);

        return irecord.toBuffer();

    }

    /**
     * Evaluate a queryString
     * This is the helper function for making queries using a query string
     *
     * @param {Context} ctx the transaction context
     * @param {String} queryString the query string to be evaluated
    */    
   async queryWithQueryString(ctx, queryString, token) {
       // GRADED FUNCTION
    console.log("query String");
    console.log(JSON.stringify(queryString));

    let resultsIterator = await ctx.stub.getQueryResult(queryString);

    let allResults = [];

    while (true) {
        let res = await resultsIterator.next();

        if (res.value && res.value.value.toString()) {
            let jsonRes = {};

            console.log(res.value.value.toString('utf8'));

            jsonRes.Key = res.value.key;

            try {
                jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));

                if (jsonRes.Record['tx']!=='None'){
                    // GRADED FUNCTION
                    //  TASK-2: When iterating through records that the function is returning check if this record has a TX field
                    //  IF YES - we call https://www.chainrider.io/docs/dash/#transaction-by-hash API to return a JSON of that transaction
                    //  From the transaction get OP-RETURN data
                    //  Convert the hex value of OP-ReturnData to ASCII and append it to the record as jsonRes.Record['tx_decoded']
                }
            } catch (err) {
                console.log(err);
                jsonRes.Record = res.value.value.toString('utf8');
            }

            allResults.push(jsonRes);
        }
        if (res.done) {
            console.log('end of data');
            await resultsIterator.close();
            console.info(allResults);
            console.log(JSON.stringify(allResults));
            return JSON.stringify(allResults);
        }
    }

}

    /**
     * Query by TXID
     *
     * @param {Context} ctx the transaction context
     * @param {String} gender gender to be queried
    */

    async queryByTxId(ctx, token) {


       let queryString = {
        "selector": {
            "tx": tx
        },
    }

    let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString), token);
    return queryResults

}
   async queryByGender(ctx, gender, token) {

    let queryString = {
        "selector": {
            "gender": gender
        }
    }

    let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString), token);
    return queryResults;

}

    /**
     * Query by Blood_Type
     *
     * @param {Context} ctx the transaction context
     * @param {String} blood_type blood_type to queried
    */
   async queryByBlood_Type(ctx, blood_type, token) {

    let queryString = {
        "selector": {
            "blood_type": blood_type
        }
    }

    let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString), token);
    return queryResults;

}

    /**
     *
     *  Query by Blood_Type Dual Query
     *
     * @param {Context} ctx the transaction context
     * @param {String} blood_type blood_type to queried
    */
   async queryByBlood_Type_Dual(ctx, blood_type1, blood_type2, token) {

    let queryString = {
        "selector": {
            "blood_type": {
                "$in": [blood_type1, blood_type2]
            }
        }
    }

    let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString),token);
    return queryResults;

}



}


module.exports = Precordcontract;
