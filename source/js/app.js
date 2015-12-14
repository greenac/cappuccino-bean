var express = require('express');
var bodyParser = require('body-parser');
var logger = require('gruew-logger');
var cors = require('cors');
var RequestHandler = require('./request-handler');
var InstagramController = require('./instagram-controller');


function App() {
    this.port = process.env.NODE_PORT || '3334';
    this.start = function () {
        if (process.argv.length > 2 && process.argv[2] === 'token') {
            var instagramController = new InstagramController();
            instagramController.fetchAccessToken();
        } else if (process.argv.length > 2 && process.argv[2] === 'media') {
            var instagramController = new InstagramController();
            instagramController.fetchRecentMedia(function(error) {
                if (error) {
                    logger.log(['could not retrieve media', error], __filename, true);
                    return;
                }

                logger.log(['retrieved media successfully'], __filename, false);
            });
        } else {
            this.startServer();
        }
    };

    this.startServer = function () {
        var app = express();
        app.use(bodyParser.json());
        app.use(cors());

        var requestHandler = new RequestHandler();
        app.post('/save-token', requestHandler.saveToken);

        app.listen(this.port, function () {
             logger.log(['Sever listening on port: ' + this.port], __filename, false);
        }.bind(this));
    }
}

module.exports = App;
