var console = require('console'),
    request = require('request'),
    fs = require('fs'),
    MailParser = require("mailparser").MailParser, 
    mailparser = new MailParser({
        //streamAttachments : true
    });

var postURL;
exports.register = function () {
    postURL = this.config.get('mail2http.url');
};

/*
attachment event only fired once??!!
mailparser.on("attachment", function(attachment){
    attachment.stream.pipe(fs.createWriteStream(process.cwd() + "/attachments/" + attachment.fileName ));
});
*/

var rawMailData;
function post(mail){
    var message = {
        uri: postURL, 
        method: "POST", 
        headers: {'content-type':'application/json', 'accept':'application/json'},
        body: JSON.stringify({
            rawMailData:rawMailData,//这里先把邮件原始内容以文本形式post过去.后续再直接把attachments以multipart/form-data文件流格式直接post过去
            to:mail.to,
            from:mail.from,
            subject:mail.subject,
            html:mail.html,
            text:mail.text
        })
    };
    request(message, function(err, resp, body) {
      console.log(err, resp, body);
    });
}

mailparser.on("end", function(mail){ 
    console.log("From:", mail.from); 
    console.log("to:", mail.to);
    console.log("Subject:", mail.subject); 
    console.log("Text body:", mail.text); 
    console.log("html body:", mail.html);  
    console.log("attachments:", mail.attachments); 
    mail.attachments.forEach(function(attachment,i){
        fs.writeFile(process.cwd() + "/attachments/" + attachment.fileName, attachment.content, function (err) {
          console.log( attachment.fileName + ' is saved!');
        });
    });
    
    post(mail);
});

exports.hook_data_post = function (next, connection) {
    next();
    rawMailData = connection.transaction.data_lines.join('');
    mailparser.write(rawMailData);
    mailparser.end();
};