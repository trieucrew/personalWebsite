const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const chatbot = require('./server/chatbot.js');
const path  = require('path');

const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);


app.use(express.static('app'));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/about', (req,res) => {
  res.sendFile(path.join(__dirname+'/app/views/about.html'));
});

app.get('/views', (req, res) => {
  res.send('hi');
});

server.listen((process.env.PORT || 5000), () => {
  console.log('Server started');
});

io.on('connection', socket => {
  console.log('Connection started');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  
  socket.on('userMsg', async data => {
    let response = await chatbot.response(data);
    socket.emit('chatMsg', response);
  });
});
