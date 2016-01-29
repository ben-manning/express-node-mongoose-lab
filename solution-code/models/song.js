var mongoose = require('mongoose');

var SongSchema = new mongoose.Schema({
  title:           String,
  artist:          String,
  genre:           String,
});

module.exports = mongoose.model('Song', SongSchema);