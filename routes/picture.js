var express = require('express');
var Flickr = require('node-flickr');
var request = require('request');
var fs = require('fs');
var del = require('del');

var router = express.Router();
var keys = { api_key: process.env.FLICKR_KEY };
var flickr = new Flickr(keys);
var flickUrl = '';

router.get('/:noun', function (req, res, next) {
  flickr.get('photos.search', { tags: req.params.noun }, function (err, response) {
    if (err) return console.error(err);

    var photos = response.photos;
    var length = Number(photos.total) > 100 ? 100 : Number(photos.total);
    var selectedIndex = getRandomInt(1, length);
    var photo = photos.photo[selectedIndex];

    flickr.get('photos.getInfo', { photo_id: photo.id }, function (err, photoInfo) {
      var url = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`;
      var filename = '/tmp/' + photo.id + '.jpg';

      request.head(url, function (err, response, body) {
        request(url).pipe(fs.createWriteStream(filename)).on('close', function () {
          res.sendFile(filename);
          del(filename);
        });

      });
    });
  });
});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = router;
