



function recieveGithubUser(response){
	var user = JSON.parse(response);
	if((user.length<3) || (user.login == undefined) || (user.login==null)){
		$("#contributorRealName").html("No user found");
		$("#contributorUserName").html("");
		contributor = "";
		contributor_realName = "";

	} else{
		var username = user.login;
		var realname = user.name;
		if(realname==null){
			realname = username;
		}

		contributor = username;
		contributor_realName = realname;
		
		$("#contributorRealName").html(realname);
		$("#contributorUserName").html(username);
		$('#githubUsernameButton').removeClass('disabled').text("Find User");

		Cookies.set('github.username', contributor);
		Cookies.set('github.realname', contributor_realName);

	}


}

function getGithubUser(username){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		console.log(this.readyState);
		console.log(this.status);
		console.log('---');
		if (this.readyState == 4 && this.status == 200) {
		   recieveGithubUser(xhttp.responseText);
		} else{
			if (this.readyState == 4){
			   $("#contributorRealName").html("No user found");
			   $("#contributorUserName").html("");
			   contributor = "";
			   contributor_realName = "";
			   $('#githubUsernameButton').removeClass('disabled').text("Find User");
			   alert("No user found, check your github username is correct.");
			}
		}
	};
	xhttp.open("GET", "https://api.github.com/users/"+username, true);
	xhttp.send();
}

function checkGithubUser(){
	var username = $("#contributorID").val();
	console.log(username);
	if(username.length>0){
		$('#githubUsernameButton').addClass('disabled').text("Searching...");
		getGithubUser(username);
	}
}

function checkGithubUserCookie(){
	var cookie_user = Cookies.get('github.username');
	var cookie_realname = Cookies.get('github.realname');
	if(cookie_user!=undefined){
		console.log("Cookie: "+cookie_user);
		
		contributor = cookie_user;
		contributor_realName = cookie_realname;

		$("#contributorRealName").html(cookie_user);
		$("#contributorUserName").html(cookie_realname);
	}
}