'use strict';

//Open swtcher menu
$('.style-switcher__control').on('click', function () {
    $('.style-switcher').toggleClass('style-switcher--active');
});

//Change monochrome.css to color.css
$('.style-switcher__link--color').click(function (){
    $('link[href="assets/css/monochrome.css"]').attr('href','assets/css/color.css');
});

// btn
$('.style-switcher__link--b').click(function (){
    $('link[href="assets/css/skillbtnb"]').attr('href','assets/css/skillbtnd.css');
});
$('.style-switcher__link--d').click(function (){
    $('link[href="assets/css/skillbtnd"]').attr('href','assets/css/skillbtnb.css');
});

//Change color.css to monochrome.css
$('.style-switcher__link--mono').click(function (){
    $('link[href="assets/css/color.css"]').attr('href','assets/css/monochrome.css');
});