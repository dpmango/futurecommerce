$(document).ready(function() {
  //////////
  // Global variables
  //////////

  var _window = $(window);
  var _document = $(document);

  ////////////
  // READY - triggered when PJAX DONE
  ////////////

  // single time initialization
  legacySupport();
  initaos();
  var easingSwing = [0.02, 0.01, 0.47, 1];

  // on transition change
  // getPaginationSections();
  // pagination();
  // _window.on("scroll", throttle(pagination, 50));
  // _window.on("resize", debounce(pagination, 250));

  function pageReady() {
    initPopups();
    initSliders();
    initParallax();
    initValidations();
    initScrollMonitor();
    initTeleport();
    initTimer();
    initSelectric();
  }

  _window.on("resize", debounce(setBreakpoint, 200));

  // this is a master function which should have all functionality
  pageReady();

  //////////
  // COMMON
  //////////

  // SELECTRIC
  function initSelectric() {
    $("select").selectric({
      disableOnMobile: false,
      nativeOnMobile: false
    });
  }

  function initaos() {
    AOS.init();
  }

  function legacySupport() {
    // svg support for laggy browsers
    svg4everybody();

    // Viewport units buggyfill
    window.viewportUnitsBuggyfill.init({
      force: false,
      refreshDebounceWait: 150,
      appendToBody: true
    });
  }

  // play video
  _document.on("click", "[js-play-video]", function() {
    //as noted in addendum, check for querystring exitence
    var symbol = $("[js-video]")[0].src.indexOf("?") > -1 ? "&" : "?";
    //modify source to autoplay and start video
    $("[js-video]")[0].src += symbol + "autoplay=1";
    $(".video__container").addClass("is-active");
  });

  // HAMBURGER TOGGLER
  _document.on("click", "[js-hamburger]", function() {
    $(this).toggleClass("is-active");
    $(".header__menu").toggleClass("is-active");
    $("body").toggleClass("is-fixed");
    $("html").toggleClass("is-fixed");
  });

  _document.on("click", ".header__menu-link, .header__btn", closeMobileMenu);

  function closeMobileMenu() {
    $("[js-hamburger]").removeClass("is-active");
    $(".header__menu").removeClass("is-active");
    $("body").removeClass("is-fixed");
    $("html").removeClass("is-fixed");
  }

  // header scroll
  _window.on(
    "scroll",
    throttle(function() {
      var scroll = _window.scrollTop();
      var headerHeight = $(".header").height();
      var heroHeight = $(".firstscreen").height();

      if (scroll > headerHeight) {
        $(".header").addClass("is-fixed-start");
      } else {
        $(".header").removeClass("is-fixed-start");
      }
      if (scroll >= heroHeight - headerHeight / 1) {
        $(".header").addClass("is-fixed");
      } else {
        $(".header").removeClass("is-fixed");
      }
    }, 25)
  );

  // Prevent # behavior
  _document
    .on("click", '[href="#"]', function(e) {
      e.preventDefault();
    })
    .on("click", 'a[href^="#section"]', function(e) {
      // section scroll
      var el = $(this).attr("href");
      scrollToSection($(el));
      $("body").removeClass("is-fixed");
      $("html").removeClass("is-fixed");
      return false;
    });

  function scrollToSection(el) {
    var headerHeight = $(".header").height();
    var targetScroll = el.offset().top - headerHeight;

    TweenLite.to(window, 1, {
      scrollTo: targetScroll,
      ease: easingSwing
    });
  }

  ////////////
  // TIMER PLUGIN
  ////////////
  function initTimer(printable) {
    if ($(".timer").length > 0) {
      var countDownDate = new Date("November 16, 2018 09:00:00").getTime();

      // Update the count down every 1 second
      var x = setInterval(function() {
        // Get todays date and time
        var now = new Date().getTime();

        // Find the distance between now an the count down date
        var distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with id="demo"
        document.getElementById("days").innerHTML = days;
        document.getElementById("hours").innerHTML = hours;
        document.getElementById("minutes").innerHTML = minutes;
        document.getElementById("seconds").innerHTML = seconds;

        // If the count down is finished, write some text
        if (distance < 0) {
          clearInterval(x);
          document.getElementById("#days").innerHTML = "EXPIRED";
        }
      }, 1000);
    }
  }

  ////////////
  // TELEPORT PLUGIN
  ////////////
  function initTeleport(printable) {
    $("[js-teleport]").each(function(i, val) {
      var self = $(val);
      var objHtml = $(val).html();
      var target = $(
        "[data-teleport-target=" + $(val).data("teleport-to") + "]"
      );
      var conditionMedia = $(val)
        .data("teleport-condition")
        .substring(1);
      var conditionPosition = $(val)
        .data("teleport-condition")
        .substring(0, 1);

      if (target && objHtml && conditionPosition) {
        function teleport(shouldPrint) {
          var condition;

          if (conditionPosition === "<") {
            condition = _window.width() < conditionMedia;
          } else if (conditionPosition === ">") {
            condition = _window.width() > conditionMedia;
          }

          if (shouldPrint === true) {
            target.html(objHtml);
            self.html("");
          } else {
            if (condition) {
              target.html(objHtml);
              self.html("");
            } else {
              self.html(objHtml);
              target.html("");
            }
          }
        }

        if (printable == true) {
          teleport(printable);
        } else {
          teleport();
          _window.on(
            "resize",
            debounce(function() {
              teleport(printable);
            }, 100)
          );
        }
      }
    });
  }

  //////////
  // ANIMATE FOOTER BUTTON
  //////////

  [].slice
    .call(document.querySelectorAll(".progress-button"))
    .forEach(function(bttn, pos) {
      new UIProgressButton(bttn, {
        callback: function(instance) {
          var progress = 0,
            interval = setInterval(function() {
              progress = Math.min(progress + Math.random() * 0.1, 1);
              instance.setProgress(progress);

              if (progress === 1) {
                instance.stop(pos === 1 || pos === 3 ? -1 : 1);
                clearInterval(interval);
              }
            }, 150);
        }
      });
    });

  //////////
  // POPUP
  //////////

  function initPopups() {
    var startWindowScroll = 0;
    $("[js-popup]").magnificPopup({
      type: "inline",
      fixedContentPos: true,
      fixedBgPos: true,
      overflowY: "auto",
      closeBtnInside: true,
      preloader: false,
      midClick: true,
      removalDelay: 500,
      mainClass: "popup-buble",
      callbacks: {
        beforeOpen: function() {
          startWindowScroll = _window.scrollTop();
          this.st.mainClass = this.st.el.attr("data-effect");
          // $('html').addClass('mfp-helper');
        },
        close: function() {
          // $('html').removeClass('mfp-helper');
          _window.scrollTop(startWindowScroll);
        }
      }
    });
  }

  //////////
  // SLIDERS
  //////////

  function initSliders() {
    // var swiperAnimation = new SwiperAnimation();

    // EXAMPLE SWIPER
    var projectsSwiper = new Swiper("[js-slider-speakers]", {
      // Optional parameters
      direction: "horizontal",
      slidesPerView: 5,
      spaceBetween: 60,
      loop: true,
      navigation: {
        nextEl: ".swiper-button.next",
        prevEl: ".swiper-button.prev"
      },
      freemode: true,
      parallax: true,
      effect: "slide",
      breakpoints: {
        // when window width is <= 768px
        768: {
          slidesPerView: 3,
          spaceBetween: 20
        },
        // when window width is <= 1268px
        1268: {
          slidesPerView: 4,
          spaceBetween: 60
        }
      }
    });

    var servicesSwiper = new Swiper("[js-slider-services]", {
      // Optional parameters
      pagination: {
        el: ".swiper-pagination",
        clickable: true
      },
      slidesPerView: 1,
      paginationClickable: true,
      spaceBetween: 30,
      loop: true,
      mousewheelControl: true,
      effect: "fade",
      // fadeEffect: {
      //   crossFade: true
      // },
      // speed: 600,
      speed: 300,
      on: {
        init: function() {
          // swiperAnimation.init(this).animate();
        },
        slideChange: function() {
          // swiperAnimation.init(this).animate();

          if (!servicesSwiper) return;
          var curSlide = servicesSwiper.realIndex + 1;
          var linkedControl = $(
            '[js-services-nav] a[data-target="' + curSlide + '"]'
          );
          linkedControl.siblings().removeClass("is-active");
          linkedControl.addClass("is-active");
        }
      }
    });

    $("[js-services-nav] a").on("click", function() {
      var index = parseInt($(this).data("target"), 10);
      servicesSwiper.slideTo(index);
    });

    var stagesSwiper = new Swiper("[js-slider-stages]", {
      // Optional parameters
      // pagination: {
      //   el: ".swiper-pagination",
      //   clickable: true,
      //   renderBullet: function(index, className) {
      //     return '<span class="' + className + '">' + (index + 1) + "</span>";
      //   }
      // },
      draggable: false,
      simulateTouch: false,
      slidesPerView: 1,
      paginationClickable: true,
      spaceBetween: 30,
      autoHeight: true,
      loop: true,
      mousewheelControl: true,
      effect: "fade",
      fadeEffect: {
        crossFade: true
      },
      speed: 300,
      on: {
        slideChange: function() {
          if (!stagesSwiper) return;
          var curSlide = stagesSwiper.realIndex + 1;
          var linkedControl = $(
            '[js-stages-nav] a[data-target="' + curSlide + '"]'
          );
          linkedControl.siblings().removeClass("is-active");
          linkedControl.addClass("is-active");
        }
      }
    });

    $("[js-stages-nav] a").on("click", function() {
      var index = parseInt($(this).data("target"), 10);
      stagesSwiper.slideTo(index);
    });

    var gallerySwiper = new Swiper("[js-slider-team-main]", {
      loop: false,
      watchOverflow: false,
      setWrapperSize: true,
      spaceBetween: 0,
      slidesPerView: 1,
      effect: "fade",
      fadeEffect: {
        crossFade: true
      },
      speed: 300,
      on: {
        slideChange: function() {
          if (!gallerySwiper) return;
          var curSlide = gallerySwiper.realIndex;
          $("[js-slider-preview]").slick("slickGoTo", curSlide);
        }
      }
    });

    $("[js-slider-preview]").slick({
      accessibility: false,
      arrows: true,
      infinite: true,
      // infinite: false,
      slidesToShow: 2,
      slidesToScroll: 1,
      vertical: true,
      verticalSwiping: true
    });

    // click to slide for slick fix
    $("[js-slider-preview] .swiper-slide").on("click", function() {
      var index = $(this).data("slide");
      $("[js-slider-preview]").slick("slickGoTo", index - 1);
    });

    $("[js-slider-preview]").on("beforeChange", function(
      event,
      slick,
      currentSlide,
      nextSlide
    ) {
      gallerySwiper.slideTo(nextSlide);
    });

    // var thumbsSwiper = new Swiper("[js-slider-preview]", {
    //   direction: "vertical",
    //   slidesPerView: 2,
    //   // setWrapperSize: true,
    //   autoHeight: true,
    //   // centeredSlides: true,
    //   loop: false,
    //   spaceBetween: 10,
    //   // slideToClickedSlide: true,
    //   slideActiveClass: "is-active",
    //   navigation: {
    //     nextEl: ".swiper-button-next",
    //     prevEl: ".swiper-button-prev"
    //   }
    // });

    // if ($("[js-slider-team-main]").length > 0) {
    //   gallerySwiper.controller.control = thumbsSwiper;
    //   thumbsSwiper.controller.control = gallerySwiper;
    // }
  }

  //////////
  // PARALLAX
  /////////
  function initParallax() {
    $("[js-parallax-scene]").each(function(i, scene) {
      var parallax = new Parallax(scene);
    });
  }

  ////////////////
  // FORM VALIDATIONS
  ////////////////

  $(".js-form select").on("selectric-select", function(
    event,
    element,
    selectric
  ) {
    $(element)
      .parents(".input-container")
      .removeClass("has-error")
      .addClass("clear-label");
  });

  _document.on("click", "li.last", function() {
    $(this)
      .parents(".input-container")
      .addClass("show-input");
  });

  // jQuery validate plugin
  // https://jqueryvalidation.org
  function initValidations() {
    // GENERIC FUNCTIONS
    var validateErrorPlacement = function(error, element) {
      error.addClass("ui-input__validation");
      error.appendTo(element.parents(".input-container"));
    };
    var validateHighlight = function(element) {
      $(element)
        .parents(".input-container")
        .addClass("has-error");
    };

    var validateUnhighlight = function(element) {
      $(element)
        .parents(".input-container")
        .removeClass("has-error");
    };
    var validateSubmitHandler = function(form) {
      $("[js-trigger-thanks-popup]").click();
      $(form)
        .find("input")
        .val("");
      // initSubmit();
      // $.ajax({
      //   type: "POST",
      //   url: $(form).attr("action"),
      //   data: $(form).serialize(),
      //   success: function(response) {
      //     $(form).removeClass("loading");
      //     var data = $.parseJSON(response);
      //     if (data.status == "success") {
      //       // do something I can't test
      //     } else {
      //       $(form)
      //         .find("[data-error]")
      //         .html(data.message)
      //         .show();
      //     }
      //   }
      // });
    };

    var validatePhone = {
      required: true,
      minlength: 11,
      digits: true,
      normalizer: function(value) {
        var PHONE_MASK = "+7 (XXX) XXX-XXXX";
        if (!value || value === PHONE_MASK) {
          return value;
        } else {
          return value.replace(/[^\d]/g, "");
        }
      }
    };

    jQuery.validator.messages.required = "";

    /////////////////////
    // REGISTRATION FORM
    ////////////////////
    $(".js-form").validate({
      errorPlacement: validateErrorPlacement,
      highlight: validateHighlight,
      unhighlight: validateUnhighlight,
      submitHandler: validateSubmitHandler,
      rules: {
        first_name: "required",
        phone: validatePhone,
        email: {
          required: true,
          email: true
        },
        last_name: "required",
        company: "required",
        agreepersonal: "required",
        agreemedia: "required",
        company_size: "required",
        company_duty: "required",
        duty: "required",
        position: "required",
        why_interest: "required",
        what_themes: "required",
        how_use: "required"
      },
      messages: {
        name: "Заполните это поле",
        phone: {
          required: "Заполните это поле",
          minlength: "Введите корректный телефон"
        },
        email: {
          required: "Заполните это поле",
          email: "E-mail содержит неправильный формат"
        },
        secondname: "Заполните это поле",
        company: "Заполните это поле",
        checkbox1: "Заполните это поле",
        checkbox2: "Заполните это поле",
        company_size: "Заполните это поле",
        company_duty: "Заполните это поле",
        duty: "Заполните это поле",
        position: "Заполните это поле",
        why_interest: "Заполните это поле",
        what_themes: "Заполните это поле",
        how_use: "Заполните это поле"
      }
    });

    $(".js-form-feedback").validate({
      errorPlacement: validateErrorPlacement,
      highlight: validateHighlight,
      unhighlight: validateUnhighlight,
      submitHandler: validateSubmitHandler,
      rules: {
        name: "required",
        phone: validatePhone,
        mail: {
          required: true,
          email: true
        },
        secondname: "required"
      },
      messages: {
        name: "Заполните это поле",
        phone: {
          required: "Заполните это поле",
          minlength: "Введите корректный телефон"
        },
        mail: {
          required: "Заполните это поле",
          email: "E-mail содержит неправильный формат"
        },
        secondname: "Заполните это поле"
      }
    });

    $.validator.setDefaults({
      ignore: [] // DON'T IGNORE PLUGIN HIDDEN SELECTS, CHECKBOXES AND RADIOS!!!
    });
  }

  ////////////
  // REVEAL FUNCTIONS
  ////////////
  function initScrollMonitor(fromPjax) {
    $("[js-reveal]").each(function(i, el) {
      var type = $(el).data("type") || "halflyEnterViewport";

      if (type === "halflyEnterViewport") {
        var scrollListener = throttle(function() {
          var vScrollBottom = _window.scrollTop() + _window.height();
          var elTop = $(el).offset().top;
          var triggerPoint = elTop + $(el).height() / 2;

          if (vScrollBottom > triggerPoint) {
            $(el).addClass("is-animated");
            window.removeEventListener("scroll", scrollListener, false); // clear debounce func
          }
        }, 100);

        window.addEventListener("scroll", scrollListener, false);
        return;
      }
    });
  }

  // some plugins get bindings onNewPage only that way
  function triggerBody() {
    $(window).scroll();
    $(window).resize();
  }

  //////////
  // DEVELOPMENT HELPER
  //////////
  function setBreakpoint() {
    var wHost = window.location.host.toLowerCase();
    var displayCondition =
      wHost.indexOf("localhost") >= 0 || wHost.indexOf("surge") >= 0;
    if (displayCondition) {
      var wWidth = _window.width();

      var content = "<div class='dev-bp-debug'>" + wWidth + "</div>";

      $(".page").append(content);
      setTimeout(function() {
        $(".dev-bp-debug").fadeOut();
      }, 1000);
      setTimeout(function() {
        $(".dev-bp-debug").remove();
      }, 1500);
    }
  }
});

// // When the window has finished loading create our google map below
// google.maps.event.addDomListener(window, 'load', init);

// function init() {
//   // Basic options for a simple Google Map
//   // For more options see: https://developers.google.com/maps/documentation/javascript/reference#MapOptions
//   var mapOptions = {
//     zoom: 17,
//     disableDefaultUI: true,
//     center: new google.maps.LatLng(55.797045, 37.537818),
//     styles: [
//       {
//           "featureType": "administrative",
//           "elementType": "all",
//           "stylers": [
//               {
//                   "saturation": "-100"
//               }
//           ]
//       },
//       {
//           "featureType": "administrative.province",
//           "elementType": "all",
//           "stylers": [
//               {
//                   "visibility": "off"
//               }
//           ]
//       },
//       {
//           "featureType": "landscape",
//           "elementType": "all",
//           "stylers": [
//               {
//                   "saturation": -100
//               },
//               {
//                   "lightness": 65
//               },
//               {
//                   "visibility": "on"
//               }
//           ]
//       },
//       {
//           "featureType": "poi",
//           "elementType": "all",
//           "stylers": [
//               {
//                   "saturation": -100
//               },
//               {
//                   "lightness": "50"
//               },
//               {
//                   // "visibility": "simplified"
//               }
//           ]
//       },
//       {
//           "featureType": "road",
//           "elementType": "all",
//           "stylers": [
//               {
//                   "saturation": "-100"
//               }
//           ]
//       },
//       {
//           "featureType": "road.highway",
//           "elementType": "all",
//           "stylers": [
//               {
//                   "visibility": "simplified"
//               }
//           ]
//       },
//       {
//           "featureType": "road.arterial",
//           "elementType": "all",
//           "stylers": [
//               {
//                   "lightness": "30"
//               }
//           ]
//       },
//       {
//           "featureType": "road.local",
//           "elementType": "all",
//           "stylers": [
//               {
//                   "lightness": "40"
//               }
//           ]
//       },
//       {
//           "featureType": "transit",
//           "elementType": "all",
//           "stylers": [
//               {
//                   "saturation": -100
//               },
//               {
//                   "visibility": "simplified"
//               }
//           ]
//       },
//       {
//           "featureType": "water",
//           "elementType": "geometry",
//           "stylers": [
//               {
//                   "hue": "#ffff00"
//               },
//               {
//                   "lightness": -25
//               },
//               {
//                   "saturation": -97
//               }
//           ]
//       },
//       {
//           "featureType": "water",
//           "elementType": "labels",
//           "stylers": [
//               {
//                   "lightness": -25
//               },
//               {
//                   "saturation": -100
//               }
//           ]
//       }
//     ]
//   };

//   var mapElement = document.getElementById('map');
//   var map = new google.maps.Map(mapElement, mapOptions);

//   var marker = new google.maps.Marker({
//     position: new google.maps.LatLng(55.797045, 37.537818),
//     map: map,
//     // title: 'Mail!'
//   });
// }
