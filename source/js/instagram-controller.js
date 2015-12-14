'use strict';

var jsonFile = require('jsonfile');
var _ = require('underscore');
var config = require('./../../config');
var logger = require('gruew-logger');
var queryString = require('querystring');
var async = require('async');
var https = require('https');
var path = require('path');


function InstagramController(key, redirectUri) {
    this.key = key;
    this.redirectUri = redirectUri;
    this.accessToken = null;
    this.accessData = null;

    this.fetchAccessToken = function (callback) {
        async.series([
            this.getParameters.bind(this),
            this.getAccessToken.bind(this),
            this.saveParams.bind(this)
        ], function(error) {
            if (error) {
                logger.log(['getting access token async:', error], __filename, true);
                if (callback) {
                    callback(false);
                }
                return;
            }

            if (this.accessData && this.accessToken) {

                logger.log(['got access token', this.accessToken], __filename, false);

                if (callback) {
                    callback(true);
                }
            } else if (callback) {
                logger.log(['no access token in instagram data'], __filename, true);
                callback(false)
            }
        }.bind(this));
    };

    this.getParameters = function (callback) {
        if (this.key && this.redirectUri) {
            callback();
            return;
        }

        jsonFile.readFile(config.filePaths.instagramFile, function (error, contents) {
            if (error) {
                logger.log(
                    ['could not get instagram parms from file:', config.filePaths.instagramFile],
                    __filename,
                    true
                );
                callback(new Error('Could not read instagram file'));
                return;
            }

            if (_.has(contents, 'key') && _.has(contents, 'redirectUri')) {
                this.key = contents.key;
                this.redirectUri = contents.redirectUri;

                if (_.has(contents, 'accessToken')) {
                    this.accessToken = contents.accessToken;
                }

                callback();
            } else {
                callback(new Error('file does not have parameters'));
            }
        }.bind(this));
    };

    this.getAccessToken = function (callback) {
        if (!this.key || !this.redirectUri) {
            logger.log(['Instagram key and/or redirect uri not set'], __filename, true);
            callback(new Error('Missing Parameters'));
            return;
        }

        var params = queryString.stringify({
            client_id: config.apiInfo.instagram.clientId,
            client_secret: config.apiInfo.instagram.clientSecret,
            grant_type: 'authorization_code',
            redirect_uri: this.redirectUri,
            code: this.key
        });

        var options = {
            host: config.apiInfo.instagram.baseUri,
            port: 443,
            path: config.apiInfo.instagram.accessTokenPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(params)
            }
        };

        var req = https.request(options, function(res) {
            var data = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                logger.log(
                    ['Received chunk of data from', config.apiInfo.instagram.baseUri],
                    __filename,
                    false
                );
                data += chunk;
            });

            res.on('end', function () {
                this.accessData = JSON.parse(data);

                logger.log(['Received access data:', this.accessData], __filename, false);

                if (_.has(this.accessData, 'access_token')) {
                    this.accessToken = this.accessData['access_token'];
                }

                callback();
            }.bind(this));
        }.bind(this));

        req.on('error', function(error) {
            callback(error);
        });

        req.write(params);
        req.end();
    };

    this.saveParams = function (callback) {
        if (!this.key || !this.redirectUri) {
            logger.log(['missing instagram parameters'], __filename, true);
            callback();
            return;
        }

        var params = {
            key: this.key,
            redirectUri: this.redirectUri,
            accessToken: this.accessToken
        };

        jsonFile.writeFile(config.filePaths.instagramFile, params, function(error) {
            if (error) {
                logger.log(
                    ['could not save instagram parms to file:', config.filePaths.instagramFile],
                    __filename,
                    true
                );
                callback(new Error('Could not save to file'));
                return;
            }

            callback();
        }.bind(this));
    };

    this._getRecentMedia = function (callback) {
        var params = {
            access_token: this.accessToken
        };

        var options = {
            host: config.apiInfo.instagram.baseUri,
            port: 443,
            path: config.apiInfo.instagram.recentMediaPath + this.constructUriPath(params),
            method: 'GET'
        };

        var req = https.request(options, function(res) {
            var data = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                logger.log(
                    ['Received chunk of data from', config.apiInfo.instagram.baseUri],
                    __filename,
                    false
                );
                data += chunk;
            });

            res.on('end', function () {
                var media = JSON.parse(data);
                if (_.has(media, 'data')) {
                    this._parseRecentMedia(media.data);
                }

                logger.log(['Received recent media'], __filename, false);
                callback();
            }.bind(this));
        }.bind(this));

        req.on('error', function(error) {
            console.log('error here');
            callback(error);
        });

        req.end();
    };

    this.fetchRecentMedia = function(callback) {
        this.getParameters(function() {
            if (!this.accessToken) {
                callback(new Error('no access token'));
                return;
            }

            this._getRecentMedia(callback);
        }.bind(this));
    };

    this._parseRecentMedia = function (media) {
        var info = {};
        _.each(media, function (entry) {
            info[entry.link] = {
                pic: entry.images['standard_resolution'].url,
                text: entry.caption.text,
                timeCreated: entry['created_time']
            };
        });
    };

    this.constructUriPath = function(params) {
        var uri = '?';
        _.each(params, function(value, key) {
            uri += key + '=' + value + '&';
        });

        return uri.substring(0, uri.length - 1);
    };
}

module.exports = InstagramController;
