"use strict";
var cache = require('memory-cache');
var chai = require("chai");
var should = require("chai").should();
var chaiHttp = require('chai-http');
var constdata = require('./../../test/config/Constants.js').Constants;
var assert = require('assert');
var body = '';
var baseurl;
var expect;
var timeout;
var logout;
var eclipseAccessToken=cache.get('testLoginToken')
chai.use(chaiHttp);
var inputData = {
                baseurl:constdata.baseurl,
                expect:constdata.expect,
                timeout:constdata.timeout,
                logout:constdata.logout.api
        };
baseurl     =inputData.baseurl;
expect      =inputData.expect;
timeout     =inputData.timeout;
logout      =inputData.logout;

describe("**** Logout Test Cases ****",function(){ 
    describe("**** START ****",function(){
    //===================================================LOGOUT TEST CASE==============================================================================================
    describe("LOGOUT TEST CASE # 1",function(){ 
             it("Should User Logout",function(done){ 
                     this.timeout(timeout);
                     chai.request(baseurl)
                         .get(logout)
                         .set('Authorization', 'Session '+cache.get('testLoginToken'))
                         .end(function(err,res){
                            setTimeout(function () { 
                                try{
                                    res.status.should.equal(200);
                                    done();
                                }
                                catch(err){
                                    done(err);
                                }  
                            }); 
                         });
              });
     });                   
    
    describe("LOGOUT TEST CASE # 2 (Unauthorized request)",function(){ 
             it("Should Return 401 ",function(done){ 
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .get(logout)
                        .set('Authorization', 'Session '+cache.get('testLoginToken'))
                        .end(function(err,res){
                            setTimeout(function () {
                                try {
                                     res.status.should.equal(401);
                                     done();
                                }
                                catch (e) {
                                     done(e);
                                }
                              });
                         });
              });
    });
    describe("LOGOUT TEST CASE # 3 (Forbidden request)",function(){ 
              it("Should Return 403/401 ",function(done){ 
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .get(logout)
                        .end(function(err,res){
                             setTimeout(function () {
                                 try {
                                      if(res.status==403){
                                           res.status.should.equal(403);
                                           done();  
                                      }       
                                      else {
                                           res.status.should.equal(401);
                                           done();  
                                      }
                                  }
                                  catch (e) {
                                       done(e);
                                  }
                              });
                        });
             });
        });
    });
});