function installSmoothScroll(menuId) {
  var navbarOffset = -1 * $(menuId).height();

  $(".smooth-scroll").on("click", function() {
    var self = this;
    var target = $(self).attr("href");

    $.smoothScroll({
      scrollElement: null,
      offset: navbarOffset,
      scrollTarget: target
    });

    return false;
  });
}

function installStickyNavbar(menuId) {
  // Get the header
  var header = $(menuId);

  // Get the offset position of the navbar
  var headerTopOffset = header.offset().top;

  // When the user scrolls the page, execute myFunction
  window.onscroll = function() {
    if (window.pageYOffset >= headerTopOffset) {
      header.addClass("navbar-fixed-top");
    } else {
      header.removeClass("navbar-fixed-top");
    }
  };
}
