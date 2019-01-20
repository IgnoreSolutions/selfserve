/**
 * About viewpost.js
 * 
 * viewpost.js is designed to encompass any and all functions needed for 
 * retrieving and viewing posts from the blog database.
 * 
 * Created by Mike Santiago
 * Copyright (C) 2018
 * 
 * DO NOT REDISTRIBUTE!
 */

selfserve.viewpost = {
    globalPostObject: undefined,
    titleSuffix: "Psych Cat Blog"
};

window.onload = function () {
    if (selfserve.auth.getUrlParameter('id')) {
        var postID = selfserve.auth.getUrlParameter('id');
        selfserve.viewpost.getPost(postID);
        selfserve.auth.checkPower();
    }
    else
        $("#maincontentarea").append('Bad post ID.');
};

/**
 * Retrieves a post and anything needed along with it given a valid 
 * PostID.
 */
selfserve.viewpost.getPost = function getPost(postID) {
    $.get(`/blog/getpost?id=${postID}`, function (result, status) {
        var postObject = JSON.parse(result);
        globalPostObject = postObject;

        $.get(`/blog/avatar`, {username: postObject.author.username}, function(result, status, xhr)
        {
            $("#avatar").attr("src",result);
        }).fail(function(){
            // TODO: Actually include this ghost person 
            $("#avatar").attr("src", "https://static.licdn.com/scds/common/u/images/themes/katy/ghosts/person/ghost_person_200x200_v1.png");
        });

        $(document).attr("title", `${postObject.title} - ${selfserve.prototype.viewpost.titleSuffix}`);

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
};

selfserve.viewpost.showAdminContent = function showAdminContent() {
    
    $("#deletebutton").show();
    //$("#editbutton").show();
}

selfserve.viewpost.editButtonClicked = function editButtonClicked() {
    var _username = selfserve.auth.getCookie("username");
    var _token = selfserve.auth.getCookie("token");
    var _msgID = selfserve.auth.getUrlParameter('id');

    window.location.href = `/blog/compose?edit=true&id=${_msgID}`;
}

selfserve.viewpost.deleteButtonClicked = function deleteButtonClicked() {
    if (confirm(`Are you sure you want to delete this post? This cannot be undone or recovered.`)) {
        var _username = getCookie("username");
        var _token = getCookie("token");
        $.post('/blog/deletepost', { id: selfserve.auth.getUrlParameter('id'), username: _username, token: _token }, function (result, status, xhr) {
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

// TODO: does this even do anything?
selfserve.viewpost.changeMainForLogin = function changeMainForLogin() {
    $("#loginText").text("User: " + getCookie("username"));
}
