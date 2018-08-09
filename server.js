const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(express.static('static'));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/views', (req, res) => {
  res.send('hi');
});

app.listen((process.env.PORT || 5000), () => {
  console.log('Server started');
});
