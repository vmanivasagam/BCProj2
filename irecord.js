'use strict';

const State = require('./ledger-api/state.js');

class IRecord extends State {

    constructor(obj) {
        super(IRecord.getClass(),[obj.username, obj.name]);
        Object.assign(this,obj);
    }

    //Helper functions for returning objects

    static fromBuffer(buffer) {
        return IRecord.deserialize(Buffer.from(JSON.parse(buffer)));
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    //Helper Functions for reading and writing attributes
    getUsername() {
        return this.username;
    }
    
    setUsername(newUsername) {
        return this.username=newUsername;
    }
    
    getName() {
        return this.name;
    }
    
    setName(newName) {
        return this.name=newName;
    }

    getdob() {
        return this.dob;
    }
    
    setdob(newdob) {
        return this.dob=newdob;
    }

    getgender() {
        return this.gender;
    }
    setgender(newgender) {
        return this.gender=newgender;
    }

    getbloodtype() {
        return this.gender;
    }
    setbloodtype(newbloodtype) {
        return this.blood_type=newbloodtype;
    }

    get_last_checkup_date(){
        return this.last_checkup_date;
    }
    set_last_checkup_date(new_last_checkup_date){
        return this.last_checkup_date=new_last_checkup_date;
    }
    
    
    /**
     * Deserialize a state data to commercial paper
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, IRecord);
    }

    //  TASK-2: add additional field for instance
    static createInstance(username, name, dob, gender, blood_type, tx) {
        // GRADED FUNCTION
        // update this function to add new field lastcheckupDate to IRecord.


        return new IRecord({username, name, dob, gender, blood_type, tx});
    }

    static getClass() {
        return 'org.asu.irecord';
    }


}

module.exports = IRecord;
