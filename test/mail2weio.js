var weibo = require('weibo');
var uuid = require('node-uuid');
var connect = require('connect');
var console = require('console');
var tapi = weibo.tapi;

weibo.init('weibo', '1869125062', 'd128d7a473c7a06ba0b84284a24c7924');
//tapi.init('tsina', '1869125062', 'd128d7a473c7a06ba0b84284a24c7924');

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

app.use('/', function(req, res, next) {
  var user = req.session.oauthUser;
  res.writeHeader(200, { 'Content-Type': 'text/html' });
  if (!user) {
    res.end('<a href="/login?type=weibo">Login</a> first, please.');
    return;
  }
  console.log(user);
  
  user = {
      blogtype:           'tsina',
      blogType:           'tsina',
      authtype:           'oauth' ,
      screen_name:          user.screen_name,
      oauth_token_key:      user.oauth_token_key,
      oauth_verifier:       user.oauth_verifier,
      oauth_token_secret:   user.oauth_token_secret
      
  }

  tapi.verify_credentials(user, function(error, t_user) {
    if(error)
        console.log('err:'+ JSON.stringify(error));
     else {
        console.log('user:'+ JSON.stringify(t_user));
     }  
  });

  /*
  //tapi update has a bug(fixed): https://github.com/fengmk2/node-weibo/issues/8
  tapi.update({ user:user, status : '这个bug很恶心'},function(err,data){
    if(err){
      console.log('err:'+JSON.stringify(err));
    }else {
        console.log('update:'+JSON.stringify(data));
    } 
  });
  */
  
  tapi.upload({user:user ,status : 'update api bug fixed'}, './face.jpeg' ,function(err,data){
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