
'use strict';

// Modules
require('should');
var supertest = require('supertest');
var express   = require('express');

// Subject
var error_handler = require('../lib/index.js');

// New App
var app = express();

// Normal Route
app.get('/normal', function (req, res, next) {
  res.send(200, { hello : 'world' });
});

// Error - Next
app.get('/error-next', function (req, res, next) {
  next(new Error('Next Error'));
});

// Error - Throw
app.get('/error-throw', function (req, res, next) {
  throw new Error('Throw Error');
});

// Attach Error Handler
error_handler(app);

// Bind SuperTest
var request = supertest(app);

describe('Error Handler', function () {

  describe('Normal Route', function () {

    it('should respond with 200 and some data', function (done) {
      request.get('/normal')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({ hello : 'world' })
        .end(done);
    });

  });

  describe('Not Found (404)', function () {

    it('should respond with 404 and the path/method', function (done) {
      request.get('/does-not-exist')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .expect({
          error : {
            type    : 'client',
            name    : 'ErrorNotFound',
            message : 'Resource was not found',
            data    : {
              method : 'GET',
              path   : '/does-not-exist'
            }
          }
        })
        .end(done);
    });

    // Should not return query strings
    it('should respond with 404 and the path/method', function (done) {
      request.post('/lost-in-space?query=string&stuff=things')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .expect({
          error : {
            type    : 'client',
            name    : 'ErrorNotFound',
            message : 'Resource was not found',
            data    : {
              method : 'POST',
              path   : '/lost-in-space'
            }
          }
        })
        .end(done);
    });

  });

  describe('Server Error (500)', function () {

    it('should respond with 500 when handling a error passed to next()', function (done) {
      request.get('/error-next')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(500)
        .expect({
          error : {
            type    : 'server',
            name    : 'Error',
            message : 'Next Error'
          }
        })
        .end(done);
    });

    it('should respond with 500 when handling a thrown error', function (done) {
      request.get('/error-throw')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(500)
        .expect({
          error : {
            type    : 'server',
            name    : 'Error',
            message : 'Throw Error'
          }
        })
        .end(done);
    });

  });

});
