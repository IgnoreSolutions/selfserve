"use strict";
var vsat = { global: { loggedIn: false, handleLoginExternally: false } };
vsat.global.loggedIn = false;
window.addEventListener("load", function (event) {
    hideAuthorizedOnly();
    if (vsat.global.handleLoginExternally === false) {
        checkLoginCookie();
    }
}, false);
function hideAuthorizedOnly() {
    $(".authorized-only").each(function (i, element) {
        $(element).addClass("disabled");
        $(element).css({ "pointer-events": "none" });
    });
    $(".authorized-only-hide").each(function (i, element) {
        $(element).hide();
        $(element).addClass("disabled");
    });
}
function showAuthorizedOnly() {
    $(".authorized-only").each(element => {
        $(element).removeClass("disabled");
        $(element).css({ "pointer-events": "all" });
    });
    $(".authorized-only-hide").each(element => {
        $(element).show();
        $(element).removeClass("disabled");
    });
    $("#nav-compose").removeClass('disabled').css({ "pointer-events": "all" });
    $("#nav-ucp").removeClass('disabled').css({ "pointer-events": "all" });
}
function changeHeaderForLogin() {
    var _username = getCookie("username");
    if (_username.trim() && _username != undefined) {
        $("#login-text").html("User");
        $("#nav-ucp").html(`Settings for ${getCookie('username')}`);
        $("#nav-login").html('Logout');
    }
}
function checkLoginCookie(callback) {
    var _username = getCookie("username");
    var _token = getCookie("token");
    console.log(_username, _token);
    if ($.trim(_username).length > 0) {
        if ($.trim(_token).length > 0) {
            $.post("http://vsatresq.com/blog/tokencheck", { username: _username, token: _token }, function (result, status, xhr) {
                console.log(status);
                if (status == "success") {
                    vsat.global.loggedIn = true;
                    showAuthorizedOnly();
                    changeHeaderForLogin();
                    if (callback !== undefined) {
                        callback();
                    }
                    console.log('logged in successfully.');
                }
                else {
                    vsat.global.loggedIn = false;
                    alert("Error logging in.\n", result);
                }
            });
        }
        else {
            setCookie("username", "", 1);
            setCookie("token", "", 1);
        }
    }
    else {
        //not logged in.
        setCookie("username", "", 1);
        setCookie("token", "", 1);
    }
}
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function checkPower() {
    var _username = getCookie("username");
    var _token = getCookie("token");
    $.post('http://vsatresq.com/blog/powercheck', { username: _username, token: _token }, function (result, status, xhr) {
        var power = xhr.getResponseHeader('Power');
        userPower = power;
        if (userPower == 1)
            showAdminContent();
    });
}
//# sourceMappingURL=logincheck.js.map