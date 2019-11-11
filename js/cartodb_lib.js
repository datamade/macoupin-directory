var CartoDbLib = CartoDbLib || {};
var CartoDbLib = {

  map_centroid:    [39.276807, -89.934306],
  defaultZoom:     9,
  lastClickedLayer: null,
  locationScope:   "IL",
  currentPinpoint: null,
  layerUrl: 'https://datamade.carto.com/api/v2/viz/97d9e05a-1c8f-4f95-bd7e-879490999455/viz.json',
  tableName: 'macoupinresourcedirectory_macoupinil_directory_csv',
  userName: 'datamade',
  geoSearch: '',
  whereClause: '',
  radius: '',
  resultsCount: 0,
  fields : "id, cartodb_id, the_geom, name, full_address, full_search, description, phone_1, phone_2, fax, email, website, tag, type, type_id",

  initialize: function(){

    //reset filters
    $("#search-address").val(CartoDbLib.convertToPlainString($.address.parameter('address')));
    $("#search-radius").val(CartoDbLib.convertToPlainString($.address.parameter('radius')));

    var num = $.address.parameter('modal_id');

    if (typeof num !== 'undefined') {
      var sql = new cartodb.SQL({ user: CartoDbLib.userName });
      sql.execute("SELECT " + CartoDbLib.fields + " FROM " + CartoDbLib.tableName + " WHERE id = " + num)
      .done(function(data) {
        CartoDbLib.modalPop(data.rows[0]);
      });
    }

    geocoder = new google.maps.Geocoder();
    // initiate leaflet map
    if (!CartoDbLib.map) {
      CartoDbLib.map = new L.Map('mapCanvas', {
        center: CartoDbLib.map_centroid,
        zoom: CartoDbLib.defaultZoom
      });

      CartoDbLib.google = new L.Google('ROADMAP', {animate: false});

      CartoDbLib.map.addLayer(CartoDbLib.google);

      //add hover info control
      CartoDbLib.info = L.control({position: 'bottomleft'});

      CartoDbLib.info.onAdd = function (map) {
          this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
          this.update();
          return this._div;
      };

      // method that we will use to update the control based on feature properties passed
      CartoDbLib.info.update = function (props) {
        if (props) {
          this._div.innerHTML = "<strong>" + props['name'] + "</strong><br />" + props['type'] + "<br />" + props.full_address;
        }
        else {
          this._div.innerHTML = 'Hover over a location';
        }
      };

      CartoDbLib.info.clear = function(){
        this._div.innerHTML = 'Hover over a location';
      };

      //add results control
      CartoDbLib.results_div = L.control({position: 'topright'});

      CartoDbLib.results_div.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'results-count');
        this._div.innerHTML = "";
        return this._div;
      };

      CartoDbLib.results_div.update = function (count){
        this._div.innerHTML = count + ' locations found';
      };

      CartoDbLib.results_div.addTo(CartoDbLib.map);

      CartoDbLib.info.addTo(CartoDbLib.map);
      CartoDbLib.clearSearch();
      CartoDbLib.renderMap();
      CartoDbLib.renderList();
      CartoDbLib.getResults();
    }
  },

  doSearch: function() {
    CartoDbLib.clearSearch();
    var address = $("#search-address").val();
    CartoDbLib.radius = $("#search-radius").val();

    if (CartoDbLib.radius == null && address != "") {
      CartoDbLib.radius = 8050;
    }

    if (address != "") {
      if (address.toLowerCase().indexOf(CartoDbLib.locationScope) == -1)
        address = address + " " + CartoDbLib.locationScope;

      geocoder.geocode( { 'address': address }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          CartoDbLib.currentPinpoint = [results[0].geometry.location.lat(), results[0].geometry.location.lng()];
          $.address.parameter('address', encodeURIComponent(address));
          $.address.parameter('radius', CartoDbLib.radius);
          CartoDbLib.address = address;
          CartoDbLib.createSQL(); // Must call create SQL before setting parameters.
          CartoDbLib.setZoom();
          CartoDbLib.addIcon();
          CartoDbLib.addCircle();
          CartoDbLib.renderMap();
          CartoDbLib.renderList();
          CartoDbLib.getResults();
        }
        else {
          alert("We could not find your address: " + status);
        }
      });
    }
    else { //search without geocoding callback
      CartoDbLib.map.setView(new L.LatLng( CartoDbLib.map_centroid[0], CartoDbLib.map_centroid[1] ), CartoDbLib.defaultZoom)
      CartoDbLib.createSQL(); // Must call create SQL before setting parameters.
      CartoDbLib.renderMap();
      CartoDbLib.renderList();
      CartoDbLib.getResults();
    }

  },

  renderMap: function() {
      var layerOpts = {
        user_name: CartoDbLib.userName,
        type: 'cartodb',
        cartodb_logo: false,
        sublayers: [
          {
            sql: "SELECT * FROM " + CartoDbLib.tableName + CartoDbLib.whereClause,
            cartocss: $('#maps-styles').html().trim(),
            interactivity: CartoDbLib.fields
          }
        ]
      }

      CartoDbLib.dataLayer = cartodb.createLayer(CartoDbLib.map, layerOpts, { https: true })
        .addTo(CartoDbLib.map)
        .done(function(layer) {
          CartoDbLib.sublayer = layer.getSubLayer(0);
          CartoDbLib.sublayer.setInteraction(true);
          CartoDbLib.sublayer.on('featureOver', function(e, latlng, pos, data, subLayerIndex) {
            $('#mapCanvas div').css('cursor','pointer');
            CartoDbLib.info.update(data);
          })
          CartoDbLib.sublayer.on('featureOut', function(e, latlng, pos, data, subLayerIndex) {
            $('#mapCanvas div').css('cursor','inherit');
            CartoDbLib.info.clear();
          })
          CartoDbLib.sublayer.on('featureClick', function(e, latlng, pos, data) {
              CartoDbLib.modalPop(data);
          })
          CartoDbLib.sublayer.on('error', function(err) {
            console.log('error: ' + err);
          })
        }).on('error', function(e) {
          console.log('ERROR')
          console.log(e)
        });
  },

  renderList: function() {
    var sql = new cartodb.SQL({ user: CartoDbLib.userName });
    var results = $('#results-list');

    if ((CartoDbLib.whereClause == ' WHERE the_geom is not null AND ') || (CartoDbLib.whereClause == ' WHERE the_geom is not null ')) {
      CartoDbLib.whereClause = '';
    }

    results.empty();
    sql.execute("SELECT " + CartoDbLib.fields + " FROM " + CartoDbLib.tableName + CartoDbLib.whereClause)
      .done(function(listData) {
        var obj_array = listData.rows;
        console.log(listData)

        if (listData.rows.length == 0) {
          results.append("<p class='no-results'>No results. Please broaden your search.</p>");
        }
        else {
          for (idx in obj_array) {
            // todo: flesh this out
            console.log(obj_array[idx].name)
            var output = Mustache.render("\
              <tr>\
                <td></td>\
                <td>{{obj_array[idx].name}}</td>\
                <td>Address</td>\
                <td>Contact</td>\
                <td>Description</td>\
              </tr>");
            results.append(output);
            $('.fa-star-o').tooltip();
            $('.fa-star').tooltip();
          }
        }
    }).done(function(listData) {
        $(".facility-name").on("click", function() {
          var thisName = $(this).text();
          var objArray = listData.rows;
          $.each(objArray, function( index, obj ) {
            if (obj.organization_name == thisName ) {
              CartoDbLib.modalPop(obj)
            }
          });
        });
    }).error(function(errors) {
      console.log("errors:" + errors);
    });
  },

  getResults: function() {
    var sql = new cartodb.SQL({ user: CartoDbLib.userName });

    sql.execute("SELECT count(*) FROM " + CartoDbLib.tableName + CartoDbLib.whereClause)
      .done(function(data) {
        CartoDbLib.resultsCount = data.rows[0]["count"];
        CartoDbLib.results_div.update(CartoDbLib.resultsCount);
      }
    );
  },

  modalPop: function(data) {
      var contact = "<p id='modal-address'><i class='fa fa-map-marker' aria-hidden='true'></i> " + data.full_address + '</p>' + '<p class="modal-directions"><a href="http://maps.google.com/?q=' + data.full_address + '" target="_blank">GET DIRECTIONS</a></p>' +"<p id='modal-phone'><i class='fa fa-phone' aria-hidden='true'></i> " + data.intake_number + "</p>"
      var hours = "<p><i class='fa fa-calendar' aria-hidden='true'></i> " + data.hours_of_operation + "</p>"
      var url = ''
      var urlName = ''
      if (data.website != "") {
        if (data.website.match(/^http/)) {
          url =  data.website;
          urlName = "<i class='fa fa-reply' aria-hidden='true'></i> Website"

        }
        else {
          url = "http://" + data.website;
          urlName = "<i class='fa fa-reply' aria-hidden='true'></i> Website"
        }
      }

      var website = "<p id='modal-site'><a href='" + url + "' target='_blank'>" + urlName + "</a></p>"

      $('#modal-pop').modal();
      $('.modal-map-marker div.row').hide();
      $('#modal-title, #modal-main, #modal-programs, #modal-image, #language-header, #insurance-header, #age-header, #programs-header, #type-header, #religion-header, #language-subsection, #insurance-subsection, #age-subsection, #type-subsection, #religion-subsection').empty();
      $('#modal-title').append(icon + " " + data.organization_name);
      $('#modal-main').append(contact);

      var img_input = (data.image_url).toLowerCase();

      if (img_input != "no photo" && img_input != "no image") {
          $('#modal-image').append('<img class="img-borders" src=' + data.image_url + '>');
          loaded_image = $('img.img-borders')
          loaded_image.on('error', function() {
            loaded_image.hide();
          });
      }

      if (data.hours_of_operation != "") {
        $('#modal-main').append(hours);
      }

      $('#modal-main').append(website);

      var age_list = ''
      var type_list = ''
      var insurance_list = ''
      var language_list = 'English,&nbsp;&nbsp;'
      var program_list = ''

      $.address.parameter('modal_id', data.id);
      $("#post-shortlink").val(location.href);

      // Add tooltip.
      $('.fa-star-o').tooltip();
      $('.fa-star').tooltip();

  },

  clearSearch: function(){
    if (CartoDbLib.sublayer) {
      CartoDbLib.sublayer.remove();
    }
    if (CartoDbLib.centerMark)
      CartoDbLib.map.removeLayer( CartoDbLib.centerMark );
    if (CartoDbLib.radiusCircle)
      CartoDbLib.map.removeLayer( CartoDbLib.radiusCircle );
  },

  findMe: function() {
    // Try W3C Geolocation (Preferred)
    var foundLocation;

    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        foundLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
        CartoDbLib.addrFromLatLng(foundLocation);
      }, null);
    }
    else {
      alert("Sorry, we could not find your location.");
    }
  },

  addrFromLatLng: function(latLngPoint) {
    geocoder.geocode({'latLng': latLngPoint}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          $('#search-address').val(results[1].formatted_address);
          $('.hint').focus();
          CartoDbLib.doSearch();
        }
      } else {
        alert("Geocoder failed due to: " + status);
      }
    });
  },

  createSQL: function() {
     // Devise SQL calls for geosearch and language search.
    var address = $("#search-address").val();

    if(CartoDbLib.currentPinpoint != null && address != '') {
      CartoDbLib.geoSearch = "ST_DWithin(ST_SetSRID(ST_POINT(" + CartoDbLib.currentPinpoint[1] + ", " + CartoDbLib.currentPinpoint[0] + "), 4326)::geography, the_geom::geography, " + CartoDbLib.radius + ")";
    }
    else {
      CartoDbLib.geoSearch = ''
    }

    CartoDbLib.whereClause = " WHERE the_geom is not null AND ";

    if (CartoDbLib.geoSearch != "") {
      CartoDbLib.whereClause += CartoDbLib.geoSearch;
    }
    else {
      CartoDbLib.whereClause = " WHERE the_geom is not null ";
    }
  },

  setZoom: function() {
    var zoom = '';
    if (CartoDbLib.radius >= 8050) zoom = 12; // 5 miles
    else if (CartoDbLib.radius >= 3220) zoom = 13; // 2 miles
    else if (CartoDbLib.radius >= 1610) zoom = 14; // 1 mile
    else if (CartoDbLib.radius >= 805) zoom = 15; // 1/2 mile
    else if (CartoDbLib.radius >= 400) zoom = 16; // 1/4 mile
    else zoom = 16;

    CartoDbLib.map.setView(new L.LatLng( CartoDbLib.currentPinpoint[0], CartoDbLib.currentPinpoint[1] ), zoom)
  },

  addIcon: function() {
    CartoDbLib.centerMark = new L.Marker(CartoDbLib.currentPinpoint, { icon: (new L.Icon({
            iconUrl: '/img/blue-pushpin.png',
            iconSize: [32, 32],
            iconAnchor: [10, 32]
    }))});

    CartoDbLib.centerMark.addTo(CartoDbLib.map);
  },

  addCircle: function() {
    CartoDbLib.radiusCircle = new L.circle(CartoDbLib.currentPinpoint, CartoDbLib.radius, {
        fillColor:'#1d5492',
        fillOpacity:'0.2',
        stroke: false,
        clickable: false
    });

    CartoDbLib.radiusCircle.addTo(CartoDbLib.map);
  },

  //converts a slug or query string in to readable text
  convertToPlainString: function(text) {
    if (text == undefined) return '';
    return decodeURIComponent(text);
  },

}