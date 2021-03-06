var path = require('path');
var express = require('express');
var app = express();
app.set('view engine', 'ejs');
app.use('/public', express.static(path.join(__dirname, '/public')));
app.set('views', path.join(__dirname, 'views'));


var expressValidator = require('express-validator');
app.use(expressValidator());

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var methodOverride = require('method-override');
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method;
        delete req.body._method;
        return method
    }
}));

var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');
app.use(cookieParser('btwse'));
app.use(session({
    secret: 'btwse',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 60000}
}));
app.use(flash());

var index = require('./index');
var dbInterface = require('./dbInterface');
app.use('/', index);
app.use('/dbInterface', dbInterface)

var port = process.env.PORT;
if (port === undefined)
  port = 4000;
app.listen(port, function () {
    console.log('Server running on http://localhost:' + port)
});

const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

client.connect();

app.get('/getEntries', function (req, res) {
  var results = client.query(`select * from entries where '${req.query.str}' LIKE expression;`)
  res.send({"results" : results});
});

app.get('/newEntry', function (req, res) {
  var query = "INSERT INTO entries (count, expression) VALUES (1, '" + req.query.str + "') ON CONFLICT (expression) DO UPDATE SET count = EXCLUDED.count + 1;";
  var results = client.query(query);
  res.send('value inserted. ' + results);
});