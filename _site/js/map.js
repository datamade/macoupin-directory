$(window).resize(function () {
  var h = $(window).height(),
    offsetTop = 120; // Calculate the top offset

  $('#mapCanvas').css('height', (h - offsetTop));
}).resize();

$(function() {
  // https://github.com/Aleksander98/bsgdprcookies
  // settings for jquery.bs.gdpr.cookies.js
  var settings = {
      title: 'About our cookies',
      message: 'Macoupin Resource Directory uses cookies to allow you to save your searches for easy retrieval. DataMade does not collect or use this data in any way. By using this site you consent to our cookie policy.',
      moreLinkLabel: '',
      messageMaxHeightPercent: 30,
      delay: 250,
      acceptButtonLabel: 'Continue',
      allowAdvancedOptions: false,
      OnAccept : function() {
          var preferences = $.fn.bsgdprcookies.GetUserPreferences();
      }
  }
  // events for jquery.bs.gdpr.cookies.js
  $('body').bsgdprcookies(settings);
  $('#cookiesBtn').on('click', function(){
      $('body').bsgdprcookies(settings, 'reinit');
  });

  CartoDbLib.initialize();
  new Clipboard('#copy-button');

  var autocomplete = new google.maps.places.Autocomplete(document.getElementById('search-address'));
  var modalURL;

  $('#btnReset').tooltip();
  $('#btnViewMode').tooltip();
  $('[data-tooltip="true"]').tooltip();

  $('#btnSearch').click(function(){
    // Temporary fix for map load issue: set show map as default.
    if ($('#mapCanvas').is(":visible")){
      CartoDbLib.doSearch();
    }
    else {
      $('#btnViewMode').html("<i class='fa fa-list'></i>");
      $('#mapCanvas').show();
      $('#listCanvas').hide();
      CartoDbLib.doSearch();
    }
  });

  $('#btnViewMode').click(function(){
    if ($('#mapCanvas').is(":visible")){
      $('#btnViewMode').html("<i class='fa fa-map-marker'></i>");
      $('#listCanvas').show();
      $('#mapCanvas').hide();
    }
    else {
      $('#btnViewMode').html("<i class='fa fa-list'></i>");
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

  $(".list-table").on('click', '.fa-star-o', function() {
    var tr = ($(this).parents().eq(1));
    var address = tr.find("span.facility-address").text();
    var id_nbr = tr.find("span#given-id").text();
    $(this).removeClass('fa-star-o');
    $(this).addClass('fa-star');
    $(this).removeAttr('data-original-title');
    $(this).attr('title', 'Location saved');
    CartoDbLib.addFacilityCookie(address, id_nbr);
  });

  $(".modal-header").on('click', '.fa-star-o', function() {
    var address = $("#modal-address").text();
    var id_nbr = $.address.parameter('modal_id');
    $(this).removeClass('fa-star-o');
    $(this).addClass('fa-star');
    $(this).removeAttr('data-original-title');
    $(this).attr('title', 'Location saved');
    CartoDbLib.addFacilityCookie(address, id_nbr);
  });

  $(".close-btn").on('click', function() {
    $.address.parameter('modal_id', null)
  });

  $(".list-table").on('click', '.fa-star', function() {
    var tr = ($(this).parents().eq(1));
    var id_nbr = tr.find('#given-id').text();
    $(this).removeClass('fa-star');
    $(this).addClass('fa-star-o');
    CartoDbLib.deleteSavedFacility(id_nbr);
  });

  $(".btn-print").on("click", function() {
    window.print();
  });

  $(".btn-print-modal").on("click", function() {
      $("#printModal").printThis();
  });

});

function makeSelectData(array) {
  data_arr = []
  for(var i = 0; i < array.length; i++) {
    data_arr.push({ id: i, text: CartoDbLib.formatText(array[i]) })
  }

  return data_arr
};

function makeSelectDataGroups(faciltyArray) {
  data_arr_generic = []
  data_arr_specific = []
  for(var i = 0; i < faciltyArray.length; i++) {
    if (faciltyArray[i].includes('facility_type_')) {
      data_arr_specific.push({ id: i, text: CartoDbLib.formatText(faciltyArray[i]) })
    }
    else {
      data_arr_generic.push({ id: i, text: CartoDbLib.formatText(faciltyArray[i]) })
    }
  }

   return [
      {text: "",
      children: data_arr_generic},
      {text: "Health facilities",
      children: data_arr_specific},
    ]
};




