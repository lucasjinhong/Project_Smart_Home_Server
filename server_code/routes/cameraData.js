var express = require('express');
var path = require('path');
var router = express.Router();
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var urlencodedParser = bodyParser.urlencoded({limit: '50mb', extended: true});

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

router.post('/',urlencodedParser, (req, res, next) => {
  response = 
  {  
      value:req.body.value,
      date:req.body.time,
      img:req.body.imgBase64
  };

  res.send(response); 
 
  MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("Project_Smart_Home");
      var myobj = [{time: new Date(), records:response.value, image:response.img}];
      dbo.collection("data").insertMany(myobj, function(err, res) {
        if (err) throw err;
        console.log(res, '\n' , {value:response.value}, '\n');
        db.close();
      });
  });
})

router.get('/data', function(req, res, next){

  var number = req.query.number
  console.log(Number(number))

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Project_Smart_Home");

        var mysort = { time: -1 };
        var query = {};
        var projection = {image:0};

        dbo.collection("data").find(query).project(projection).sort(mysort).limit(Number(number)).toArray(function(err, result) {

          if (err) throw err;
          db.close();
          console.log('\nResult sent');
          res.send({result:result});
        });
    });
});

router.get(('/image'), function(req, res, next){

  var id = req.query.id
  console.log(id)

  MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("Project_Smart_Home");

      var query = {_id: mongo.ObjectId(id)};
      var projection = {_id:0, image:1};

      dbo.collection("data").find(query).project(projection).toArray(function(err, result) {

        if (err) throw err;
        db.close();
        console.log('\nResult sent');
        res.send(result[0]);
      });
  });
});

module.exports = router;