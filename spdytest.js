"use strict";

var spdy         = require("spdy"),
    https        = require("https"),
    fs           = require("fs"),
    util         = require("util"),
    multiparty   = require("multiparty");

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
        var form = new multiparty.Form();
        console.log("upload started");
        form.parse(req, function (err, fields, files) {
            if (err) {
                res.writeHead(400);
                res.end();
                console.log("invalid request: " + err.message);
                return;
            }
            res.writeHead(200);
            res.end();
            console.log("received fields:\n\n " + util.inspect(fields));
            console.log("received files:\n\n " + util.inspect(files));
        });
    } else {
        res.writeHead(404, {"content-type": "text/plain"});
        res.end();
    }
};

https.createServer(opts, handler).listen(2000);
spdy.createServer(optsSpdy, handler).listen(2001);
spdy.createServer(optsH2, handler).listen(2002);
