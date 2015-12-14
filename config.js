'use strict';

var path = require('path');


module.exports = {
    filePaths: {
        instagramFile: path.join(__dirname, 'source/files/instagram_token.json')
    },
    apiInfo: {
        instagram: {
            clientId: process.env.INSTAGRAM_CLIENT_ID || '4265370676f743eabb781e15f2228ed5',
            clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || 'f9cf460d3567413f81082a1af2f0aa8a',
            baseUri: 'api.instagram.com',
            accessTokenPath: '/oauth/access_token',
            recentMediaPath: '/v1/users/self/media/recent'
        }
    }
};