(function(window, saferoutes) {

    // initialization
    var options = saferoutes.MAP_OPTIONS;
    element = document.getElementById('map-canvas');
    map = saferoutes.create(element, options);

    // create searchbox and position it
    var search_input = document.getElementById('search-input');
    var search_box = new google.maps.places.SearchBox(search_input);
    map.gMap.controls[google.maps.ControlPosition.TOP_LEFT].push(search_input);

    // adjust map bounds upon being changed and perform search when user enters new place.
    function adjust_bounds(map) {
        map.addListener('bounds_changed', function() {
            search_box.setBounds(map.getBounds());
        });
    }

    function clear_markers(markers) {
        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        markers = [];
    }

    function expand_viewport(place, bounds) {
        if (place.geometry.viewport) {
            bounds.union(place.geometry.viewport);
        } else {
            bounds.extend(place.geometry.location);
        }
    }

    adjust_bounds(map.gMap);
    var markers = [];
    search_box.addListener('places_changed', function() {
        var places = search_box.getPlaces();
        if (places.length == 0) {
            return;
        }
        clear_markers(markers);

        // for each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map.gMap,
                title: place.name,
                position: place.geometry.location
            }));
            expand_viewport(place, bounds);
        });
        map.gMap.fitBounds(bounds);
        map.zoom(17);
    });



    // directions implementation
    var origin_place_id = null;
    var destination_place_id = null;
    var travel_mode = google.maps.TravelMode.WALKING;
    var origin_input = document.getElementById('origin-input');
    var destination_input = document.getElementById('destination-input');

    adjust_bounds(map.gMap);
    var origin_autocomplete = new google.maps.places.Autocomplete(origin_input);
    origin_autocomplete.bindTo('bounds', map.gMap);
    var destination_autocomplete = new google.maps.places.Autocomplete(destination_input);
    destination_autocomplete.bindTo('bounds', map.gMap);

    // Sets a listener on a radio button to change the filter type on Places
    // Autocomplete.

    function setupClickListener(id, mode) {
        var radioButton = document.getElementById(id);
        radioButton.addEventListener('click', function() {
            travel_mode = mode;
        });
    }

    setupClickListener('walking', google.maps.TravelMode.WALKING);
    setupClickListener('transit', google.maps.TravelMode.TRANSIT);
    setupClickListener('driving', google.maps.TravelMode.DRIVING);

    function expandViewportToFitPlace(map, place) {
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }
    }

    origin_autocomplete.addListener('place_changed', function() {
        clear_markers(markers)
        var place = origin_autocomplete.getPlace();
        if (!place.geometry) {
            window.alert("Autocomplete's returned place contains no geometry");
            return;
        }
        expandViewportToFitPlace(map.gMap, place);
        origin_place_id = place.place_id;
        // route(origin_place_id, destination_place_id, travel_mode, directionsService, directionsDisplay);
    });

    destination_autocomplete.addListener('place_changed', function() {
        clear_markers(markers)
        var place = destination_autocomplete.getPlace();
        if (!place.geometry) {
            window.alert("Autocomplete's returned place contains no geometry");
            return;
        }
        expandViewportToFitPlace(map.gMap, place);
        destination_place_id = place.place_id;
        // route(origin_place_id, destination_place_id, travel_mode, directionsService, directionsDisplay);
    });

    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setOptions({
                            map: map.gMap,
                            panel: document.getElementById('steps-panel'),

                        })
    var search = document.getElementById('search');
    search.addEventListener("click", function() {
        route(origin_place_id, destination_place_id, travel_mode, directionsService, directionsDisplay);
    });


    // directions api
    function route(origin_place_id, destination_place_id, travel_mode, directionsService, directionsDisplay) {
        if (!origin_place_id || !destination_place_id) {
          return;
        }
        directionsService.route({
            origin: {'placeId': origin_place_id},
            destination: {'placeId': destination_place_id},
            travelMode: travel_mode,
            provideRouteAlternatives: true
        }, function (response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }
    
}(window, window.SafeRoutes || (window.SafeRoutes = {})));
