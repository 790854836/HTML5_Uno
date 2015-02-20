// Requirements
var http = require('http');
var url = require('url');
var querystring = require('querystring');

var route = require('./webRouter.js');
var handle = require('./webRequestHandler.js');

var port = process.env.port || 8080;
var httpServerObj = null;

// Parse console arguments
var parseArguments = function () {

    var cntr = 2;

    while (cntr < process.argv.length) {

        switch (process.argv[cntr]) {
            case "--caching":
                
                ++cntr;
                // Caching is true by default, so we only need to disable it if requested
                if (process.argv[cntr] === "0") {
                    handle.enableCaching(false);
                    console.log("Caching disabled");
                }
                
                ++cntr;

                break;
            default:
                console.warn("Unknown argument: " + process.argv[cntr]);
                ++cntr;
                break;;
        }

    }

};

// Starts the HTTP server for serving the client page
function start(route, handle) {

    function onRequest(request, response) {
        var pathname = url.parse(request.url).pathname;
        route(handle, pathname, request, response);
    }

    httpServerObj = http.createServer(onRequest);
    httpServerObj.listen(port);

    console.log("Server started");
};

parseArguments();
start(route.route, handle.handles);