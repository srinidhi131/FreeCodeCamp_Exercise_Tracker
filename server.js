const express = require('express')
const app = express()
const cors = require('cors');
var bodyParser = require("body-parser");
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

mongoose = require("mongoose");
const { Schema } = mongoose;

mongoose.connect(process.env.MONGO_URI , 
{ useNewUrlParser: true, 
useUnifiedTopology: true
});

let Exercise;

const ExerciseSchema = new Schema({
    username:  { type: String, required: true }, 
    log: [
    { description: String,
      duration : Number,
      date: String}]
  });

Exercise = mongoose.model('Exercise', ExerciseSchema);

app.post("/api/users",async function(req,res){
  Exercise.findOne({username: req.body.username}, async function(err, data) {
    if (err) return console.error(err);
    if(data){
      res.send("Username already taken")
    }
    else{
      var user = new Exercise({username: req.body.username})
  user.save(async function(err, data) {
    if (err) return console.error(err);
    res.json({
      "username":data.username,
      "_id":data._id
      })
    })
  };
});
})

app.get("/api/users",async function(req,res){
  Exercise.find({}, async function(err, data) {
    if (err) return console.error(err);
    var arrayFinal = []
    for (i = 0; i < data.length; i++) {
      arrayFinal.push({
        "username":data[i].username,
        "_id":data[i]._id
      })
    }
    res.json(arrayFinal)
  })
});

app.post("/api/users/:_id/exercises",function(req,res){
  id = (req.params._id)
  description = (req.body.description)
  duration = (req.body.duration)
  var date
  if(String(req.body.date) === ""){
    date = new Date().toString()
  }
  else{
  date = new Date(req.body.date)
  date = String(date)
  }
  date = date.slice(0, 15)
  Exercise.findById({_id : id} , async function(err, data) {
    exerciseRecord = { description : description , duration : duration , date : date}
    data.log.push(exerciseRecord);
    data.save((err, updated) => {
      if(err) return console.log(err);
      res.json({
        "_id":id,
        "username":updated.username,
        "date":date,
        "duration":parseInt(duration),
        "description":description
      })
    })
  });
});

app.get("/api/users/:_id/logs" , function(req,res){
  qFrom = req.query.from
  qTo = req.query.to
  qLimit = req.query.limit
  if(typeof qFrom === 'undefined'){
    qFrom = 0;
  }
  else{
    qFrom = Date.parse(qFrom)
  }
  if(typeof qTo === 'undefined'){
    qTo = new Date();
    qTo = Date.parse(qTo)
  }
  else{
    qTo = Date.parse(qTo)
  }
  Exercise.findById(req.params._id, async function(err, data) {
    if (err) return console.error(err);
    let exercise_log = []
    for (i = 0; i < data.log.length; i++) {
      if(qFrom <= Date.parse(data.log.date) <= qTo){
        exercise_log.push({
          "description":data.log[i].description,
          "duration":parseInt(data.log[i].duration),
          "date":data.log[i].date
        })
    }}
    if(typeof qLimit !== 'undefined'){
      exercise_log = exercise_log.slice(0 , qLimit)
      res.json({
      log : exercise_log
    })}
    else{
    res.json({
      id : data._id,
      username : data.username,
      count : parseInt(data.log.length),
      log : exercise_log
    })}
  })
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
