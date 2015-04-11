## When smtp server receive email, post the content of email to specified http api instantly in multipart/form-data format . ##

### install dependency: ###
  1. npm install mailparser multiparter formidable weibo node-uuid connect redis
  1. iconv 需要在不同平台上重新编译--准备去掉此依赖(mailparser)


### run the smtp server(bind 25 port default): ###
  1. cd ~/mail2http
  1. haraka -c .

### run the http api server: ###
  1. cd ~/mail2http/test/
  1. node upload-server.js

### send test email: ###
ruby ~/mail2http/test/test\_send.rb


## the http api will receive all email content in multipart/form-data format : ##
  1. from : Array
  1. to : Array
  1. subject : String
  1. html  : String , html body if any.
  1. text : String , text body if any.
  1. attachment0 : attachment file
  1. attachment1
  1. attachment2
  1. attachmentN...

### Project tested on mac and ubuntu 11 server. ###


### see config/plugins ###
### plugins/mail2weibo.js is a plugin, which can  publish email to sina weibo. ###