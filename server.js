const express = require('express')
const app = express()

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})

app.get('/negahban-skeleton.css', function (req, res) {
  res.sendFile(__dirname + '/negahban-skeleton.css')
})

app.get('/app.js', function(req, res) {
  res.sendFile(__dirname + '/app.js')
})

app.get('/front-desk-bells.mp3', function(req, res) {
  res.sendFile(__dirname + '/front-desk-bells-daniel_simon.mp3')
})

app.get('/plus.svg', function(req,res) {
  res.sendFile(__dirname + '/plus.svg')
})

app.get('/minus.svg', function(req,res) {
  res.sendFile(__dirname + '/minus.svg')
})

app.listen(3000, function () {
  console.log('Pomodoro app listening on port 3000!')
})
