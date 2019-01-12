var editModeEnabled = false;
vsat.global.handleLoginExternally = true;

var getUrlParameter = function getUrlParameter(sParam) {
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

window.addEventListener("load", function(event) {
    $("#edit-area").hide();
    hideAuthorizedOnly();
    checkLoginCookie(function() {
        showAuthorizedOnly();
        changeMainForLogin();
        CKEDITOR.replace('editor');
    })
});

function editMode()
{
    var editId = parseInt(getUrlParameter('id'));
    if(editId)
    {
        $.get(`http://vsatresq.com/blog/getpost?id=${editId}`, function (result, status) {
            var postObject = JSON.parse(result);
            $("#title_text").val(postObject.title);
            CKEDITOR.instances.editor.setData(unescape(decodeURI(postObject.message)));
        });
    }
    else
    {
        $("#editor-container").hide();
        $("#maincontentarea").html('Invalid post id to edit.');
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
    $.post('http://vsatresq.com/blog/powercheck', {username: _username, token: _token}, function(result,status,xhr)
    {
        var power = xhr.getResponseHeader('Power');
        userPower = power;
        if(userPower == 1)
            showAdminContent();
    });
}

function previewButtonClick()
{
    if(vsat.global.loggedIn === false)
        return;
    var win = window.open("", "VSAT Preview", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=780,height=400,top="+(screen.height-400)+",left="+(screen.width-840));
    var previousHtml = "<img width='10%' height='auto' src='https://static.licdn.com/scds/common/u/images/themes/katy/ghosts/person/ghost_person_200x200_v1.png'>";
    previousHtml += `<span style='padding: 6px;'>Post by ${getCookie('username')}</span>`;
    //win.document.body.innerHTML = previousHtml + $("#editor").val();
    win.document.body.innerHTML = previousHtml + CKEDITOR.instances.editor.getData();
}

function submitButtonClick()
{
    if(vsat.global.loggedIn === false)
        return;
    var _username = getCookie('username'),
        _token = getCookie('token');
    var postJson = {
        title: $("#title_text").val(),
        message: CKEDITOR.instances.editor.getData(),
        author: _username,
        token: _token,
        id: undefined
    }

    var url = "http://vsatresq.com/blog/post";
    if(editModeEnabled)
    {
        url = "http://vsatresq.com/blog/editpost"
        postJson.id = parseInt(getUrlParameter('id'));
    }

    $.post(url, postJson, function(result, status, xhr)
    {
        console.log(status);
        if(status == 'success')
        {
            var newPostID = xhr.getResponseHeader('PostID');
            $("#editorcontainer").hide();
            if(editModeEnabled)
                $("#maincontentarea").html(`Post was edited successfully! <a href='../viewpost?id=${newPostID}'>Check it out here!</a>`);
            else
                $("#maincontentarea").html(`Post was made successfully! <a href='../viewpost?id=${newPostID}'>Check it out here!</a>`)
        }
    }).fail(function(err){alert(JSON.stringify(err));});
}

function changeMainForLogin()
{
    $("#login-message").hide();
    $("#edit-area").show();
    $("#preview-button").show();
    $("#submit-button").show();
    if(getUrlParameter('edit'))
    {
        editModeEnabled = true;
        editMode();
    }
}
