$(function () {

    // ------------------------------------------------------- //
    // Navbar
    // ------------------------------------------------------ //
    $(window).scroll(function () {
        if ($(window).scrollTop() > 0) {
            $('nav.navbar').addClass('active');
            $('nav.navbar .navbar-btn').removeClass('btn-outline-light').addClass('btn-primary');
        } else {
            $('nav.navbar').removeClass('active');
            $('#navigation').removeClass('in');
            $('nav.navbar .navbar-btn').addClass('btn-outline-light').removeClass('btn-primary');
        }
    });

    $('.navbar-toggler').click(function () {
        if (!$('nav.navbar').hasClass('active')) {
            $('nav.navbar').addClass('active');
        }
    });

    $('.navbar .link-scroll').click(function () {
        $('#navigation').removeClass('in');
    });

    // ---------------------------------------------- //
    // Scroll Spy
    // ---------------------------------------------- //
    $('body').scrollspy({
        target: '.navbar',
        offset: 120
    });

    // ---------------------------------------------- //
    // Preventing URL update on navigation link click
    // ---------------------------------------------- //
    $('.link-scroll').bind('click', function (e) {

        e.preventDefault();

        var anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $(anchor.attr('href')).offset().top - 80
        }, 1000);
    });



    // ------------------------------------------------------- //
    // Stories Slider
    // ------------------------------------------------------ //
    $('.stories-slider').owlCarousel({
        loop: true,
        margin: 20,
        dots: true,
        nav: true,
        navText: [
            "<i class='fa fa-angle-left'></i>",
            "<i class='fa fa-angle-right'></i>"
        ],
        responsiveClass: true,
        responsive: {
            0: {
                items: 1,
                nav: true
            },
            600: {
                items: 1,
                nav: false
            },
            1000: {
                items: 1,
                nav: true,
                loop: false
            }
        }
    });


    // ------------------------------------------------------- //
    // Testimonials Slider
    // ------------------------------------------------------ //
    $('.testimonials-slider').owlCarousel({
        loop: true,
        margin: 20,
        dots: true,
        nav: false,
        responsiveClass: true,
        responsive: {
            0: {
                items: 1
            },
            600: {
                items: 1
            },
            1000: {
                items: 1
            }
        }
    });

    // ------------------------------------------------------ //
    // Contact form validation
    // ------------------------------------------------------ //
    $('#contact-form').validate({
        messages: {
            username: 'please enter your name',
            useremail: 'please enter your email address',
            message: 'please enter your message'
        }
    });


    // ------------------------------------------------------ //
    // Hiding Form labels on focus
    // ------------------------------------------------------ //
    $('#contact-form input, #contact-form textarea').blur(function () {
        if ($(this).val() === '') {
            $(this).siblings('label').show();
        } else {
            $(this).siblings('label').hide();
        }
    });

    $('#contact-form input, #contact-form textarea').keydown(function () {
        $(this).siblings('label').hide();
    });

    // ------------------------------------------------------- //
    // MagnificPopup initialization
    // ------------------------------------------------------ //
    $('.gallery-holder').magnificPopup({
      delegate: 'a', // child items selector, by clicking on it popup will open
      type: 'image',
      gallery: {
			enabled: true,
			navigateByImgClick: true,
			preload: [0,1] // Will preload 0 - before current, and 1 after the current image
		}
    });



    var stylesheet = $('link#theme-stylesheet');
    $( "<link id='new-stylesheet' rel='stylesheet'>" ).insertAfter(stylesheet);
    var alternateColour = $('link#new-stylesheet');

    if ($.cookie("theme_csspath")) {
        alternateColour.attr("href", $.cookie("theme_csspath"));
    }

    $("#colour").change(function () {

        if ($(this).val() !== '') {

            var theme_csspath = 'css/style.' + $(this).val() + '.css';

            alternateColour.attr("href", theme_csspath);

            $.cookie("theme_csspath", theme_csspath, { expires: 365, path: document.URL.substr(0, document.URL.lastIndexOf('/')) });

        }

        return false;
    });

});
