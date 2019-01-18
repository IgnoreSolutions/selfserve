/**
 * About random_banner.js
 * 
 * random_banner.js is a small Selfserver plugin designed to randomize the banner image shown
 * on client side.
 * 
 * Created by Mike Santiago
 * Copyright (C) 2019
 * 
 * DO NOT REDISTRIBUTE!!
 */

selfserve.random_banner = {};

window.addEventListener("load", function(event) {
    selfserve.random_banner.randomBannerImage();
}, false);

var __randomBannerTemplate = 
{
    path: "../images/random/6.jpg",
    offset: { x: 0, y: -1090 }
};

var __randomArrayPath = [
    __randomBannerTemplate
];

selfserve.random_banner.addImageToRandom = function addImageToRandom(path, offset)
{
    __randomArrayPath.push({path: path, offset: offset});
}

selfserve.random_banner.randomBannerImage = function randomBannerImage()
{
    selfserve.random_banner.addImageToRandom("../images/random/7.jpg", {x: 0, y: -170});
    selfserve.random_banner.addImageToRandom("../images/random/8.jpg", {x: 0, y: -1000});
    selfserve.random_banner.addImageToRandom("../images/random/9.jpg", {x: 0, y: -780});

    var sizeOfPool = __randomArrayPath.length;
    var randomIndex = Math.floor(Math.random() * sizeOfPool);
    $(".logo-container").css("background-image", `url(${__randomArrayPath[randomIndex].path})`);
    $(".logo-container").css("background-position-x", "100%");
    $(".logo-container").css("background-position-y", `${__randomArrayPath[randomIndex].offset.y}px`);
}