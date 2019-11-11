# Macoupin Resource Directory

Macoupin County’s online source for finding businesses, local governments and community services.

## Installation

<pre>
  $ git clone https://github.com/datamade/macoupin-directory.git
  $ cd macoupin-directory
  $ gem install jekyll
  $ jekyll serve -w
  navigate to http://localhost:5000/
</pre>

## Dependencies

* [Jekyll](http://jekyllrb.com)
* [CartoDB](http://docs.cartodb.com/cartodb-platform/cartodb-js.html)
* [Leaflet](http://leafletjs.com)
* [jQuery](http://jquery.org)
* [jQuery Address](http://www.asual.com/jquery/address)
* [Bootstrap](http://getbootstrap.com)

## Data

The data for this tool resides in a Google spreadsheet and its corresponding Carto table.

## Run Tests

This site includes a basic test suite built with Rspec and Capybara, which drive the browser to perform acceptance tests.

<pre>
  $ bundle install
  $ rspec spec/
</pre>

Some tests include **binding.pry**. In such cases the test pauses, after which you may type "exit" in the terminal to continue.

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
