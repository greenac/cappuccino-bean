var express = require('express');
var bodyParser = require('body-parser');
var logger = require('gruew-logger');
var cors = require('cors');
var RequestHandler = require('./request-handler');

function App() {
    this.port = process.env.NODE_PORT || '3334';
    this.start = function () {

        this.startServer();
    };

    this.startServer = function () {
        var app = express();
        app.use(bodyParser.json());
        app.use(cors());

        var requestHandler = new RequestHandler();
        app.post('/save-token', requestHandler.saveToken);

        app.listen(this.port, function () {
             logger(['Sever listening on port: ' + this.port], __filename, false, false);
        }.bind(this));
    }
}

module.exports = App;
