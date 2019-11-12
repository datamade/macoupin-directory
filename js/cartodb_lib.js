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
    $("#search-name").val(CartoDbLib.convertToPlainString($.address.parameter('name')));
    $("#search-address").val(CartoDbLib.convertToPlainString($.address.parameter('address')));
    $("#search-radius").val(CartoDbLib.convertToPlainString($.address.parameter('radius')));
    $(":checkbox").prop("checked", "checked");

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
      CartoDbLib.createSQL();
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
    sql.execute("SELECT " + CartoDbLib.fields + " FROM " + CartoDbLib.tableName + CartoDbLib.whereClause + " ORDER BY name")
      .done(function(listData) {
        var obj_array = listData.rows;

        if (listData.rows.length == 0) {
          results.append("<p class='no-results'>No results. Please broaden your search.</p>");
        }
        else {
          var template = '';

          // ---- custom template ----
          for (idx in obj_array) {

            var type_color = 'green';
            
            if (obj_array[idx]['type_id'] == '3') type_color = 'blue';
            if (obj_array[idx]['type_id'] == '2') type_color = 'red';
            
            template = "\
              <tr>\
                  <td><span class='filter-box filter-" + type_color + "'></span></td>\
                  <td class='clickable' id='result-" + obj_array[idx]['id'] + "'><strong>" + obj_array[idx]['name'] + "</strong><br /><small>" + obj_array[idx]['type'] + "<br />" + obj_array[idx]['tag'] + "</small></td>\
                  <td>" + obj_array[idx]['full_address'] + "</td>\
                  <td>";

            if (obj_array[idx]['phone_1'] != "") 
                template += "<b>Phone:</b> " + obj_array[idx]['phone_1'] + "<br>";
            if (obj_array[idx]['phone_2'] != "") 
                template += "<b>Phone secondary:</b> " + obj_array[idx]['phone_2'] + "<br>";
            if (obj_array[idx]['fax'] != "") 
                template += "<b>Fax:</b> " + obj_array[idx]['fax'] + "<br>";
            if (obj_array[idx]['website'] != "") 
                template += "<b>Web:</b> <a href='http://" + obj_array[idx]['website'] + "' target='_blank'>" + obj_array[idx]['website'] + "</a><br>";
            if (obj_array[idx]['email'] != "") 
                template += "<b>Email:</b> <a href='mailto:" + obj_array[idx]['email'] + "' target='_blank'>" + obj_array[idx]['email'] + "</a><br>";

            template += "\
                  </td>\
                  <td>" + obj_array[idx]['description'] + "</td>\
              </tr>";
            results.append(template);

            $("#result-" + obj_array[idx]['id']).on("click", function() {
                console.log('clicked ' + obj_array[idx]['id'])
                CartoDbLib.modalPop(obj_array[idx])
            });
            

            // ---- end custom template ----
          }
        }
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
        $('#list-result-count').html(CartoDbLib.resultsCount + ' locations found')
      }
    );
  },

  modalPop: function(data) {
      var contact = "<p id='modal-address'><i class='fa fa-map-marker' aria-hidden='true'></i> " + data.full_address + '</p>' + '<p class="modal-directions"><a href="http://maps.google.com/?q=' + data.full_address + '" target="_blank">GET DIRECTIONS</a></p>' +"<p id='modal-phone'><i class='fa fa-phone' aria-hidden='true'></i> " + data.phone_1 + "</p>"
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
      $('#modal-title, #modal-main').empty();
      $('#modal-title').append(data.name);
      $('#modal-main').append(contact);

      $('#modal-main').append(website);

      $.address.parameter('modal_id', data.id);

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
      CartoDbLib.geoSearch = " AND ST_DWithin(ST_SetSRID(ST_POINT(" + CartoDbLib.currentPinpoint[1] + ", " + CartoDbLib.currentPinpoint[0] + "), 4326)::geography, the_geom::geography, " + CartoDbLib.radius + ")";
    }
    else {
      CartoDbLib.geoSearch = ''
    }

    CartoDbLib.whereClause = " WHERE the_geom is not null ";

    //-----custom filters-----
    var type_column = "type_id";
    var searchType = type_column + " IN (-1,";
    if ( $("#cbType1").is(':checked')) searchType += "1,";
    if ( $("#cbType2").is(':checked')) searchType += "2,";
    if ( $("#cbType3").is(':checked')) searchType += "3,";
    CartoDbLib.whereClause += " AND " + searchType.slice(0, searchType.length - 1) + ")";
    
    var name_search = $("#search-name").val().replace("'", "\\'");
    if (name_search != '') {
      CartoDbLib.whereClause += " AND full_search ILIKE '%" + name_search + "%'";
      $.address.parameter('name', encodeURIComponent(name_search));
    }
    // -----end of custom filters-----

    if (CartoDbLib.geoSearch != "") {
      CartoDbLib.whereClause += CartoDbLib.geoSearch;
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