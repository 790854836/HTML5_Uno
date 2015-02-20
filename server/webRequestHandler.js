var querystring = require("querystring");
var fs = require("fs");
var path = require("path");

var htmlCache = {};
var jsCache = {};
var imageCache = {};

var caching = true;
var handles = {};

// Handles the requests of html files
var htmlHandler = function (request, response, filename) {

    if (htmlCache[filename] !== undefined) {

        response.writeHead("200", { "Content-Type": "text/html" });
        response.write(htmlCache[filename]);
        response.end();

    } else {
        
        if (path.extname(filename) === "") {
            filename = filename + ".html";
        }

        fs.readFile("./html/" + filename, function (err, data) {

            if (err) {
                
                if (err.code === "ENOENT") {
                    notFound(request, response, filename);
                    return;
                } else {
                    handleInternalError(request, response, err);
                    return;
                }
            }

            var dataStr = data.toString();
            response.writeHead("200", { "Content-Type": "text/html" });
            response.write(dataStr);
            response.end();
            
            if (enableCaching === true) {
                htmlCache[fileName] = dataStr;
            }
        });

    }

};

// Handles the requests for javascript files
var javascriptHandler = function (request, response, filename) {

    if (jsCache[filename] !== undefined) {
        
        response.writeHead("200", { "Content-Type": "text/html" });
        response.write(jsCache[filename]);
        response.end();

    } else {
        
        fs.readFile("./js/" + filename, function (err, data) {
            
            if (err) {
                if (err.code === "ENOENT") {
                    notFound(request, response, filename);
                    return;
                } else {
                    handleInternalError(request, response, err);
                    return;
                }
            }

            var dataStr = data.toString();
            response.writeHead("200", { "Content-Type": "text/javascript" });
            response.write(dataStr);
            response.end();
            
            if (enableCaching === true) {
                jsCache[fileName] = dataStr;
            }
        });

    }

};

// Handles the requests for image files
var imageHandler = function (request, response, filename) {

    if (imageCache[filename] !== undefined) {

        var imgext = path.extname(filename);
        response.writeHead("200", { "Content-Type": "image/" + imgext.slice(1) });
        response.write(imageCache[filename], "binary");
        response.end();

    } else {

        fs.readFile("./img/" + filename, function (err, data) {
            
            if (err) {
                if (err.code === "ENOENT") {
                    notFound(request, response, filename);
                    return;
                } else {
                    handleInternalError(request, response, err);
                    return;
                }
            }

            var imgext = path.extname(filename);
            response.writeHead("200", { "Content-Type": "image/" + imgext.slice(1) });
            response.write(data, "binary");
            response.end();
            
            if (enableCaching === true) {
                imageCache[filename] = data;
            }
        });

    }

};

// Request handler when no matching handler could be found
var notFound = function (request, response, filename) {
    response.writeHead("404", { "Content-Type": "text/plain" });
    response.write("404 Content not found");
    response.end();
};

// Handles internal server errors
var handleInternalError = function (request, response, err) {
    response.writeHead("500", {
        "Content-Type" : "text/plain"
    });
    response.write("An internal server error occurred... Try again in a few minutes.");
    response.end();
    console.log(JSON.stringify(err));
    //throw err;
};

// Enables / disables caching of resources
var enableCaching = function (enable) {
    caching = enable;
};

handles.html = htmlHandler;
handles.javascript = javascriptHandler;
handles.image = imageHandler;
handles.notFound = notFound;

exports.handles = handles;
exports.enableCaching = enableCaching;