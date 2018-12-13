var cookienames = {
    authenticated: 'user_logged_in',
    user: 'abiri_user',
    auth_side: 'authentication_side',
    cars: 'cars',
    default_car: 'default_car',
    routes: 'routes',
    rankRoutes: 'rankRoutes',
    journey: 'journey_route',
    has_tollgates: 'has_tollgates',
    has_etolls: 'has_etolls',
    has_taxi_ranks: 'has_taxi_ranks',
    tollgates: 'tollgates',
    etolls: 'etolls',
    taxi_ranks: 'taxi_ranks',
    activate: 'activate_it',
    toll_options: 'toll_options',
    etoll_options: 'etoll_options',
    journey_started: 'journey_started',
    journey_id: 'journey_id',
    rank_radius: 'rank_radius',
    position: 'routePosition',
    rank_routes: 'rank_routes',
    default_country: 'default_country',
    position_interval: 'position_interval',
    social_activate: 'social_activate',
    convoyObject: 'convoy_object',
    viewed_logs: 'viewed_ad_logs',
};

var tollOptions = {
    my_route: 'my_route',
    all_tolls: 'all_tolls'
};

var appDigits = {
    timeout: 5000,
    adInterval: 10000
};

var app_apis = {
    //abiri: 'http://localhost:8001/api/'
    abiri: 'https://v3.abiri.net/api/'
};

var messages = {
    empty_invite: 'You have not added any member to your convoy, please add at least one!!',
    server_error: 'Could not connect to the server, check your internet and try again',
    location_error: 'Sorry, your device can`t pick your current location, can you allow this app to use your location services and if you will goto \"Settings\" and increase the postion interval!'
};

var strings = {
    auth_side: 'authentication_'
};

var auth_side = {
    abiri_direct: 0,
    facebook: 1,
    google: 2
};
var keys = {
    google_maps: 'AIzaSyDk4ypmDfkMhJ9QGwmhO2YgqBRjtjSYzmQ',
    facebookID: '526123517788979',
    facebookSecret: '7c2d04d0ceda9c52c18e076693ce5fd1'

};

var api = {
    getPath: function (link) {
        //return 'http://localhost:8001/api/abiri-' + link;
          return 'https://v3.abiri.net/api/abiri-' + link;
    }
};

var google = {
    // findPlaces: 'https://maps.googleapis.com/maps/api/place/textsearch/json?key=' + keys.google_maps + '&query=',
    // findPlaces: 'https://maps.googleapis.com/maps/api/place/autocomplete/json?components=country:za&key=' + keys.google_maps + '&input=',
    findPlace: 'https://maps.googleapis.com/maps/api/place/details/json?key=' + keys.google_maps + '&placeid=',
    getRoutesByCoord: function (origin, destination) {
        return 'https://maps.googleapis.com/maps/api/directions/json?origin=' + origin + '&destination=' + destination + '&key=' + keys.google_maps + '&alternatives=true&units=metric';
    },
    getRoutesByIDs: function (origin, destination) {
        return 'https://maps.googleapis.com/maps/api/directions/json?origin=place_id:' + origin + '&destination=place_id' + destination + '&key=' + keys.google_maps + '&alternatives=true&units=metric';
    },
    getWalkingDirections: function (origin, destination) {
        return 'https://maps.googleapis.com/maps/api/directions/json?origin=' + origin + '&destination=' + destination + '&key=' + keys.google_maps + '&alternatives=true&units=metric&mode=walking&sensor=false';
    },
    distanceBetween: function (origin, destination) {
        return 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' + origin + '&destinations=' + destination + '&key=' + keys.google_maps + '&units=metric';
    },
    findPlaces: function (input) {
        var countryPrefix;
        var defaultCountry = Cookies.get(cookienames.default_country);
        if (defaultCountry === coutries.south_africa) {
            countryPrefix = 'za';
        } else if (defaultCountry === coutries.botswana) {
            countryPrefix = 'bw';
        } else if (defaultCountry === coutries.zimbabwe) {
            countryPrefix = 'zw';
        } else if (defaultCountry === coutries.namibia) {
            countryPrefix = 'na';
        } else if (defaultCountry === coutries.mozambique) {
            countryPrefix = 'mz';
        } else if (defaultCountry === coutries.lesotho) {
            countryPrefix = 'ls';
        } else {
            countryPrefix = 'sz';
        }
        console.log(countryPrefix);
        return 'https://maps.googleapis.com/maps/api/place/autocomplete/json?components=country:' + countryPrefix + '&key=' + keys.google_maps + '&input=' + input;
    }
};
var coutries = {
    south_africa: 'South Africa',
    zimbabwe: 'Zimbabwe',
    botswana: 'Botswana',
    mozambique: 'Mozambique',
    lesotho: 'Lesotho',
    swaziland: 'Swaziland',
    namibia: 'Namibia'
};