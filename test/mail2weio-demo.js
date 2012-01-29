var weibo = require('weibo');
var uuid = require('node-uuid');
var connect = require('connect');
var tapi = weibo.tapi;

weibo.init('weibo', '1869125062', 'd128d7a473c7a06ba0b84284a24c7924');


var app = connect(
  connect.query(),
  connect.cookieParser(),
  connect.session({ secret: uuid.v4()}),
  // using weibo.oauth middleware for use login
  // will auto save user in req.session.oauthUser
  weibo.oauth({
    login_path: '/login',
    logout_path: '/logout',
    blogtype_field: 'type'
  }),
  connect.errorHandler({ stack: true, dump: true })
);

var flag = false;

app.use('/', function(req, res, next) {
  var user = req.session.oauthUser;
  res.writeHeader(200, { 'Content-Type': 'text/html' });
  if (!user) {
    res.end('<a href="/login?type=weibo">Login</a> first, please.');
    return;
  }
  
  tapi.upload({user:user ,status : 'by nodejs ,too '}, './face.jpeg' ,function(err,data){
     if(err){
       console.log('err:'+ JSON.stringify(err));
     }else {
        console.log('img uploaded :'+ data.t_url);
     }  
  });


  res.end('Hello, <a href="' + user.t_url + 
    '" target="_blank">@' + user.screen_name + '</a>. ' + 
    '<a href="/logout">Logout</a>');
});



app.listen(8080);