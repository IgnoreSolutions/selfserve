/**
 * About auth.js
 * 
 * Auth.js is designed to encompass any and all functions needed for authorizing
 * with the Selfserver server software.
 * 
 * Created by Mike Santiago
 * Copyright (C) 2018
 * 
 * DO NOT REDISTRIBUTE!
 */

/**
 * Creates the initial global variable.
 */
var selfserve = {
    global: {
        loggedIn: false, 
        handleLoginExternally: false, 
        version: "1.0.0-psychcat",
        currentUser: undefined
    },
    auth: {}
}
selfserve.global.loggedIn = false;

window.addEventListener("load", function(event) {
    selfserve.auth.hideAuthorizedOnly();
    if(selfserve.global.handleLoginExternally === false)
    {
        selfserve.auth.checkLoginCookie(undefined);
    }
}, false);

/**
 * Disables any elements with the class authorized-only.
 * 
 * Hides any elements with the class authorized-only-hide
 */
selfserve.auth.hideAuthorizedOnly = function hideAuthorizedOnly() {
    $(".authorized-only").each(function(i, element) {
        $(element).addClass("disabled");
        $(element).css({"pointer-events": "none"});
    });
    $(".authorized-only-hide").each(function(i, element) {
        $(element).hide();
        $(element).addClass("disabled");
    });
};

/**
 * Does the opposite of hideAuthorizedOnly.
 */
selfserve.auth.showAuthorizedOnly = function showAuthorizedOnly() {
    $(".authorized-only").each(element => {
        $(element).removeClass("disabled");
        $(element).css({"pointer-events": "all"});
    });

    $(".authorized-only-hide").each(element => {
        $(element).show();
        $(element).removeClass("disabled");
    });

    $("#nav-compose").removeClass('disabled').css({"pointer-events": "all"});
    $("#nav-ucp").removeClass('disabled').css({"pointer-events": "all"});
};

/**
 * Modifies header objects with the following IDs
 * 
 * #login-text - Changes to the word 'user' to indicate it's been logged in.
 * #nav-ucp - Changes the text to indicate you can change settings for your user.
 * #nav-login - Changes the text to indicate you're able to logout.
 */
selfserve.auth.changeHeaderForLogin = function changeHeaderForLogin() {
    var _username = selfserve.auth.getCookie("username");
    if(_username.trim() && _username != undefined)
    {
        $("#login-text").html("User");
        $("#nav-ucp").html(`Settings for ${selfserve.auth.getCookie('username')}`);
        $("#nav-login").html('Logout');
    }
};

/**
 * Checks the login cookie to see if you've already been logged in and that it hasn't been expired.
 * @param {*} callback - Action to perform once the login cookie has been checked.
 */
selfserve.auth.checkLoginCookie = function checkLoginCookie(callback) {
    var _username = selfserve.auth.getCookie("username");
    var _token = selfserve.auth.getCookie("token");
    console.log(_username, _token);
    if ($.trim(_username).length > 0) {
        if ($.trim(_token).length > 0) {
            //TODO: verify this URL.
            $.post("/blog/tokencheck", { username: _username, token: _token }, function (result, status, xhr) {
                console.log(status);
                if (status == "success") {
                    selfserve.global.currentUser = JSON.parse(result);

                    selfserve.global.loggedIn = true;
                    if(selfserve.global.handleLoginExternally)
                    {
                        callback(result, status, xhr);
                    }
                    else
                    {
                        selfserve.auth.showAuthorizedOnly();
                        selfserve.auth.changeHeaderForLogin();
                        if(callback !== undefined)
                            callback(true); // Just callback to signal we're done/successful.
                    }
                }
                else {
                    selfserve.global.loggedIn = false;
                    callback(false);
                    alert("Error logging in.\n", result);
                }
            });
        }
        else
        {
            selfserve.auth.setCookie("username", "", 1);
            selfserve.auth.setCookie("token", "", 1);
            
        }
    }
    else {
        //not logged in.
        selfserve.auth.setCookie("username", "", 1);
        selfserve.auth.setCookie("token", "", 1);
    }
};

/**
 * Helper function designed to read JS cookies.
 */
selfserve.auth.getCookie = function getCookie(cname) {
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

/**
 * Helper function to write JS cookies.
 */
selfserve.auth.setCookie = function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};

/**
 * Helper function to verify the power of the user. (Able to post or make modifications)
 */
// TODO: add callback and change this to generic function instead of specific
selfserve.auth.checkPower = function checkPower() {
    var _username = selfserve.auth.getCookie("username");
    var _token = selfserve.auth.getCookie("token");
    $.post('/blog/powercheck', { username: _username, token: _token }, function (result, status, xhr) {
        var power = xhr.getResponseHeader('Power');
        userPower = power;
        if (userPower == 1)
            showAdminContent();
    });
};

/**
 * Helper function to retrieve the value of URL parameters given a URL.
 */
selfserve.auth.getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }

    return null;
};

selfserve.auth.loginAs = function loginAs(_username, _password, _remember, callback) {
    if($.trim(_username) && $.trim(_password))
    {
        $.post("./blog/loginnode", {username: _username, password: _password}, function (result, status, xhr) {

            var _token = xhr.getResponseHeader('Authorization');
            if(status == "success")
            {
                selfserve.global.currentUser = result;
                if(callback)    callback(result, status, xhr); // TODO: does this need shit?
                if(_remember === true)
                {
                    selfserve.auth.setCookie("username", _username, 30);
                    selfserve.auth.setCookie("token", _token, 30);
                }
            }
            else // Err
            {
                if(callback)    callback(result, status, xhr);
            }
        })
    }
};