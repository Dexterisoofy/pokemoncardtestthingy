/* JS for Decks nav item in desktop view */
jQuery('#deck-nav-item a').on('click', function () {
    jQuery('#deck-dropdown').toggleClass('show');
    jQuery('#deck-nav-item > a').toggleClass('focus');
    jQuery('#deck-nav-item > a').find('i.chevrondown').toggleClass('focus');

    // get the DOMRect height of the deck dropdown menu
    const deckDropdownMenu = document.querySelector('#deck-dropdown > div.d-flex > div:first-child');
    const rectHeight = deckDropdownMenu.getBoundingClientRect().height;

    // set the height of the deck category items div and put vertical scroll
    const deckCategoryItems = document.querySelector('.deck-category-submenu');
    deckCategoryItems.style.height = `${rectHeight}px`;
    deckCategoryItems.style.overflow = 'hidden auto';

    // apply border-radius to the top-right and bottom-right of the parent div of the deck category items div so that the scrollbar will have rounded corners
    const deckCategoryMenu = document.querySelector('.first-submenu');
    deckCategoryMenu.style.borderTopRightRadius = '16px';
    deckCategoryMenu.style.borderBottomRightRadius = '16px';
});
jQuery('.not-deck-nav a, .not-deck-nav button').on('click', function () {
    if (jQuery('#deck-dropdown').hasClass('show') && jQuery('#deck-nav-item > a').hasClass('focus') && jQuery('#deck-nav-item > a').find('i.chevrondown').hasClass('focus')) {
        jQuery('#deck-dropdown').removeClass('show');
        jQuery('#deck-nav-item > a').removeClass('focus');
        jQuery('#deck-nav-item > a').find('i.chevrondown').removeClass('focus');
    }
});
jQuery('html').on('click', function (e) {
    if (!jQuery('#deck-nav-item a').is(e.target) 
        && jQuery('#deck-nav-item a').has(e.target).length === 0 
        && jQuery('.show').has(e.target).length === 0
    ) {
        jQuery('#deck-dropdown').removeClass('show');
        jQuery('#deck-nav-item > a').removeClass('focus');
        jQuery('#deck-nav-item > a').find('i.chevrondown').removeClass('focus');
    }

    // this is for closing the account menu on mobile view when clicking/touching anywhere other than btn-account-mobile
    if (!jQuery('#btn-account-mobile').is(e.target)
        && jQuery('#btn-account-mobile').has(e.target).length === 0
    ) {
        jQuery('#account-menu-mobile').removeClass('show');
    }
});
jQuery('#deck-categories').on('click enter', function () {
    if (jQuery('.second-submenu').hasClass('expand')) {
        jQuery('.deck-search-submenu').removeClass('show');
        jQuery('.second-submenu').removeClass('expand');
    }
    setTimeout(() => {
        jQuery('.first-submenu').toggleClass('expand');
        jQuery('.deck-category-submenu').toggleClass('show');
    }, 100);
}).on('keyup', function (e) {
    if (e.which === 13) {
        $(this).trigger('enter');
    }
});
jQuery('#advanced-deck-search').on('click enter', function () {
    if (jQuery('.first-submenu').hasClass('expand')) {
        jQuery('.deck-category-submenu').removeClass('show');
        jQuery('.first-submenu').removeClass('expand');
    }
    setTimeout(() => {
        jQuery('.second-submenu').toggleClass('expand');
        jQuery('.deck-search-submenu').toggleClass('show');
    }, 100);
}).on('keyup', function (e) {
    if (e.which === 13) {
        $(this).trigger('enter');
    }
});
/* END */

/* JS for navbar in mobile view */
jQuery('#decks-nav-item a').on('click', function () {
    jQuery('#decks-dropdown-menu').toggleClass('is-open');
    jQuery(this).find('.chevrondown').toggleClass('rotate-up');
});
jQuery('#deck-categories-sub-nav-item').on('click', function () {
    jQuery(this).find('.chevrondown').toggleClass('rotate-up');
    jQuery('#deck-categories-submenu').toggleClass('is-open');
});
jQuery('#advanced-deck-search-sub-nav-item').on('click', function () {
    jQuery(this).find('.chevrondown').toggleClass('rotate-up');
    jQuery('#advanced-deck-search-submenu').toggleClass('is-open');
})
jQuery('#md-sub-nav-item').on('click', function () {
    jQuery(this).find('.chevrondown').toggleClass('rotate-up');
    jQuery('#md-submenu-mobile').toggleClass('is-open');
})

jQuery('#articles-nav-item a').on('click', function () {
    jQuery('#articles-dropdown-menu').toggleClass('is-open');
    jQuery(this).find('.chevrondown').toggleClass('rotate-up');
});

jQuery('#card-database-nav-item a').on('click', function () {
    jQuery('#card-database-dropdown-menu').toggleClass('is-open');
    jQuery(this).find('.chevrondown').toggleClass('rotate-up');
});

jQuery('#community-nav-item a').on('click', function () {
    jQuery('#community-dropdown-menu').toggleClass('is-open');
    jQuery(this).find('.chevrondown').toggleClass('rotate-up');
});

jQuery('#premium-nav-item a').on('click', function () {
    jQuery('#premium-dropdown-menu').toggleClass('is-open');
    jQuery(this).find('.chevrondown').toggleClass('rotate-up');
});

jQuery('#random-nav-item a').on('click', function () {
    jQuery('#random-dropdown-menu').toggleClass('is-open');
    jQuery(this).find('.chevrondown').toggleClass('rotate-up');
});

jQuery('#btn-account-mobile').on('click', function () {
    jQuery('#account-menu-mobile').toggleClass('show');
});

jQuery('#btn-collapsed-navbar').on('click', function () {
    if (jQuery('#mobile-nav').hasClass('show')) {
        jQuery('.navbar-menu-mobile').slideUp(300);
        jQuery(this).find('#collapsed-navbar-icon').addClass('collapsed');
        setTimeout(() => {
            jQuery('#mobile-nav').removeClass('show');
            jQuery('body').removeClass('mobile-navbar-menu-opened'); // enable scrolling of the body tag (mobile/tablet view)
        }, 310);
    } else {
        jQuery('#mobile-nav').addClass('show');
        jQuery('.navbar-menu-mobile').slideDown(300);
        jQuery('body').addClass('mobile-navbar-menu-opened'); // disable scrolling of the body tag (mobile/tablet view)
        jQuery(this).find('#collapsed-navbar-icon').removeClass('collapsed');
    }
});
/* END */

// Close opened navbar menu on mobile view if clicked/tapped "outside" it
jQuery(document).ready(function () {
    if (window.innerWidth < 983) {
        jQuery(document).click(function (event) {
            // Condition will always be true because the user is just clicking/tapping this element (div.navbar-menu-mobile)
            // As long as the mobile navbar menu isn't fully expanded within the available viewport height, it can be closed
            if (jQuery(event.target).hasClass('navbar-menu-mobile')) {
                jQuery('.navbar-menu-mobile').slideUp(300);
                setTimeout(() => {
                    jQuery('#mobile-nav').removeClass('show');
                    jQuery('body').removeClass('mobile-navbar-menu-opened');
                }, 310);
                jQuery('#collapsed-navbar-icon').addClass('collapsed');
            }
        });
    }
});
