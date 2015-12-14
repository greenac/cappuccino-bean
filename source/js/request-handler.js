'use strict';

var logger = require('gruew-logger');
var InstagramController = require('./instagram-controller');
var _ = require('underscore');


function RequestHandler() {
    this.saveToken = function (req, res, next) {
        try {
            var payload = req.body;
        } catch(e) {
            logger.log(['Error: bad request:', req.body], __filename, false);
            return res.status(400).send(JSON.stringify({error:e}));
        }

        logger.log(['saveToken received request:', payload], __filename, false);

        if (payload && _.has(payload, 'key') && _.has(payload, 'redirectUri')) {
            var instagramController = new InstagramController(
                payload.key,
                payload.redirectUri
            );

            instagramController.fetchAccessToken(function(success) {
                logger.log(['fetch was a: ', success ? 'success' : 'failure'], __filename, false);
                res.send(JSON.stringify({
                    error: success ? null : 'could not get access token',
                    payload: success ? payload : null
                }));
            });
        } else {
            logger.log(['missing key and/or redirect uri'], __filename, true);
            res.send(JSON.stringify({
                error: 'missing parameters',
                payload: null
            }));
        }
    };
}

module.exports = RequestHandler;
