## IMDB Top 1000 Movies Node Search API 

This project crawls the top 1000 IMDB movies and exposes a simple API searching the names of the director and actors associated with each movie.

To run:
```
npm install
npm start
```
Service will run at http://localhost:3000/imdb

Example query: http://localhost:3000/imdb?search=spielberg

Demo app: https://carina-imdb.herokuapp.com/imdb?search=spielberg

Assumptions
* The service exposes search for only the director and actor names for each movie.
* Does not search for words in the movie title
* Assumes IMDB list page url, structure, and class selectors do not change
* Assumes IMDB lists 20 pages of top 100 movies, 50 movies per page

Future work
* Tests
* Memory. The searchTerms table should be much smaller by referencing movies by ID rather than the full title string.
* Features. Search on more data fields including title. Other possibilities: genre, plot keywords. Expose more data for each movie.
* Error handling. Handle potential network errors or throttling issues in crawl.
* Caching. Store results for common search queries. 
* Consider another language. Is Node appropriate here at scale?
