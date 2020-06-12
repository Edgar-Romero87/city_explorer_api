'use strict';

const superagent = require('superagent'); //Import superagent-connect us to get data from APIs

const express = require('express'); //Import express-this is our server
const app = express();

const cors = require('cors');//Bodyguard splitting things one to other
const pg = require('pg');
app.use(cors());

require('dotenv').config(); //Import and configure the .env file

// bring in the PORT by using process.env.variable name
const PORT = process.env.PORT || 3001;

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));//

app.get('/location', locationHandler);
app.get('/movies', moviesHandler);
// app.get('/yelp', yelpHandler);
/////LOCATION
// app.get('/location', (request, response) => {

//   try {
//     let city = request.query.city;
//     let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEO_DATA_API_KEY}&q=${city}&format=json`;
//     let safeValue = [city];
//     let sqlQuery = 'SELECT * FROM locations WHERE search_query LIKE ($1);';

//     //query the database to see if the city is already there
//     client.query(sqlQuery, safeValue)
//       .then(sqlResults => {
//         console.log(city)
//         if (sqlResults.rowCount !== 0) {
//           console.log('I found the city in the database! Sending to the front end');
//           response.status(200).send(sqlResults.rows[0]);
//         } else {
//           superagent.get(url)
//             .then(resultsFromSuperAgent => {
//               console.log('api route', resultsFromSuperAgent.body)
//               let finalObj = new Location(city, resultsFromSuperAgent.body[0]);
//               response.status(200).send(finalObj);
//               console.log(Location);
//               let sqlQuery = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);';
//               console.log('im here');
//               let safeValue = [finalObj.search_query, finalObj.formatted_query, finalObj.latitude, finalObj.longitude];
//               client.query(sqlQuery, safeValue)
//                 .then(()=>{})
//             })
//             .catch(err => console.log(err))
//         }
//       })
//   } catch (err) {
//     console.log('Error', err);
//     response.status(500).send('your call cannot be completed at this time');
//   }
// })


///////LOCATION REFACTORED//////
function locationHandler(request,response){
  let city = request.query.city;
  let url = 'http://us1.locationiq.com/v1/search.php';
  // let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEO_DATA_API_KEY}&q=${city}&format=json`;

  const queryParams = {
    key: process.env.GEO_DATA_API_KEY,
    q: city,
    format: 'json',
    limit: 1
  }
  superagent.get(url)
    .query(queryParams)
    .then(data => {
      console.log('results from superagent', data.body)
      const geoData = data.body[0]; //we are taking the first one...
      const location = new Location(city, geoData);

      response.status(200).send(location);
    }).catch()

}

function Location(searchQuery, obj){
  this.search_query = searchQuery;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

/////////MOVIES//////
function moviesHandler(request, response){
  let city = request.query.search_query;
  let moviesURL = 'https://api.themoviedb.org/3/search/movie';
  // let url = 'https://api.themoviedb.org/3/movie/550?api_key=452fb2a236b62653e48a2e2280fdde82'

  const queryParams = {
    api_key: process.env.MOVIE_API_KEY,
    query: city,
    // format: 'json',
    limit: 5,
  }
  superagent.get(moviesURL)
    .query (queryParams)
    .then(data => {
      let moviesArray = data.body.results.map(value => new Movies(value));

      response.status(200).send(moviesArray);
    }).catch(err=> console.log(err))

}

function Movies(obj){
  this.title = obj.title;
  this.overview = obj.overview;
  this.average_votes = obj.average_votes;
  this.total_votes = obj.total_votes;
  this.image_url = `https://image.tmdb.org/t/p/w500/${obj.poster_path}`;
  this.popularity = obj.popularity;
  this.released_on = obj.released_on;
}


/////YELP////
// function yelpHandler(request, response) {
//   console.log('this is pur yelp route', request.query);

//   const page = request.query.page;
//   const numPerPage = 5
//   const start = (number -1) * numPerPage; //this allows us to start with the 1-5 and then 5-10, and then 10-15...  etc...etc

//   const url = '';

//   const queryParams = {
//     lat : query.query.latitude,
//     star: start,
//     count: numPerPage,
//     lng: request.query.longitude
//   }

//   superagent.get(url)
//     .set('user-key', process.env."YELP KEY")
//     .query(queryParams)
//     .then(data => {
//       console.log('data from superagent', data.body);

//       const yelpArray = data.body.restaurants;

//       const finalRestaurants = yelpArray.map(eatery => {
//         return new Restaurant(eatery);
//       })
//     })

// };



//WEATHER
app.get('/weather', (request, response) => {
  let search_query = request.query.search_query;
  // console.log('stuff I got from the front end on the weather route', search_query);

  let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${search_query}&key=${process.env.WEATHER_API_KEY}`;

  superagent.get(url)
    .then(resultsFromSuperAgent => {
      let weatherResult = resultsFromSuperAgent.body.data.map(day =>{
        return new Weather(day);

      })
      response.status(200).send(weatherResult);
    }).catch(err => console.log(err));
})


function Weather(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.valid_date;
  // array.push(this)
}


//HIKING

app.get('/trails', (request,response) => {
  try{

    let latitude = request.query.latitude;
    let longitude = request.query.longitude;

    let url = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=10&key=${process.env.TRAIL_API_KEY}`;

    superagent.get(url)
      .then(resultsFromSuperAgent => {
        let hikingResults = resultsFromSuperAgent.body.trails.map(hike => {
          return new Hiking(hike);
        })
        console.log(hikingResults)
        response.status(200).send(hikingResults);
      }).catch(err=> console.log(err))
  } catch(err) {
    console.log(err);
    response.status(500).send('Sorry, somethimg went wrong');
  }
})

function Hiking(obj) {
  this.name=obj.name;
  this.location=obj.location;
  this.length=obj.length;
  this.stars=obj.stars;
  this.star_votes=obj.starVotes;
  this.summary=obj.summary;
  this.trail_url=obj.url;
  this.conditions=`${obj.conditionDetails || ''} ${obj.conditionStatus}`;
  this.conditions_date=obj.conditionDate.slice(0,obj.conditionDate.indexOf(' '));
  this.conditions_time=obj.conditionDate.slice(obj.conditionDate.indexOf(' ')+1,obj.conditionDate.length);
}


// app.get('*', (request, response) => {
//   response.status(404).send('sorry, this route does not exist');
// })
function handleNotFound(request, response){
  response.status(404).send('this route does not exist');
}


// turn on the lights - move into the house - start the server
client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`listening on ${PORT}`);
    })
  })
