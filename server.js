var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var config = require('./config');
var app = express();

var http = require('http').Server(app);

var io = require('socket.io')(http);

mongoose.connect(config.database,function(err){
   if(err){
       console.log(err);
   } else
   {
       console.log("connected to the database.")
   }
});
// use of bodyParsera
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

// use of morgan
app.use(morgan('dev'));

app.use(express.static(__dirname + '/public'));
// api usage

var api = require('./app/routes/api')(app,express,io);
app.use('/api',api);


app.get('*',function(req, res){
   res.sendFile(__dirname + '/public/app/views/index.html') 
});

http.listen(config.port,function(err){
    if(err){
        console.log(err);   
    }else{
        console.log("app listning to port 3000.")
    }
})