const express = require('express')
const app = express()

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})

app.get('/app.js', function(req, res) {
  res.sendFile(__dirname + '/app.js')
})

app.listen(3000, function () {
  console.log('Pomodoro app listening on port 3000!')
})
