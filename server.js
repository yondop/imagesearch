const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const Search = require('bing.search');
const search = new Search(require('./config'));

const port = process.env.PORT || 3000;
const NUMBER = 10;
const DB_URL = 'mongodb://admin:admin@ds161315.mlab.com:61315/imagesearch-yo';

MongoClient.connect(DB_URL, (err, db) => {
  if (err) throw err;
  const searches = db.collection('searches');

  app.get('/search/:term', (req, res) => {
    const offset = req.query.offset || 0;
    const {term} = req.params;
    search.images(term, { top: NUMBER, skip: (offset * NUMBER) }, (err, results) => {
      searches.count({}, (err, count) => {
        searches.insertOne({
          query: term,
          index: count,
          date: new Date()
        });
        res.json(results);
      });
    });
  });

  app.get('/recent', (req, res) => {
    searches
      .find({})
      .sort({
        index: -1
      }).toArray((err, items) => {
        if (err) return res.json({error: 'Error'});
        res.json(items.slice(0, 10));
      })
  });

  app.listen(port);
});
