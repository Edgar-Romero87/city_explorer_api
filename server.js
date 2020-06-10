

/* eslint-disable no-undef */
'use strict';
// express library sets up our server
const express = require('express');

// initalizes our express library into our variable called app
const app = express();

//SuperAgent
const superagent = require('superagent');

// dotenv lets us get our secrets from our .env file
require('dotenv').config();

// bodyguard of our server - tells who is ok to send data to
const cors = require('cors');
app.use(cors());

// bring in the PORT by using process.env.variable name
const PORT = process.env.PORT || 3001;


//LOCATION
app.get('/location', (request, response) => {
  let city = request.query.city;
  let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEO_DATA_API_KEY}&q=${city}&format=json`;

  superagent.get(url)
    .then(resultsFromSuperAgent => {
      let finalObj = new Location(city, resultsFromSuperAgent.body[0]);

      response.status(200).send(finalObj);
    })

})

function Location(searchQuery, obj){
  this.search_query = searchQuery;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}
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


app.get('*', (request, response) => {
  response.status(404).send('sorry, this route does not exist');
})


// turn on the lights - move into the house - start the server
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});