const express = require('express')
const app = express()
const port = 3000

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})

app.get('/negahban-skeleton.css', function (req, res) {
  res.sendFile(__dirname + '/negahban-skeleton.css')
})

app.get('/client.js', function(req, res) {
  res.sendFile(__dirname + '/client.js')
})

app.get('/favicon.ico', function(req, res) {
  res.sendFile(__dirname + '/favicon.ico')
})

app.get('/front-desk-bells.mp3', function(req, res) {
  res.sendFile(__dirname + '/front-desk-bells-daniel_simon.mp3')
})

app.get('/slow-ticking.mp3', function(req, res) {
  res.sendFile(__dirname + '/slow-ticking.mp3')
})

app.get('/fast-ticking.mp3', function(req, res) {
  res.sendFile(__dirname + '/fast-ticking.mp3')
})

app.get('/heartbeat.mp3', function(req, res) {
  res.sendFile(__dirname + '/heartbeat.mp3')
})

app.get('/rain.mp3', function(req, res) {
  res.sendFile(__dirname + '/rain.mp3')
})

app.get('/ocean.mp3', function(req, res) {
  res.sendFile(__dirname + '/ocean.mp3')
})

app.get('/plus.svg', function(req,res) {
  res.sendFile(__dirname + '/plus.svg')
})

app.get('/minus.svg', function(req,res) {
  res.sendFile(__dirname + '/minus.svg')
})

app.listen(port, function () {
  console.log('Pomodoro app listening on port ' + port)
})
