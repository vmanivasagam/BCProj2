/* eslint-disable quote-props */
/* eslint-disable quotes */
/* eslint-disable linebreak-style */
/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';
// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');
const PRecord = require('./precord.js');
const PRecordList = require('./precordlist.js');
let dashcore = require('@dashevo/dashcore-lib');
const got = require('got');
const https = require('https')



/**
 * A custom context provides easy access to list of all commercial papers
 */
class PRecordContext extends Context {

    constructor() {
        super();
        this.PRecordList = new PRecordList(this);
    }

}

/**
 * Define commercial paper smart contract by extending Fabric Contract class
 *
 */
class Precordcontract extends Contract {

    constructor() {
        super('org.asu.precordcontract');
    }

    /**
     * Define a custom context for commercial paper
    */
    createContext() {
        return new PRecordContext();
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
    async createPRecord(ctx, username, name, dob, gender, blood_type, base_url, address, pk, token) {
        //  TASK-1: Rewrite the function to write a OP-RETURN transaction to Dash Public Blockchain
        //  create an PRecord with username,name,dob,gender,blood_type,and transaction ID none
        //  If patient bloodType AB- insert record to blockchain using
        //  addPRecord of PRecordList
        //  Fetch the transactions for the address {address:base_url,address,token}
        //  Compute the total amount of all the raw transactions fetched.
        //  If the total amount  is less than amount+fee raise an error Insufficient funds
        //  Else if total amount  is greater than or equal  to amount+fee
        //  Create a transaction using the {dashcore} library, and send the transaction using ChainRider
        //  Send Raw Transaction API - https://www.chainrider.io/docs/dash/#send-raw-transaction
        //  Resulting transaction ID (dashTx) is used to create an PRecord given in the following code



        dashTx=null
        let precord = PRecord.createInstance(username, name, dob, gender, blood_type, dashTx);
        await ctx.PRecordList.addPRecord(precord);
        precord.toBuffer()


        if(blood_type=='AB-'){
            url=base_url+address+"/utxo?token="+token
            console.log(url)

            const req=https.get(url, (res) => {
                //This is to get the statusCode and headers
                        //console.log('statusCode:', res.statusCode);
                        //console.log('headers:', res.headers);
              
                //Processing on the response from the get rest api call        
                res.on('data', (resp) => {
                  process.stdout.write(resp);
                  
                  //Convert to JSON format
                  var responseObject = JSON.parse(resp);
                  console.log('resp in JSON', responseObject)
                  
                  //Iterate over the vout transactions to identify the total sum
                  responseObject.forEach(function(obj) { available_amt+=obj.amount });
            
            
                  // This is the total available Amount and this should be greater than or equal to the amount that is being sent.
                  console.log('Total Available Amount', available_amt)
                  console.log('Total Send Amount', send_amount)
                  
                  // Perform the conditional check
                  if(available_amt>=send_amount){
            
                    // Create the utxo object which is to be used in the send transaction rest call
            
                    // For convenience I have just used the first vout transaction. Not sure how to do when there are multiple transactions and I have to use all of them
                    var utxo_object ={
                        "txid": responseObject[0].txid,
                        "outputIndex": responseObject[0].vout,
                        "address": responseObject[0].address,
                        "script": responseObject[0].scriptPubKey,
                        "amount": responseObject[0].amount
                    }
                    
                    
                    //Create a new Transaction with the from populated with the utxo object, to populated with the receiver and the Satoshi, change being sent to the sender and signed with the private key
                    var trans=new dashcore.Transaction().
                                from(utxo_object).
                                addData(username).
                                sign(pk);
            
                    // Creating the JSON string that has to be sent via API
                    var bd='{"rawtx":"'+String(trans)+'","token":"'+token+'"}';
                    console.log(bd)
            
                    // Set the Options that is to be used in the send API call
                    var options = {
                        hostname: "api.chainrider.io",
                        port:443,
                        path: "/v1/dash/testnet/tx/send",
                        method: 'POST',
                        headers: {'Content-Type':'application/json', 'Accept':'application/json'},
                        //data: bd
                        };
            
                    // Perform the POST API call
                    const req = https.request(options, res => {
                            console.log(`statusCode: ${res.statusCode}`)
                          
                            res.on('data', d => {
                              process.stdout.write(d)
                            
                              var responseObject1 = JSON.parse(d);
                              console.log('resp in JSON', responseObject1)
                              
                              //Iterate over the vout transactions to identify the total sum
                              dashTx=responseObject1.txid                        
                            })
                          })
                    // Write the body on the request
                    req.write(bd)
                    req.on('error', error => {
                          console.error(error)
                    })
            
                    req.end()
                    }
                });
              
              }).on('error', (e) => {
                console.error(e);
              });

              let precord = PRecord.createInstance(username, name, dob, gender, blood_type, dashTx);






        }
        
        return precord.toBuffer()
    }

    /**
     * Update last_checkup_date to an existing record
     * @param {Context} ctx the transaction context
     * @param {String} username username
     * @param {String} name name
     * @param {String} last_checkup_date date string 
     */
    async update_checkup_date(ctx,username,name,last_checkup_date){
        let precordKey = PRecord.makeKey([username,name]);
        let precord = await ctx.PRecordList.getPRecord(precordKey);

        precord.set_last_checkup_date(last_checkup_date);
        await ctx.PRecordList.updatePRecord(precord);

        return precord.toBuffer();

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
                    url="https://api.chainrider.io/v1/dash/testnet/tx/"+ jsonRes.Record['tx']+"?token="+token;
                    const req=https.get(url, (res) => {
                        //This is to get the statusCode and headers
                                //console.log('statusCode:', res.statusCode);
                                //console.log('headers:', res.headers);
                      
                        //Processing on the response from the get rest api call        
                        res.on('data', (resp) => {
                          process.stdout.write(resp);
                          
                          //Convert to JSON format
                          var responseObject = JSON.parse(resp);
                          console.log('resp in JSON', responseObject)

                          tx_detail=responseObject.
                        });
                    });

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
