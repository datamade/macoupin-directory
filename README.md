# Macoupin Resource Directory

Macoupin County’s online source for finding businesses, local governments and community services.

![Macoupin Resource Directory](https://raw.githubusercontent.com/datamade/macoupin-directory/master/images/screenshot.jpg)

## Installation

<pre>
  $ git clone https://github.com/datamade/macoupin-directory.git
  $ cd macoupin-directory
  $ python -m SimpleHTTPServer
  navigate to http://localhost:8000/
</pre>

## Dependencies

* [CartoDB](http://docs.cartodb.com/cartodb-platform/cartodb-js.html)
* [Leaflet](http://leafletjs.com)
* [jQuery 3.3.1](http://jquery.org)
* [jQuery Address](http://www.asual.com/jquery/address)
* [Bootstrap 4](http://getbootstrap.com)

## Data

The data for this website resides in a [Google spreadsheet](https://docs.google.com/spreadsheets/d/1cRc7u87G_NueOLANU9yA9-TErRti8Jgf2Xumv8S0L14/edit#gid=693324662) and is synced every hour to CARTO, which powers the map.

For geocoding addresses, we use [Google Sheets Geocoder](https://github.com/jackdougherty/google-sheets-geocoder) - specifically, [geocoder-census-google.gs](https://raw.githubusercontent.com/JackDougherty/google-sheets-geocoder/master/geocoder-census-google.gs) - a library that converts addresses into lat-long coordinates.

### How to use the Geocoder script to find the latitude and longitude of a location:
For each new entry, you will need to geocode the address and get its latitude and longitude. 

1. For the rows you want to geocode, select Full Address, Latitude, Longitude, Found, Quality, and Source.
2. Click the “Geocoder” option in the menu, and select “with Google.” (note you can only Geocode 1,000 rows per day)
3. Wait for results!

![Geocoding in Google Sheets](https://raw.githubusercontent.com/datamade/macoupin-directory/master/images/macoupin-geocode.gif)

### Rules for good spreadsheet data maintenance

* Do not change the names of columns. Doing so will break the map! If you need to change the column names, please contact DataMade.
* Do not change the url of the spreadsheet without contacting DataMade first. The spreadsheet syncs with CARTO, a third-party tool for rendering maps, and CARTO needs to know exactly where to find the spreadsheet.
* If you add columns, data in those columns will not display on the map without updates from DataMade. Contact DataMade about showing new column data.

## Team

* [Derek Eder](mailto:derek.eder@datamade.com)

## Errors / Bugs

If something is not behaving intuitively, it is a bug, and should be reported.
Report it here: https://github.com/datamade/macoupin-directory/issues

## Note on Patches/Pull Requests

* Fork the project.
* Make your feature addition or bug fix.
* Commit, do not mess with rakefile, version, or history.
* Send a pull request. Bonus points for topic branches.

## Copyright

Copyright (c) 2019 DataMade and Macoupin County. Released under the MIT License.

[See LICENSE for details](https://github.com/datamade/macoupin-directory/blob/master/LICENSE)
