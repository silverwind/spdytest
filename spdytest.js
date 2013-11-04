"use strict";

var srv          = require('spdy'),
    fs           = require("fs"),
    util         = require('util'),
    multiparty   = require('multiparty');

var options = {
    key              : fs.readFileSync("key.pem"),
    cert             : fs.readFileSync("cert.pem"),
    windowSize       : 1024,
    honorCipherOrder : true,
    ciphers          : "AES128-GCM-SHA256:!RC4:!MD5:!aNULL:!NULL:!EDH:HIGH",
    secureProtocol   : "SSLv23_server_method"
};

var server = srv.createServer(options, function (req, res) {
    if (req.url === '/') {
        res.writeHead(200, {'content-type': 'text/html'});
        res.end(fs.readFileSync("page.html"));
    } else if (req.url === '/upload') {
        var form = new multiparty.Form();

        form.parse(req, function (err, fields, files) {
            if (err) {
                res.writeHead(400, {'content-type': 'text/plain'});
                res.end("invalid request: " + err.message);
                return;
            }
            res.writeHead(200, {'content-type': 'text/plain'});
            res.write('received fields:\n\n ' + util.inspect(fields));
            res.write('\n\n');
            res.end('received files:\n\n ' + util.inspect(files));
        });
    } else {
        res.writeHead(404, {'content-type': 'text/plain'});
        res.end('404');
    }
});
server.listen(443, function () {
    console.info('listening on http://localhost:' + 443 + '/');
});