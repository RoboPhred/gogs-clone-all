'use strict';

const path = require('path');

const urljoin = require('url-join');
const minimist = require('minimist');
const request = require('request');
const gitClone = require('git-clone');



const gogsApiRoot = '/api/v1';



const args = minimist(process.argv.slice(2), {
    string: ['dir', 'token']
});

if (args._.length < 1) {
    console.error("Usage: gogs-clone-all <gogs-url> --token <access-token>");
    return;
}

const targetDir = args['dir'] || args['d'] || process.cwd();

const targetUrl = args._[0];
const accessToken = args['token'] || args['t'] || null;


if (accessToken == null) {
    console.error("Access token must be specified with --token.");
    process.exit(1);
}

const targetApiUrl = urljoin(targetUrl, gogsApiRoot);



getOrDie('user/repos', (response, body) => {
    let remainingClones = body.length;
    function cloneCb() {
        if (--remainingClones === 0) {
            process.exit(0);
        }
    }

    // TODO: Limit concurrency
    body.forEach(repo => {
        gitClone(repo.clone_url, path.join(targetDir, repo.full_name), cloneCb);
    });
});


function getOrDie(addressPath, callback) {
    const address = urljoin(targetApiUrl, addressPath);

    const headers = {
        Authorization: 'token ' + accessToken
    };

    request.get(address, {
        headers,
        json: true
    }, (err, response, body) => {
        checkResponse(address, err, response);
        callback(response, body);
    });
}

function checkResponse(address, err, response) {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    if (response.statusCode !== 200) {
        // TODO: Find where request hides its response documentation.  Is statusMessage a real thing?
        console.error('Request failed at "%s": status code %s: %s', address, response.statusCode, response.statusMessage);
        process.exit(1);
    }
}