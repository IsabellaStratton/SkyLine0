/*
     * Date Format 1.2.3
     * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
     * MIT license
     *
     * Includes enhancements by Scott Trenda <scott.trenda.net>
     * and Kris Kowal <cixar.com/~kris.kowal/>
     *
     * Accepts a date, a mask, or a date and a mask.
     * Returns a formatted version of the given date.
     * The date defaults to the current date/time.
     * The mask defaults to dateFormat.masks.default.
     */

    var dateFormat = function () {
        var    token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
            timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
            timezoneClip = /[^-+\dA-Z]/g,
            pad = function (val, len) {
                val = String(val);
                len = len || 2;
                while (val.length < len) val = "0" + val;
                return val;
            };
    
        // Regexes and supporting functions are cached through closure
        return function (date, mask, utc) {
            var dF = dateFormat;
    
            // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
            if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }
    
            // Passing date through Date applies Date.parse, if necessary
            date = date ? new Date(date) : new Date;
            if (isNaN(date)) throw SyntaxError("invalid date");
    
            mask = String(dF.masks[mask] || mask || dF.masks["default"]);
    
            // Allow setting the utc argument via the mask
            if (mask.slice(0, 4) == "UTC:") {
                mask = mask.slice(4);
                utc = true;
            }
    
            var    _ = utc ? "getUTC" : "get",
                d = date[_ + "Date"](),
                D = date[_ + "Day"](),
                m = date[_ + "Month"](),
                y = date[_ + "FullYear"](),
                H = date[_ + "Hours"](),
                M = date[_ + "Minutes"](),
                s = date[_ + "Seconds"](),
                L = date[_ + "Milliseconds"](),
                o = utc ? 0 : date.getTimezoneOffset(),
                flags = {
                    d:    d,
                    dd:   pad(d),
                    ddd:  dF.i18n.dayNames[D],
                    dddd: dF.i18n.dayNames[D + 7],
                    m:    m + 1,
                    mm:   pad(m + 1),
                    mmm:  dF.i18n.monthNames[m],
                    mmmm: dF.i18n.monthNames[m + 12],
                    yy:   String(y).slice(2),
                    yyyy: y,
                    h:    H % 12 || 12,
                    hh:   pad(H % 12 || 12),
                    H:    H,
                    HH:   pad(H),
                    M:    M,
                    MM:   pad(M),
                    s:    s,
                    ss:   pad(s),
                    l:    pad(L, 3),
                    L:    pad(L > 99 ? Math.round(L / 10) : L),
                    t:    H < 12 ? "a"  : "p",
                    tt:   H < 12 ? "am" : "pm",
                    T:    H < 12 ? "A"  : "P",
                    TT:   H < 12 ? "AM" : "PM",
                    Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                    o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                    S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
                };
    
            return mask.replace(token, function ($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        };
    }();
    
    // Some common format strings
    dateFormat.masks = {
        "default":      "ddd mmm dd yyyy HH:MM:ss",
        shortDate:      "m/d/yy",
        mediumDate:     "mmm d, yyyy",
        longDate:       "mmmm d, yyyy",
        fullDate:       "dddd, mmmm d, yyyy",
        shortTime:      "h:MM TT",
        mediumTime:     "h:MM:ss TT",
        longTime:       "h:MM:ss TT Z",
        isoDate:        "yyyy-mm-dd",
        isoTime:        "HH:MM:ss",
        isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
    };
    
    // Internationalization strings
    dateFormat.i18n = {
        dayNames: [
            "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ],
        monthNames: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
            "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
        ]
    };
    
    // For convenience...
    Date.prototype.format = function (mask, utc) {
        return dateFormat(this, mask, utc);
    };

$(document).ready(function() {
  createOverlay();
  getLocalWeather();
  $('.temp-format-control').on('click', toggleTempFormat);
});

  var API_KEY = "9571edaa015e45ec33a1d35e4b5977a3";
  var apiURL = "https://api.forecast.io/forecast/";
  var callbackFunction = "callback=weatherDataCallback";
  var currentTime = new Date();
  var weatherData = {};
  var locationData;
  var tempFormat;


function getLocalWeather() {
    $.getJSON('http://ip-api.com/json', function(data) {
      locationData = data;
      getWeatherDataFromLatLon(data.lat, data.lon);
    });
}

function getWeatherDataFromLatLon(lat, lon) {
  var queryURL = apiURL + API_KEY + "/" + lat + "," + lon;
  $.ajax({
    url: queryURL,
 
    // The name of the callback parameter
    jsonp: "callback",
 
    // Tell jQuery we're expecting JSONP
    dataType: "jsonp",
    
    data: {
      units: 'auto'
    },
 
    // Work with the response
    success: function( response ) {
      weatherData = response;
      updateFlags();
      refreshUI();
      fadeOverlay();
    }
  });
}

function refreshUI() {
  $('.forecast-today tbody').children().remove();
  $('.five-day').children().remove();
  updateWeatherUI();
  updateTodayForecastUI();
  updateFiveDayForecastUI();
}

function updateFlags() {
  setTempFormat(weatherData.flags.units);
}

function updateWeatherUI() {
  var now = weatherData.currently;
  var nowTime = currentTime.getTime();
  var nowHour = dateFormat(nowTime, "HH");
  console.log("Current hour is nowHour: " + nowHour);
  var gradient = gradients[nowHour][0];
  var date = dateFormat(nowTime, "dddd, mmmm dS, yyyy");
  var location = locationData.city + ", " + locationData.countryCode;
  var icon = conditionCodes[now.icon];
  var currentTemp = convertTemp(now.temperature) + "°";
  var summary = now.summary;
  $('.accented').css({color: gradients[nowHour][1]});
  updateWeatherUILabels(gradient, date, location, icon, currentTemp, summary);
}

function updateTodayForecastUI() {
  var timeNow = currentTime.getTime();
  var data = weatherData.hourly.data;
  var maxItems = 10;
  for (var i = 0; i < data.length; i++) {
    var forecastTime = data[i].time * 1000;
    var forecastTemperature = convertTemp(data[i].temperature) + "°";
    var forecastSummary = data[i].summary;
    var todaysDay = dateFormat(timeNow, "dd");
    var forecastDay = dateFormat(forecastTime, "dd");
    var forecastIcon = conditionCodes[data[i].icon];
    if ( forecastTime > timeNow && i <= maxItems) {
      var forecastTime = dateFormat(forecastTime, "h:MM TT");
      updateTodayForecastUILabels(forecastTime, forecastTemperature, forecastIcon, forecastSummary );
    }
  }
}

function updateFiveDayForecastUI() {
  var data = weatherData.daily.data;
  for(var i = 0; i < 5; i++) {
    var forecastDay = dateFormat(data[i].time * 1000, "ddd");
    var forecastConditionIcon = conditionCodes[data[i].icon];
    var minTemp = convertTemp(data[i].temperatureMin);
    var maxTemp = convertTemp(data[i].temperatureMax);
    updateFiveDayForecastUILabels(forecastDay, forecastConditionIcon, minTemp, maxTemp);
  }
}

function updateWeatherUILabels(gradient, date, location, icon, temp, summary ) {
  $('.current-weather').addClass(gradient);
  $('.current-weather .date').html(date);
  $('.current-weather .location').html(location);
  $('#climacon').removeClass().addClass('climacon ' + icon);
  $('.current-weather .temperature').html(temp);
  $('.current-weather .description').html(summary);
}

function updateTodayForecastUILabels(time, temp, icon, summary) {
  $('.forecast-today tbody').append("<tr><td>" + time + "</td><td class='temperature'>" + temp + "</td><td class='climacon-cell'><span class='climacon " + icon + "'></span></td><td>" + summary + "</td></tr>");
}

function updateFiveDayForecastUILabels(day, conditionIcon, minTemp, maxTemp) {
  var $dayForecast = $('.five-day');
  $dayForecast.append('<div class="day"><p>' + day + '</p><p class="climacon ' + conditionIcon + '"></p><p><span class="max">' + maxTemp + '°</span> <span class="min">' + minTemp + '°</span></p></div>');
}

function createOverlay() {
  $('.overlay').addClass(gradients[11][0]);
}

function fadeOverlay() {
  $('.overlay').animate({
    opacity: 0
  }, 800, function() {
    $(this).css({display:'none'});
  });
}

function convertTemp(temp) {
  if (weatherData.flags.units === 'us' && tempFormat === 'f') {
    return Math.round(temp);
  } else if (weatherData.flags.units === 'us' && tempFormat === 'c') {
    return Math.round((temp -  32) * 5 / 9);
  } else if (tempFormat === 'c') {
    return Math.round(temp);
  } else if (tempFormat === 'f') {
    return Math.round(temp * 9/5 + 32);
  }
}

function setTempFormat(format) {
  if (format === 'us') {
    tempFormat = 'f';
  } else {
    tempFormat = 'c';
  }
}

function toggleTempFormat() {
  if (tempFormat === 'c') {
    $('.temp-format-control .celcius').removeClass('active');
    $('.temp-format-control .fahrenheit').addClass('active');
    tempFormat = 'f';
  } else {
    $('.temp-format-control .celcius').addClass('active');
    $('.temp-format-control .fahrenheit').removeClass('active');
    tempFormat = 'c';
  }
  refreshUI();
}

var conditionCodes = {
  'clear-day': 'sun',
  'clear-night': 'moon',
  rain: 'rain',
  snow: 'snow',
  sleet: 'sleet',
  wind: 'wind',
  fog: 'fog',
  cloudy: 'cloud',
  'partly-cloudy-day': 'cloud sun',
  'partly-cloudy-night': 'cloud moon',
  hail: 'hail',
  thunderstorm: 'lightning',
  tornado: 'tornado'
};

var gradients = {
 '00': ['sky-gradient-00', '#20202c'],
 0: ['sky-gradient-00', '#20202c'],
 1: ['sky-gradient-01', '#20202c'],
 '01': ['sky-gradient-01', '#20202c'],
 2: ['sky-gradient-02', '#20202c'],
 '02': ['sky-gradient-02', '#20202c'],
 3: ['sky-gradient-03', '#3a3a52'],
 '03': ['sky-gradient-03', '#3a3a52'],
 4: ['sky-gradient-04', '#515175'],
 '04': ['sky-gradient-04', '#515175'],
 5: ['sky-gradient-05', '#8a76ab'],
 '05': ['sky-gradient-05', '#8a76ab'],
 6: ['sky-gradient-06', '#cd82a0'],
 '06': ['sky-gradient-06', '#cd82a0'],
 7: ['sky-gradient-07', '#eab0d1'],
 '07': ['sky-gradient-07', '#eab0d1'],
 8: ['sky-gradient-08', '#ebb2b1'],
 '08': ['sky-gradient-08', '#ebb2b1'],
 9: ['sky-gradient-09', '#b1b5ea'],
 '09': ['sky-gradient-09', '#b1b5ea'],
 10: ['sky-gradient-10', '#94dfff'],
 11: ['sky-gradient-11', '#67d1fb'],
 12: ['sky-gradient-12', '#38a3d1'],
 13: ['sky-gradient-13', '#246fa8'],
 14: ['sky-gradient-14', '#1e528e'],
 15: ['sky-gradient-15', '#5b7983'],
 16: ['sky-gradient-16', '#265889'],
 17: ['sky-gradient-17', '#728a7c'],
 18: ['sky-gradient-18', '#b26339'],
 19: ['sky-gradient-19', '#B7490F'],
 20: ['sky-gradient-20', '#240E03'],
 21: ['sky-gradient-21', '#2F1107'],
 22: ['sky-gradient-22', '#4B1D06'],
 23: ['sky-gradient-23', '#150800'],
 24: ['sky-gradient-24', '#150800']
};