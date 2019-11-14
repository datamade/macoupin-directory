$(window).resize(function () {
  var h = $(window).height(),
    offsetTop = 110; // Calculate the top offset

  $('#mapCanvas').css('height', (h - offsetTop));
}).resize();

$(function() {

  CartoDbLib.initialize({
    map_centroid: [39.276807, -89.934306],
    defaultZoom:  9,
    layerUrl:     'https://datamade.carto.com/api/v2/viz/97d9e05a-1c8f-4f95-bd7e-879490999455/viz.json',
    tableName:    'macoupinresourcedirectory_macoupinil_directory_csv',
    userName:     'datamade',
    fields :      'id, cartodb_id, the_geom, name, full_address, full_search, description, phone_1, phone_2, fax, email, website, tag, type, type_id',
  });

  var autocomplete = new google.maps.places.Autocomplete(document.getElementById('search-address'));
  var modalURL;

  $('#btnSearch').click(function(){
    // Temporary fix for map load issue: set show map as default.
    if ($('#mapCanvas').is(":visible")){
      CartoDbLib.doSearch();
    }
    else {
      $('#btnViewMode').html("<i class='fa fa-list'></i> List view");
      $('#mapCanvas').show();
      $('#listCanvas').hide();
      CartoDbLib.doSearch();
    }
  });

  $(':checkbox').click(function(){
    CartoDbLib.doSearch();
  });

  $(':radio').click(function(){
    CartoDbLib.doSearch();
  });

  $('#btnViewMode').click(function(){
    if ($('#mapCanvas').is(":visible")){
      $('#btnViewMode').html("<i class='fa fa-map-marker'></i> Map view");
      $('#listCanvas').show();
      $('#mapCanvas').hide();
    }
    else {
      $('#btnViewMode').html("<i class='fa fa-list'></i> List view");
      $('#listCanvas').hide();
      $('#mapCanvas').show();
    }
  });

  $("#search-address").keydown(function(e){
      var key =  e.keyCode ? e.keyCode : e.which;
      if(key == 13) {
          $('#btnSearch').click();
          return false;
      }
  });

  $(".close-btn").on('click', function() {
    $.address.parameter('modal_id', null)
  });

});