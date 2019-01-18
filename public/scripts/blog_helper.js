/**
 * About blog_helper.js
 * 
 * blog_helper.js includes some helper functions for the blog system.
 * 
 * Created by Mike Santiago
 * Copyright (C) 2019
 * 
 * DO NOT REDISTRIBUTE!
 */

selfserve.global.handleLoginExternally = true;
selfserve.prototype.bloghelper = {userPower = 0};

selfserve.bloghelper.prototype.userCheck = function userCheck(callback) {
    var _username = selfserve.auth.getCookie("username");
    var _token = selfserve.auth.getCookie("token");

    $.post('./userlist', { username: _username, token: _token }, function (result,status,xhr)
    {
        callback(result, status, xhr);
    });
};

selfserve.bloghelper.prototype.logout = function logout() {
    selfserve.auth.setCookie("username", "", 1);
    selfserve.auth.setCookie("token", "", 1);

    window.location.reload(true);
}