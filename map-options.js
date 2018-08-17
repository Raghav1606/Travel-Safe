(function(window, google, saferoutes) {

    saferoutes.MAP_OPTIONS = {
        center: {
            lat: 40.110833,
            lng: -88.226944
        },
        zoom: 15,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_RIGHT
        }
    };

}(window, google, window.SafeRoutes || (window.SafeRoutes = {})));