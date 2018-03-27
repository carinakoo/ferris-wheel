/*
 * Ferris Wheel 
 * IMDB Top 1000 Movies Crawler 
 * ----------------------------
 * This script crawls the top 1000 movies listed on IMDB at this url: 
 * http://imdb.com/search/title?groups=top_1000&sort=user_rating&view=simple&page=1
 * 
 * The process is split into the following steps:
 *   1. Scrape individual movie urls from each of 20 Top 1000 list pages
 *   2. Scrape movie titel, director and actor names from each of the 1000 movie pages
 *   3. Store arrays of movie titles associated with each of the actor and
 *      director names into a `searchTerms` object
 *   4. Write the `searchTerms` object to a json file names `searchTerms.json`
 * 
 * 
 * Sample of `searchTerms.json`
 * ---------------------------- 
 *   {
 *     "liam": [
 *        "Schindler's List",
 *        "Love Actually",
 *        "Ponyo",
 *        "Taken",
 *        "A Little Princess"
 *    ],
 *    "neeson": [
 *        "Schindler's List",
 *        "Love Actually",
 *        "Ponyo",
 *        "Taken"
 *    ],
 *  }
 * 
 */

const cheerio = require('cheerio');
const request = require('request-promise-native');
const fs = require('fs');
const range = require('lodash/range');

const searchTerms = {};

// store names, movie titles to searchTerms
function addNamesToSearchTerms(names, title) {
  names.forEach(name => {
    name.split(' ').forEach(word => {
      const lower = word.toLowerCase();
      if (searchTerms[lower]) {
        searchTerms[lower].push(title);
      } else {
        searchTerms[lower] = [title];
      }
    });
  });
}

// scrapes individual movie pages, stores names to searchTerms
async function scrapeOneMovie(url) {
  const moviePageUrl = await request(`http://www.imdb.com/${url}`);
  console.log(`fetched ${url}`);

  // load html into cheerio, provides a jQuery-like object
  $ = cheerio.load(moviePageUrl);

  const movieTitle = $('title')
    .text()
    .match(/^(.+)\s\(\d{4}\).+$/)[1];
  const director = $('span[itemprop=director] span[itemprop=name]').text();
  const actors = $('span[itemprop=actors] span[itemprop=name]')
    .map((i, elem) => $(elem).text())
    .get();

  // merge names into one list
  const peopleNames = [].concat(actors, [director]);
  addNamesToSearchTerms(peopleNames, movieTitle);
}

// scrapes one list page, returns array of movie urls
async function crawlListPage(pageNumber) {
  const listPageUrl = `http://www.imdb.com/search/title?groups=top_1000&sort=user_rating&view=simple&page=${pageNumber}`;
  const listPageHtml = await request(listPageUrl);

  // load html into cheerio, provides a jQuery-like object
  const $ = cheerio.load(listPageHtml);

  // collect movie urls
  const movieUrls = $('.lister-item-header a')
    .map((i, elem) => $(elem).attr('href'))
    .get();
  return movieUrls;
}

function crawl() {
  // crawl Top 1000 list pages
  // collect arrays of movie urls -- one array for each list page
  const listPageCrawlResults = range(1, 20).map(crawlListPage);

  Promise.all(listPageCrawlResults)
    // 20 arrays of movie page urls
    .then(urlLists => {
      // merge 20 arrays into one
      const movieUrls = [].concat(...urlLists);
      // map movie page urls to scrapeOneMovie function
      return Promise.all(movieUrls.map(scrapeOneMovie));
    })
    // now we have an array of promises, one for each movie page
    // promises resolve when page has been scraped into the searchTerms object
    .then(() => {
      // write searchTerms to json file
      const json = JSON.stringify(searchTerms, null, 4);
      fs.writeFile('searchTerms.json', json, () => {
        console.log('Crawl results written to searchTerms.json.');
      });
    });
}

crawl();
