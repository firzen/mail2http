var console     = require('console'),
    fs          = require("fs"),
    http        = require("http"),
    multiparter = require("multiparter"),
    MailParser  = require("mailparser").MailParser;
    

var postURL;
exports.register = function () {
    postURL = this.config.get('mail2http.url');
};
exports.hook_data_post = function (next, connection) {
    next();
    parseMail(connection.transaction.data_lines.join(''));
};

function parseMail(data){
    var mailparser  = new MailParser({
        streamAttachments : true
    });

    mailparser.on("attachment", function(attachment){
        attachment.stream.pipe(fs.createWriteStream(process.cwd() + "/attachments/" + attachment.fileName ));
    });

    mailparser.on("end", function(mail){ 
        postMail2HTTP(mail);
    });

    mailparser.write(data);
    mailparser.end();
    mailparser = null;
}

function postMail2HTTP(oMail){
    var host = postURL.split('http://')[1].split(':')[0], port = postURL.split('http://')[1].split(':')[1]
    var request = new multiparter.request(http, {
        host: host,
        port: port,
        path: "/upload",
        method: "POST"
    });

    var attachments = oMail.attachments;
    delete oMail.headers;
    delete oMail.attachments;


    for(var k in oMail){
        request.setParam(k, typeof oMail[k] === 'string' ? oMail[k] : JSON.stringify(oMail[k]));
    }

    var files = [];
    attachments.forEach(function(attachment,i){
        var path = process.cwd() + "/attachments/" + attachment.fileName;
        request.addStream(
            "attachment" + i,
            attachment.fileName,
            attachment.contentType,
            attachment.length,
            fs.createReadStream(path)
        );
        files.push(path);
    });

    request.send(function(error, response) {
        if(response.statusCode === 200){
            files.forEach(function(path,i){
                fs.unlink(path, function (err) {
                    console.log('successfully deleted ',path);
                });
            });
        }
    });
}
