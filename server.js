const express = require('express')
const app = express()

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})

app.get('/app.js', function(req, res) {
  res.sendFile(__dirname + '/app.js')
})

app.get('/front-desk-bells.mp3', function(req, res) {
  res.sendFile(__dirname + '/front-desk-bells-daniel_simon.mp3')
})

app.listen(3000, function () {
  console.log('Pomodoro app listening on port 3000!')
})
