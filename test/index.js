"use strict";

var should = require('chai').should();
var karlsencore = require('../');

describe('#versionGuard', function() {
  it('global._karlsencoreLibVersion should be defined', function() {
    should.equal(global._karlsencoreLibVersion, karlsencore.version);
  });

  it('throw an error if version is already defined', function() {
    (function() {
      karlsencore.versionGuard('version');
    }).should.throw('More than one instance of bitcore');
  });
});
