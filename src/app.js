/**
* NextTram - TramTracker Pebble app
* Not affiliated with Yarra Trams who are nice
* Colin Jacobs, colin@coljac.net
* 27/9/2014
* v0.1
**/

var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
var Settings = require('settings');

// var minutes = [];
var baseURL = 'http://www.tramtracker.com/Controllers/GetNextPredictionsForStop.ashx';

// var initialized = false;
var views = [];
var totalViews = 1;

function initSettings() {
  if(Settings.option("number")) {
     totalViews = parseInt(Settings.option("number"));
  }
  for(var i=1; i<=4; i++) {
    console.log(i + ": " + Settings.option("route" + i));    
  }  
}

Settings.config(
  { url: 'http://coljac.net/ttconfig.html',
   autosave: true },
  function(e) {
    console.log('Config the other way called.');
    console.log(Settings.option('route1'));
  },
  function(e) {
    console.log('closed configurable this way.');
  }
);

var main = new UI.Card({
  title:'Next Tram',
  subtitle:'Fetching tram data...',
});
main.show();

main.on('click', 'select', function(e) {
  console.log("Select on main - refetch");
  main.subtitle('Refreshing...');
  fetchData();
});

var currentView = 0;



function makeWindow(stop, route, mins) {
 var wind = new UI.Window();
 var textfield1 = new UI.Text({
    position: new Vector2(0, 10),
    size: new Vector2(144, 30),
    font: 'gothic-24-bold',
    text: 'Stop: '+ stop,
    textAlign: 'center'
  });
  var textfield2 = new UI.Text({
    position: new Vector2(0, 40),
    size: new Vector2(144, 30),
    font: 'gothic-24-bold',
    text: 'Route: ' + route,
    textAlign: 'center'
  });
  var textfield3 = new UI.Text({
    position: new Vector2(0, 80),
    size: new Vector2(144, 60),
    font: 'bitham-42-bold',
    text: mins+' m',
    textAlign: 'center'
  });  
  wind.add(textfield1);
  wind.add(textfield2);
  wind.add(textfield3); 
  
  wind.on('click', 'up', function(e) {
    console.log("up from " + currentView);
    if(currentView > 1) {
     currentView--;
      views[currentView].show(); 
    }
  });
          
  wind.on('click', 'down', function(e) {
    console.log("down from " + currentView);
    if(currentView < totalViews) {
      currentView++;
      views[currentView].show();
    }
  });
    
  return wind; // wind.show();
}

function fetchData() {
  for(var i=1; i<=totalViews; i++) {
    if(Settings.option('route' + i)) {
       doAjax(i, Settings.option('stop'+i), Settings.option('route'+i));
    }
  }
}

function doAjax(num, stop, route) {
  // Make the request
  ajax(
    {
      url: baseURL + "?stopNo=" + stop + "&routeNo=" + route + "&isLowFloor=false",
      type: 'json'
    },
    function(data) {
      // Success!
      console.log('Successfully fetched tram data - ' + data);
      // Extract data
      var nextTime = data.responseObject[0].PredictedArrivalDateTime;
      console.log(nextTime);
      var millis = nextTime.slice(6,19);
      //var nowMillis = new Date().getTime();
      var millisUntil = millis - new Date().getTime();
      var minutesUntil = Math.floor(millisUntil/60000);
      console.log("Mins: " + minutesUntil);
//       minutes[num] = minutesUntil;
      views[num] = makeWindow(stop, route, minutesUntil);
      if(num == 1) {
        currentView = 1;
        views[1].show();
        main.subtitle('Data OK.');
        main.body('Press select to refresh.');
      }
    },
    function(error) {
      // Failure!
      console.log('Failed fetching tram data: ' + error);
      main.subtitle('Problem with tram data.');
      main.body('Press select to try again.');
    }
  );
}

initSettings();
fetchData();