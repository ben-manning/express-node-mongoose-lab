# Song App Solution Notes

###Create a new app using the Express Generator

`express songsapp -e`

###Create some Routes

```javascript
//app.js
var songs = require('./routes/songs');
...

app.use('/songs', songs);
```

### Basic CRUD Routes


```javascript
// create routes/songs.js
// here are the REST-ful starter routes
// Test these out using `cURL` or Insomnia

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
  res.send('Songs INDEX');
});

router.get('/new', function(req, res, next){
  res.send('Songs NEW');
});

router.get('/:id', function(req, res, next){
  res.send('Songs SHOW');
});

router.get('/edit/:id', function(req, res, next){
  res.send('Songs EDIT');
});

router.post('/:id', function(req, res, next){
  res.send('Songs POST');
});

router.put('/:id', function(req, res, next){
  res.send('Songs PUT');
});

router.delete('/:id', function(req, res, next){
  res.send('Songs DELETE');
});

module.exports = router;
```


## Add Mongoose to our app

`npm install mongoose --save`

```javascript
// app.js
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/songs-app');
```

## Create a SONG Model
```javascript
// models/song.js

var mongoose = require('mongoose');

var SongSchema = new mongoose.Schema({
  title:           String,
  artist:          String,
  genre:           String,
});
mongoose.model('Song', SongSchema);
```

Go into `mongo` and add a song. You can also try this using `cURL` or Insomnia:

```javascript
// choose and instantiate the songs-app database
use songs-app

// Insert a new song into the database
db.songs.insert({title: "With or Without You", artist: "U2", genre: "rock"})
```

## Let's wire up our database to our routes
### INDEX

Let's update our `GET` route:

```javascript
//routes.js
var Song = require('../models/Song');

router.get('/', function(req, res, next){
  Song.find({}, function(err, songs){
    res.send(songs);    
  })
});
```

Goto `http://localhost:3010/songs` to see your songs array.


### CREATE

Update our POST route

```javascript
router.post('/', function(req, res, next){
  Song.create(req.body.song, function (err, song) {
    if(err){
      res.send("something wrong happened"+ err)
    }else{
      res.redirect('/');
    }
  });
});
```

Create a new song in Insomnia

```javascript
{
    "song": {
        "title": "Hello",
        "artist": "Adele",
        "genre": "rock"
    }
}
```

### SHOW

```javascript
router.get('/:id', function(req, res, next){
  Song.findById( { _id: req.params.id}, function(err, song){
    res.send(song);
  })
});
```

### UPDATE

```javascript
router.put('/:id', function(req, res, next){
  Song.findByIdAndUpdate(req.params.id, {
      artist: req.body.artist,
      title: req.body.title,
      genre: req.body.genre
    }, function(err, song){
      if (err) throw err;
      console.log(song);
    res.redirect('/');
  });
});
```

### DELETE

```javascript
router.delete('/:id', function(req, res, next){
  Song.findByIdAndRemove(req.params.id, function(err, song){
    if (err) throw err;
    console.log('Song successfully deleted!');
    res.redirect('/');
  });
});
```

## Views

Here's some sample code for our `layout.ejs`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Songs App</title>

  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
  <link rel="stylesheet" href="stylesheets/style.css" />
</head>
<body>
  <h1>Songs</h1>

  <div class="container">
    <% include ./partials/songs/form %>
  </div>

  <hr>
  
  <div class="container">
    <% for(var i=0; i< songs.length; i++) {  %>
      <ul>
        <li><strong>Name : </strong> <%= songs[i].artist %></li>  
        <li><strong>Title : </strong> <%= songs[i].title %></li>
        <li><strong>Genre : </strong> <%= songs[i].genre %></li>
      </ul>
    <% } %>
  </div>  

</body>
</html>
```

## Partials
Let's create a partials folder and a form:

`touch views/partials/songs/form.ejs`

```html
<h3>Create Song!</h3>
<fieldset>
  <form method="POST" action="/songs">
    <div class="form-group col-md-4">
      <input name="artist" class="form-control" placeholder="Artist"/>
    </div>
    <div class="form-group col-md-4">
      <input name="title"  class="form-control" placeholder="Title"/>
    </div>
     <div class="form-group col-md-4">
      <input name="genre"  class="form-control" placeholder="Genre"/>
    </div>
    <div class="form-group col-md-4"> 
      <input class="btn btn-primary col-md-12" type="submit" value="Submit">
    </div>
  </form>
</fieldset>
```

## BONUS

1. Get the `edit`, `put`, and `delete` actions working in the views.

2. Try to create a SONGS controller. The controller will contain database query functions that will be called from the routes file. Here's a sample `routes.rb` file for a **Candy** resource:

```javascript
var express = require('express'),
    router = express.Router(),
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST

var candiesController = require('../controllers/candies');

// http://127.0.0.1:3000/candies
router.route('/candies')

  //GET all candies
  .get(candiesController.getAll)

  //POST a new blob
  .post(candiesController.createCandy);


router.route('/candies/:id')

  // GET return specific candy
  .get(candiesController.getCandy)

  // PATCH update existing candy
  .patch(candiesController.updateCandy)

  // DELETE remove specific candy from DB
  .delete(candiesController.removeCandy);


module.exports = router
```

Here's a sample `../controllers/candies.rb` file for a **Candy** resource:

```javascript
var Candy = require('../models/Candy');

// GET
function getAll(request, response) { 
  Candy.find(function(error, candies) {
    if(error) response.json({message: 'Could not find any candy'});

    // response.json({message: candies});
    response.render('layout', {candies: candies});
  });
}

// POST
function createCandy(request, response) {
  console.log('in POST');
  console.log('body:',request.body);
  var candy = new Candy();

  candy.name = request.body.name;
  candy.color = request.body.color;

  candy.save(function(error) {
    if(error) response.json({messsage: 'Could not ceate candy b/c:' + error});

    response.redirect('/candies');
  });  
}

// GET
function getCandy(request, response) {
  var id = request.params.id;

  Candy.findById({_id: id}, function(error, candy) {
    if(error) response.json({message: 'Could not find candy b/c:' + error});

    response.json({candy: candy});
  });
}

function updateCandy(request, response) {
  var id = request.params.id;

  Candy.findById({_id: id}, function(error, candy) {
    if(error) response.json({message: 'Could not find candy b/c:' + error});

    if(request.body.name) candy.name = request.body.name;
    if(request.body.color) candy.color = request.body.color;

    candy.save(function(error) {
      if(error) response.json({messsage: 'Could not update candy b/c:' + error});

      response.json({message: 'Candy successfully updated'});
    });  
  });
}

function removeCandy(request, response) {
  var id = request.params.id;

  Candy.remove({_id: id}, function(error) {
    if(error) response.json({message: 'Could not delete candy b/c:' + error});

    response.json({message: 'Candy successfully deleted'});
  });
}

module.exports = {
  getAll: getAll,
  createCandy: createCandy,
  getCandy: getCandy,
  updateCandy: updateCandy,
  removeCandy: removeCandy
}
```