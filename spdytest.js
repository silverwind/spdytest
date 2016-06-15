"use strict";

var spdy   = require("spdy");
var https  = require("https");
var fs     = require("fs");
var util   = require("util");
var Busboy = require("busboy");

var opts = {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
    honorCipherOrder: true,
};

var optsSpdy = Object.assign(opts, {
    windowSize: 1024 * 1024,
    protocols: "spdy/3.1",
});

var optsH2 = Object.assign(optsSpdy, {
    protocols: "h2",
});

var handler = function (req, res) {
    if (req.url === "/") {
        res.writeHead(200, {"content-type": "text/html"});
        res.end(fs.readFileSync("page.html"));
    } else if (req.url === "/upload") {
        console.log("Upload started");
        var busboy = new Busboy({headers: req.headers})
        busboy.on("finish", function() {
          console.log("Upload finished");
          res.writeHead(200);
          res.end();
        });
        req.pipe(busboy);
    } else {
        res.writeHead(404);
        res.end();
    }
};

https.createServer(opts, handler).listen(2000, function() {
    console.log("HTTPS 1.1 listening on https://localhost:2000");
});
spdy.createServer(optsSpdy, handler).listen(2001, function() {
    console.log("SPDY 3.1 listening on https://localhost:2001");
});
spdy.createServer(optsH2, handler).listen(2002, function() {
    console.log("HTTP 2 listening on https://localhost:2002");
});
