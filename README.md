# Macoupin Resource Directory

Macoupin County’s online source for finding businesses, local governments and community services.

![Probation Community Resources](https://raw.githubusercontent.com/datamade/macoupin-directory/master/images/screenshot.jpg)

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
