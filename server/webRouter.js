var querystring = require("querystring");
var path = require("path");

// Routes different types of resource requests to their correct handlers
var route = function(handle, pathname, request, response) {
    
    var extension = path.extname(pathname);
    var filename = path.basename(pathname);

    switch (extension) {
        case "":
        case ".html":
            
            if (filename === "") {
                filename = "index";
            }
            
            handle.html(request, response, filename);
            break;
        case ".js":
            handle.javascript(request, response, filename);
            break;
        case ".jpeg":
        case ".jpg":
        case ".png":
            handle.image(request, response, filename);
            break;
        default:
            handle.notFound(request, response, filename);
            break;
    }
    
};

exports.route = route;