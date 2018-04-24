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
    rank_routes: 'rank_routes'
};

var tollOptions = {
    my_route: 'my_route',
    all_tolls: 'all_tolls'
};

var app_apis = {
    //abiri: 'http://localhost:8001/api/'
    abiri: 'https://api.abiri.net/api/'
};

var messages = {
    server_error: 'Could not connect to the server, check your internet and try again'
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
    google_maps: 'AIzaSyBsG1vXwZM2_AJq_yddR7iy5_Vd7rgofNc'
};
var google = {
    // findPlaces: 'https://maps.googleapis.com/maps/api/place/textsearch/json?key=' + keys.google_maps + '&query=',
    findPlaces: 'https://maps.googleapis.com/maps/api/place/autocomplete/json?components=country:za&key=' + keys.google_maps + '&input=',
    findPlace: 'https://maps.googleapis.com/maps/api/place/details/json?key=' + keys.google_maps + '&placeid=',
    getRoutesByCoord: function (origin, destination) {
        return 'https://maps.googleapis.com/maps/api/directions/json?origin=' + origin + '&destination=' + destination + '&key=' + keys.google_maps + '&alternatives=true&units=metric';
    },
    getRoutesByIDs: function (origin, destination) {
        return 'https://maps.googleapis.com/maps/api/directions/json?origin=place_id:' + origin + '&destination=place_id' + destination + '&key=' + keys.google_maps + '&alternatives=true&units=metric';
    },
    getWalkingDirections: function (origin, destination) {
        return 'https://maps.googleapis.com/maps/api/directions/json?origin=' + origin + '&destination=' + destination + '&key=' + keys.google_maps + '&alternatives=true&units=metric&mode=walking';
    },
    distanceBetween: function (origin, destination) {
        return 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' + origin + '&destinations=' + destination + '&key=' + keys.google_maps + '&units=metric';
    }
};