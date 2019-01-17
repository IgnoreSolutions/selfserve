window.addEventListener("load", function(event) {
    randomBannerImage();
}, false);

function random() {
    var x = Math.sin(Date.now()) * 10000;
    return x - Math.floor(x);
}

function random(max) {
    return (Math.floor(random(), max));
}

var __randomBannerTemplate = 
{
    path: "../images/random/6.jpg",
    offset: { x: 0, y: -1090 }
}

var __randomArrayPath = [
    __randomBannerTemplate
];

function addImageToRandom(path, offset)
{
    __randomArrayPath.push({path: path, offset: offset});
}

function randomBannerImage()
{
    addImageToRandom("../images/random/7.jpg", {x: 0, y: -170});
    addImageToRandom("../images/random/8.jpg", {x: 0, y: -1000});
    addImageToRandom("../images/random/9.jpg", {x: 0, y: -780});

    var sizeOfPool = __randomArrayPath.length;
    var randomIndex = Math.floor(Math.random() * sizeOfPool);
    $(".logo-container").css("background-image", `url(${__randomArrayPath[randomIndex].path})`);
    $(".logo-container").css("background-position-x", "100%");
    $(".logo-container").css("background-position-y", `${__randomArrayPath[randomIndex].offset.y}px`);
}