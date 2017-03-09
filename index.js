/**
 * Created by Muc on 17/3/7.
 */
var https=require('https');

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var config = require('./config');
var routes = require('./routes');

var app = express();

// mongoose
mongoose.Promise = Promise;
mongoose.connect(config.mongodb);


// 设置模板目录
app.set('views', __dirname + '/views');
// 设置模板引擎为 ejs
app.set('view engine', 'ejs');
// 静态文件目录
app.use(express.static(__dirname + '/public'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


//会话管理
app.use(session({
    name: config.session.key,// 设置 cookie 中保存 session id 的字段名称
    secret: config.session.secret,// 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
    cookie: {
        maxAge: config.session.maxAge// 过期时间，过期后 cookie 中的 session id 自动删除
    },
    store: new MongoStore({// 将 session 存储到 mongodb
        url: config.mongodb// mongodb 地址
    })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

// passport config
const User = require('./models/account');
//本地用户名密码登录策略
passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            if (user.password!=password) { return done(null, false); }
            return done(null, user);
        });
    }
));
//OAuth2登录策略
passport.use('provider', new OAuth2Strategy({
        authorizationURL: 'https://openapi.baidu.com/oauth/2.0/authorize',
        tokenURL: 'https://openapi.baidu.com/oauth/2.0/token',
        clientID: 'hYbfrcvBgoNNRtoWreBIreMP',
        clientSecret: '7EWIC51AKroAEWFhbEOxvziHa4bYAWTw',
        callbackURL: '/auth/provider/callback'
    },
    function(accessToken, refreshToken, profile, done) {
        https.get("https://openapi.baidu.com/rest/2.0/passport/users/getInfo?access_token="+accessToken,function (req,res) {
            var html='';
            req.on('data',function(data){
                html+=data;
            });
            req.on('end',function(){
                html=JSON.parse(html);
                var user={
                    username: html.username,
                };
                https.get("https://openapi.baidu.com/rest/2.0/passport/auth/revokeAuthorization?access_token="+accessToken);
                User.findOne(user, function(err, item) {
                    if(item) return done(err, item);
                    User.create(user,function (err,user) {
                        done(err, user);
                    });
                });
            });
        });
    }
));
// passport.serializeUser(function(user, done) {
//     done(null, user);
// });
//
// passport.deserializeUser(function(user, done) {
//     User.findOne({ username: user.username }, function (err, user) {
//         done(err, user);
//     });
// });
passport.serializeUser(function(user, done) {
    done(null, user._id);
});
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user); });
});


// 监听端口，启动程序
app.listen(config.port, function () {
    console.log(`listening on port ${config.port}`);
});
