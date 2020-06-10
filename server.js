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
// catch(err) {
//     console.log('ERROR', err);
//     response.status(500).send('sorry, we messed up');
// }





//WEATHER
// app.get('/weather', (request, response) => {
//   try {

//     let geoData = require('./data/weather.json')
//     let weatherArray = geoData.data.map(day => {
//       return new Weather(day);
//     })
//     response.status(200).send(weatherArray);

//   } catch (err) {
//     console.log('ERROR', err);
//     response.status(500).send('sorry, we messed up');
//   }

// })

// function Weather(obj) {
//   this.forecast = obj.weather.description;
//   this.time = obj.valid_date;
//   // array.push(this)
// }

app.get('*', (request, response) => {
  response.status(404).send('sorry, this route does not exist');
})

//WEATHER
// app .get('/weather', response) =>{
//   let search_query
// }

function Location(searchQuery, obj) {
  this.search_query = searchQuery;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

// turn on the lights - move into the house - start the server
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});

