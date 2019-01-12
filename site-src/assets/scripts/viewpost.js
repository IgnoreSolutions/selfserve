var globalPostObject = undefined;

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

window.onload = function () {
    if (getUrlParameter('id')) {
        var postID = parseInt(getUrlParameter('id'))
        getPost(postID);
        checkPower();
    }
    else
        $("#maincontentarea").append('Bad post ID.');
};

function getPost(postID) {
    $.get(`http://104.248.115.9/blog/getpost?id=${postID}`, function (result, status) {
        var postObject = JSON.parse(result);
        globalPostObject = postObject;

        $.get(`http://104.248.115.9/blog/avatar`, {username: postObject.author.username}, function(result, status, xhr)
        {
            $("#avatar").attr("src",result);
        }).fail(function(){
            $("#avatar").attr("src", "https://static.licdn.com/scds/common/u/images/themes/katy/ghosts/person/ghost_person_200x200_v1.png");
        });

        $(document).attr("title", `${postObject.title} - VSAT ResQ Blog`);

        var parsedDate = new Date(postObject.date);
        var dateStr = `${parsedDate.getMinutes() == 0 ? parsedDate.toDateString() : parsedDate.toUTCString()}`;

        var template = `<div class="media">
                            <img id='avatar' width='10%' class="mr-3" src="https://static.licdn.com/scds/common/u/images/themes/katy/ghosts/person/ghost_person_200x200_v1.png" alt="${postObject.author.username}">
                            <div class="media-body">
                                <h6 class="mt-0">${postObject.title}</h6>
                                posted by ${postObject.author.username} ${dateStr}
                            </div>
                        </div><hr>`
        var disqus = `<div id="disqus_thread"></div>
        <script>
        
        /**
        *  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
        *  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables*/
        /*
        var disqus_config = function () {
        this.page.url = ${location.href};  // Replace PAGE_URL with your page's canonical URL variable
        this.page.identifier = ${postID}; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
        };
        */
        (function() { // DON'T EDIT BELOW THIS LINE
        var d = document, s = d.createElement('script');
        s.src = 'https://vsatresq.disqus.com/embed.js';
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
        })();
        </script>
        <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>`

        var extras = `<hr><button type=\'button\' class='authorized-only-hide' onclick=\'deleteButtonClicked()\'>Delete</button><button type=\'button\' class='authorized-only-hide' onclick=\'editButtonClicked()\'>Edit</button>`;

        $("#postcontent").html(template + `${unescape(decodeURI(postObject.message))}` + extras + disqus);

        $("#post").show();
    }).fail(function () {
        $("#maincontentarea").append("<h2>404</h2><br><br>That post couldn't be found! :(");
    });
}

function showAdminContent() {
    
    $("#deletebutton").show();
    //$("#editbutton").show();
}

function editButtonClicked() {
    var _username = getCookie("username");
    var _token = getCookie("token");
    var _msgID = getUrlParameter('id');

    window.location.href = `http://104.248.115.9/blog/compose?edit=true&id=${_msgID}`;
}

function deleteButtonClicked() {
    if (confirm(`Are you sure you want to delete this post? This cannot be undone or recovered.`)) {
        var _username = getCookie("username");
        var _token = getCookie("token");
        $.post('http://104.248.115.9/blog/deletepost', { id: parseInt(getUrlParameter('id')), username: _username, token: _token }, function (result, status, xhr) {
            if (status == "success") {
                $("#post").hide();
                $("#maincontentarea").append('The post has been deleted successfully.');
            }
            else {
                alert(`Error deleting: ${result}`);
            }
        });
    }
}
/*
function checkPower() {
    var _username = getCookie("username");
    var _token = getCookie("token");
    $.post('http://104.248.115.9/blog/powercheck', { username: _username, token: _token }, function (result, status, xhr) {
        var power = xhr.getResponseHeader('Power');
        userPower = power;
        if (userPower == 1)
            showAdminContent();
    });
}

function checkLoginCookie() {
    var _username = getCookie("username");
    var _token = getCookie("token");
    if ($.trim(_username).length > 0) {
        if ($.trim(_token).length > 0) {
            $.post("http://104.248.115.9/blog/tokencheck", { username: _username, token: _token }, function (result, status, xhr) {
                if (status == "success") {
                    loggedIn = true;
                    changeMainForLogin();
                }
                else {
                    loggedIn = false;
                    changeMainForNoLogin();
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
*/

function changeMainForLogin() {
    $("#loginText").text("User: " + getCookie("username"));
}
