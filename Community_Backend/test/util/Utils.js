/**
 * Created by Desktop on 6/22/2016.
 */
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

module.exports = {
    failOnNullandUndefinedValueInObject : function (env){
        for(var prop in env){
            expect(env[prop]).to.not.equal(null);
            expect(env[prop]).to.not.equal(undefined);
        }
    },
    failOnNullandUndefinedValue : function (value){
            expect(value).to.not.equal(null);
            expect(value).to.not.equal(undefined);
    },
    dbConfigurationCheck : function (env, additionalProp){
        expect(env).to.contains.all.keys('connectionLimit' , 'host', 'user', 'password');
        if( !!additionalProp ){
            expect(env).to.contains.all.keys(additionalProp);
        }
        this.failOnNullandUndefinedValueInObject(env);
    }
}