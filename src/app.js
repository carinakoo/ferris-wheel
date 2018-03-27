/*
 * Ferris Wheel
 * IMDB Top 1000 Movies Search 
 * ----------------------------
 * This script sets up the API that returns the associated movie names
 * with a given search term.
 * 
 * It performs the following steps:
 *   1. Read in the `searchTerms` data structure from json file
 *   2. Set up API endpoint at '/imdb' 
 *   3. On receiving a request, gets results for each word in the search query
 *      and returns the intersection of the results
 */

const express = require('express');
const fs = require('fs');
const intersection = require('lodash/intersection');

// Read in search terms
const json = fs.readFileSync('searchTerms.json');
const searchTerms = JSON.parse(json);

// Create express http server
const app = express();
app.listen(process.env.PORT || 3000, () => console.log('listening'));

// Get movie title arrays for each word in search query
// Return intersection of movie titles
function getSearchResults(query) {
  const results = query.split(' ').map(word => searchTerms[word]);
  return intersection(...results);
}

// Accepts GET requests at / endpoint
app.get('/imdb', (req, res) => {
  const { query: { search } } = req;
  if (search) {
    const result = getSearchResults(search);
    res.status(200).json(result);
  } else {
    res.status(200).send('IMDB Top 1000 Movies Search');
  }
});

// TEST
// console.log(getSearchResults('spielberg'));
// console.log(getSearchResults('hanks spielberg'));
