/*
 * Magazine sample
 */

function addPage(page, book) {
  var id,
    pages = book.turn("pages");

  // Create a new element for this page
  var element = $("<div />", {});

  // Add the page to the flipbook
  if (book.turn("addPage", element, page)) {
    // Add the initial HTML
    // It will contain a loader indicator and a gradient
    element.html('<div class="gradient"></div><div class="loader"></div>');

    // Load the page
    loadPage(page, element);
  }
}

function loadPage(page, pageElement) {
  // Create an image element

  var img = $("<img />");

  img.mousedown(function (e) {
    e.preventDefault();
  });

  img.load(function () {
    // Set the size
    $(this).css({ width: "100%", height: "100%" });

    // Add the image to the page after loaded

    $(this).appendTo(pageElement);

    // Remove the loader indicator

    pageElement.find(".loader").remove();
  });

  // Load the page

  img.attr("src", "pages/" + page + ".png");
}

// Zoom in / Zoom out

function zoomTo(event) {
  setTimeout(function () {
    if ($(".magazine-viewport").zoom("value") == 1) {
      $(".magazine-viewport").zoom("zoomIn", event);
    } else {
      $(".magazine-viewport").zoom("zoomOut");
    }
  }, 1);
}

// Load large page

function loadLargePage(page, pageElement) {
  var img = $("<img />");

  img.load(function () {
    var prevImg = pageElement.find("img");
    $(this).css({ width: "100%", height: "100%" });
    $(this).appendTo(pageElement);
    prevImg.remove();
  });

  // Loadnew page

  img.attr("src", "pages/" + page + "-large.jpg");
}

// Load small page

function loadSmallPage(page, pageElement) {
  var img = pageElement.find("img");

  img.css({ width: "100%", height: "100%" });

  img.unbind("load");
  // Loadnew page

  img.attr("src", "pages/" + page + ".png");
}

// http://code.google.com/p/chromium/issues/detail?id=128488

function isChrome() {
  return navigator.userAgent.indexOf("Chrome") != -1;
}

/**
 * Updates controls and page number display based on the current page.
 * @param {number} page - The current page number.
 */
function disableControls(page) {
  // Get the total number of pages
  var totalPages = $(".magazine").turn("pages");

  // Cache jQuery selectors for better performance
  var $prevButton = $(".previous-button");
  var $nextButton = $(".next-button");
  var $pageNumber = $(".page-number");
  var $rangeStart = $pageNumber.find(".current-range-start");
  var $rangeEnd = $pageNumber.find(".current-range-end");
  var $separator = $pageNumber.find(".page-separator");

  // Toggle visibility of previous and next buttons based on the current page
  $prevButton.toggle(page !== 1);
  $nextButton.toggle(page + 1 < totalPages);

  // Update the current page range or single page in the page number display
  if (page === 1) {
    $rangeStart.text(1).show();
    $rangeEnd.hide();
    $separator.hide();
  } else if (page >= totalPages) {
    $rangeStart.text(totalPages).hide();
    $rangeEnd.text(totalPages).show();
    $separator.hide();
  } else {
    $rangeStart.text(page).show();
    $rangeEnd.text(page + 1).show();
    $separator.show();
  }

  // Update the total number of pages in the page number display
  $pageNumber.find(".total-pages").text(totalPages);
}

// Set the width and height for the viewport

function resizeViewport() {
  var width = $(window).width(),
    height = $(window).height(),
    options = $(".magazine").turn("options");

  $(".magazine").removeClass("animated");

  $(".magazine-viewport")
    .css({
      width: width,
      height: height,
    })
    .zoom("resize");

  if ($(".magazine").turn("zoom") == 1) {
    var bound = calculateBound({
      width: options.width,
      height: options.height,
      boundWidth: Math.min(options.width, width),
      boundHeight: Math.min(options.height, height),
    });

    if (bound.width % 2 !== 0) bound.width -= 1;

    if (
      bound.width != $(".magazine").width() ||
      bound.height != $(".magazine").height()
    ) {
      $(".magazine").turn("size", bound.width, bound.height);

      if ($(".magazine").turn("page") == 1) $(".magazine").turn("peel", "br");

      $(".next-button").css({
        height: bound.height,
        backgroundPosition: "-38px " + (bound.height / 2 - 32 / 2) + "px",
      });
      $(".previous-button").css({
        height: bound.height,
        backgroundPosition: "-4px " + (bound.height / 2 - 32 / 2) + "px",
      });
    }

    $(".magazine").css({ top: -bound.height / 2, left: -bound.width / 2 });
  }

  var magazineOffset = $(".magazine").offset(),
    boundH = height - magazineOffset.top - $(".magazine").height(),
    marginTop = (boundH - $(".thumbnails > div").height()) / 2;

  if (marginTop < 0) {
    $(".thumbnails").css({ height: 1 });
  } else {
    $(".thumbnails").css({ height: boundH });
    $(".thumbnails > div").css({ marginTop: marginTop });
  }

  if (magazineOffset.top < $(".made").height()) $(".made").hide();
  else $(".made").show();

  $(".magazine").addClass("animated");
}

// Number of views in a flipbook

function numberOfViews(book) {
  return book.turn("pages") / 2 + 1;
}

// Current view in a flipbook

function getViewNumber(book, page) {
  return parseInt((page || book.turn("page")) / 2 + 1, 10);
}

function moveBar(yes) {
  if (Modernizr && Modernizr.csstransforms) {
    $("#slider .ui-slider-handle").css({ zIndex: yes ? -1 : 10000 });
  }
}

// Width of the flipbook when zoomed in

function largeMagazineWidth() {
  return 1300;
}

// decode URL Parameters

function decodeParams(data) {
  var parts = data.split("&"),
    d,
    obj = {};

  for (var i = 0; i < parts.length; i++) {
    d = parts[i].split("=");
    obj[decodeURIComponent(d[0])] = decodeURIComponent(d[1]);
  }

  return obj;
}

// Calculate the width and height of a square within another square

function calculateBound(d) {
  var bound = { width: d.width, height: d.height };

  if (bound.width > d.boundWidth || bound.height > d.boundHeight) {
    var rel = bound.width / bound.height;

    if (
      d.boundWidth / rel > d.boundHeight &&
      d.boundHeight * rel <= d.boundWidth
    ) {
      bound.width = Math.round(d.boundHeight * rel);
      bound.height = d.boundHeight;
    } else {
      bound.width = d.boundWidth;
      bound.height = Math.round(d.boundWidth / rel);
    }
  }

  return bound;
}
