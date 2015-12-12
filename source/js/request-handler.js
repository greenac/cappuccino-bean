'use strict';

var logger = require('gruew-logger');
var jsonFile = require('jsonfile');
var path = require('path');
var config = require('./../../config');
var InstagramFetcher = require('./instagram-fetcher');


function RequestHandler() {
    this.saveToken = function (req, res, next) {
        console.log('in save token function with headers:', req.headers);
        try {
            var payload = req.body;
        } catch(e) {
            logger(['Error: bad request:', req.body], __filename, false, true);
            return res.status(400).send(JSON.stringify({error:e}));
        }

        logger(['saveToken got request:', payload], __filename, false, false);
        res.send(JSON.stringify({
            error: null,
            payload: payload
        }));

        if (payload && payload.instagramKey) {
            var instagramFetcher = new InstagramFetcher(payload.instagramKey);
            instagramFetcher.fetch(function(error, data) {

            });

            jsonFile.writeFile(
                path.join(__dirname, config.filePaths.instagramFile),
                payload,
                function (error) {
                    if (error) {
                        logger(
                            ['Could not save to', config.filePaths.instagramFile],
                            __filename,
                            true,
                            false
                        );
                        return;
                    }

                    logger(['Saved instagram key to file'], __filename, false, false);
                }.bind(this)
            );
        }
    };
}

module.exports = RequestHandler;
