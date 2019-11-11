$(function() {

  $(".btn-print").on("click", function() {
    window.print();
  });

  $(".btn-print-modal").on("click", function() {
      $("#printModal").printThis();
  });

});









