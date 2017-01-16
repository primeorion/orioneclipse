"use strict";
var cache = require('memory-cache');
var chai = require("chai");
var should = require("chai").should();
var chaiHttp = require('chai-http');
var constdata = require('../../../test/config/Constants.js').Constants;
var assert = require('assert');
var body = '';

var baseurl;
var expect;
var timeout;
var logoUploadSmall, logoUploadLarge, documentUpload, modelUpload;

var eclipseAccessToken = cache.get('testLoginToken')
chai.use(chaiHttp);
console.log(eclipseAccessToken);
var inputData = {
    baseurl: constdata.baseurl,
    expect: constdata.expect,
    timeout: constdata.timeout,
    logoUploadSmall: constdata.logoUploadSmall.api,
    logoUploadLarge: constdata.logoUploadLarge.api,
    documentUpload: constdata.documentUpload.api,
    modelUpload: constdata.modelUpload.api,
};

baseurl = inputData.baseurl;
expect = inputData.expect;
timeout = inputData.timeout;

logoUploadSmall = inputData.logoUploadSmall;
logoUploadLarge = inputData.logoUploadLarge;
documentUpload = inputData.documentUpload;
modelUpload = inputData.modelUpload;

describe('"**** Upload Test Cases ****"', function () {
    /** -------------------------------------Test cases for Logo Upload - Small Sized------------------------------------- */
    describe("Small Logo Upload Test Case # 1", function () {
        it('Should Upload Small Logo', function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .post(logoUploadSmall)
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .field('Content-Type', 'multipart/form-data')
                .attach('logo', '/public/logos/small/tom.jpg')
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
    describe("Small Logo Upload Test Case # 2", function () {
        it('Should Fail to Upload Small Logo', function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .post('v1/community/strategists/-1/logo/small')
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .field('Content-Type', 'multipart/form-data')
                .attach('logo', '/public/logos/small/tom.jpg')
                .end(function(err,res){
                    setTimeout(function () { 
                        try{
                            res.status.should.equal(404);
                            done();
                        }
                        catch(err){
                            done(err);
                        }  
                    }); 
                });
        });
    });
    describe("Small Logo Upload Test Case # 3", function () {
        it('Should Fail to Upload Small Logo', function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .post(logoUploadSmall)
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .field('Content-Type', 'multipart/form-data')
                .end(function(err,res){
                    setTimeout(function () { 
                        try{
                            res.status.should.equal(400);
                            done();
                        }
                        catch(err){
                            done(err);
                        }  
                    }); 
                });
        });
    });
    describe("Small Logo Upload Test Case # 4", function () {
        it('Should Fail to Upload Small Logo', function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .post(logoUploadSmall)
                .set('Authorization', 'Session ' + "alksdfjlaksd")
                .field('Content-Type', 'multipart/form-data')
                .attach('logo', '/public/logos/small/tom.jpg')
                .end(function(err,res){
                    setTimeout(function () { 
                        try{
                            res.status.should.equal(401);
                            done();
                        }
                        catch(err){
                            done(err);
                        }  
                    }); 
                });
        });
    });
    /** -------------------------------------Test cases for Logo Upload - Large Sized------------------------------------- */
    describe("large Logo Upload Test Case # 1", function () {
        it('Should Upload Large Logo', function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .post(logoUploadLarge)
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .field('Content-Type', 'multipart/form-data')
                .attach('logo', '/public/logos/large/tom.jpg')
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

    describe("large Logo Upload Test Case # 2", function () {
        it('Should Upload Large Logo', function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .post('v1/community/strategists/-1/logo/large')
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .field('Content-Type', 'multipart/form-data')
                .attach('logo', '/public/logos/large/tom.jpg')
                .end(function(err,res){
                    setTimeout(function () { 
                        try{
                            res.status.should.equal(404);
                            done();
                        }
                        catch(err){
                            done(err);
                        }  
                    }); 
                });
        });
    });

    describe("Large Logo Upload Test Case # 3", function () {
        it('Should Fail to Upload Large Logo', function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .post(logoUploadLarge)
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .field('Content-Type', 'multipart/form-data')
                .end(function(err,res){
                    setTimeout(function () { 
                        try{
                            res.status.should.equal(400);
                            done();
                        }
                        catch(err){
                            done(err);
                        }  
                    }); 
                });
        });
    })

    describe("Large Logo Upload Test Case # 4", function () {
        it('Should Fail to Upload Large Logo', function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .post(logoUploadLarge)
                .set('Authorization', 'Session ' +'asdfasdf')
                .field('Content-Type', 'multipart/form-data')
                .end(function(err,res){
                    setTimeout(function () { 
                        try{
                            res.status.should.equal(401);
                            done();
                        }
                        catch(err){
                            done(err);
                        }  
                    }); 
                });
        });
    })

    /** -------------------------------------Test cases for document Upload - PDF types------------------------------------- */

    describe("Upload Document Test Case # 1", function () {
        it('Should Upload document', function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .post(documentUpload)
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .field('Content-Type', 'multipart/form-data')
                .field('name', 'my custom file name')
                .field('description', 'my custom file desc')
                .attach('document', '/public/documents/oops.pdf')
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
    })

    describe("Upload Document Test Case # 2", function () {
        it('Should Not Upload document', function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .post('v1/community/strategists/-1/document')
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .field('Content-Type', 'multipart/form-data')
                .field('name', 'my custom file name')
                .field('description', 'my custom file desc')
                .attach('document', '/public/documents/oops.doc')
                .end(function(err,res){
                    setTimeout(function () { 
                        try{
                            res.status.should.equal(404);
                            done();
                        }
                        catch(err){
                            done(err);
                        }  
                    }); 
                });
        });
    })

   describe("Upload Document Test Case # 3", function () {
        it('Should Not Upload document', function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .post(documentUpload)
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .field('Content-Type', 'multipart/form-data')
                .field('name', 'my custom file name')
                .field('description', 'my custom file desc')
                .end(function(err,res){
                    setTimeout(function () { 
                        try{
                            res.status.should.equal(400);
                            done();
                        }
                        catch(err){
                            done(err);
                        }  
                    }); 
                });
        });
    })

    describe("Upload Document Test Case # 4", function () {
        it('Should Not Upload document', function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .post('v1/community/strategists/200000/document')
                .set('Authorization', 'Session ' + 'asdfasdfasdf')
                .field('Content-Type', 'multipart/form-data')
                .field('name', 'my custom file name')
                .field('description', 'my custom file desc')
                .attach('document', '/public/documents/oops.pdf')
                .end(function(err,res){
                    setTimeout(function () { 
                        try{
                            res.status.should.equal(401);
                            done();
                        }
                        catch(err){
                            done(err);
                        }  
                    }); 
                });
        });
    })
    /** -------------------------------------Test cases for Model Upload - xls & xlsx types------------------------------------- */

    describe("Upload Model Test Case # 1", function () {
        it('Should Upload Model', function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .post(modelUpload)
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .field('Content-Type', 'multipart/form-data')
                .field('name', 'my custom file name')
                .field('description', 'my custom file desc')
                .attach('model', '/public/models/ImportModelTemplate.xlsx')
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
    })

    describe("Upload Model Test Case # 2", function () {
        it('Should Not Upload Model', function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .post('v1/community/strategists/-1/model')
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .field('Content-Type', 'multipart/form-data')
                .field('name', 'my custom file name')
                .field('description', 'my custom file desc')
                .attach('model', '/public/models/ImportModelTemplate.xlsx')
                .end(function(err,res){
                    setTimeout(function () { 
                        try{
                            res.status.should.equal(404);
                            done();
                        }
                        catch(err){
                            done(err);
                        }  
                    }); 
                });
        });
    })


    describe("Upload Model Test Case # 3", function () {
        it('Should Not Upload Model', function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .post(modelUpload)
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .field('Content-Type', 'multipart/form-data')
                .field('name', 'my custom file name')
                .field('description', 'my custom file desc')
                .end(function(err,res){
                    setTimeout(function () { 
                        try{
                            res.status.should.equal(400);
                            done();
                        }
                        catch(err){
                            done(err);
                        }  
                    }); 
                });
        });
    })


    describe("Upload Model Test Case # 4", function () {
        it('Should Not Upload Model', function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .post(modelUpload)
                .set('Authorization', 'Session ' +'asdfasdfasdf')
                .field('Content-Type', 'multipart/form-data')
                .field('name', 'my custom file name')
                .field('description', 'my custom file desc')
                .attach('model', '/public/models/ImportModelTemplate.xlsx')
                .end(function(err,res){
                    setTimeout(function () { 
                        try{
                            res.status.should.equal(401);
                            done();
                        }
                        catch(err){
                            done(err);
                        }  
                    }); 
                });
        });
    })
});