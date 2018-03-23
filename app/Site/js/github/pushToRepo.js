
// This is not used, since you need a password.
// We're using the server-side python solution instead.


//by appending these parameters to the URL you can prefill some fields:

//    filename: the file name
//    value: the file content
//    message: commit title
//    description: commit description


// https://github.com/seannyD/CHIELD_test/new/master/newFolder/newFile.txt?filename=newFile.txt&value=CONTENT&message=MESS&description=DESC


function githubWriteFile(){
	// Creates a new instance of the Github object exposed by Github.js
	var github = new GitHub({
	   username: 'seannyD',
	   password: 'XXXXXX'
	   /* also acceptable:
		  token: 'MY_OAUTH_TOKEN'
		*/
	});
 
	// Creates an object representing the repository you want to work with
	var repository = github.getRepo('seannyD', 'CHIELD_test');

	console.log(repository);

	// Creates a new file (or updates it if the file already exists)
	// with the content provided
	repository.writeFile(
	   'master', // e.g. 'master'
	   'test2.txt', // e.g. 'blog/index.md'
	   'ONE TWsaO THREE', // e.g. 'Hello world, this is my new content'
	   'Add data 2', // e.g. 'Created new index'
	   function(err) {}
	);
}


$(document).ready(function(){

console.log("START");



});