<?php
// Get master sha
// create new branch
// create new file and commit to new branch
// (also creates new folder if it does not exist)
// If file exists, add sha to createFile call
// Test filesha to modify file
// For append, get file contents first.
// Build file contents from POST input.
// Test pull request.
// Return pull url
// export sensitive settings to external php file.
// Test edit. Works, but commit title is not right?
// TODO:
// getAURL is not returning file contents

$githubConfigLocation = '../../data/githubConfigCHIELD.php';
if (!file_exists($githubConfigLocation)) {
	$githubConfigLocation = '../../../private/githubConfigCHIELD.php';
}

include_once($githubConfigLocation);

$end_point = 'https://api.github.com';
$repoName = "/CHIELDOnline/CHIELD";

// Get and check variables
$data = json_decode($_POST['json']);
$expectedPostKeys = array("file_key","file_year","CSVContent","BIBContent","CONContent","contributorUsername");

foreach ($expectedPostKeys as &$item) {
	if(!property_exists($data,$item)){
		echo("No data: ".$item);
		exit();
	}
}

// get POST data
$file_key = $data->{'file_key'};
$file_year = $data->{'file_year'};
$CSVContent = $data->{'CSVContent'};
$BIBContent = $data->{'BIBContent'};
$CONContent = $data->{'CONContent'};
$contributorUsername = $data->{'contributorUsername'};

$pullType = "Add";

if(strpos("/", $file_key) !== false){
	// we don't want to place this file anywhere else
	exit();
}

if(strlen($file_key)<4){
	// invalid key
	exit();
}

$repository_data_tree_folder = "data/tree/documents/";
// file_folder should not have slash at end
$file_folder = $repository_data_tree_folder."Unknown/".$file_key;

$yearNum = intval($file_year);
if(($yearNum > 1000) and ($yearNum < 3000)){
	$decade = ((floor($yearNum/10))*10)."s";
	$file_folder = $repository_data_tree_folder.$decade."/".$yearNum."/".$file_key;
}


function gitPOST($curl_url,$data,$method="POST"){
//https://stackoverflow.com/questions/36835116/how-to-create-and-update-a-file-in-a-github-repository-with-php-and-github-api
	global $githubUser;
	global $personal_token;
	$ch = curl_init($curl_url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array( 'User-Agent: '.$githubUser, 'Authorization: token ' . $personal_token ));
	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
	curl_setopt($ch, CURLOPT_POSTFIELDS,json_encode($data));
	$response = curl_exec($ch);  
	curl_close($ch);
	$response = json_decode($response);
	return($response);
}


function getAURL($url) {
	$options = ['http' => ['method' => 'GET','header' => ['User-Agent: PHP']]];
	$context  = stream_context_create($options);
	// (suppress errors)
	$result = @file_get_contents($url, false, $context);
	#if ($result === FALSE) { /* Handle error */ }
	return(json_decode($result,true));
}

function checkPathExists($folder,$file){
	global $end_point;
	global $repoName;
	$folderTree = getAURL($end_point."/repos".$repoName."/git/trees/master:".$folder);
	if(is_null($folderTree)){
		return(false);
	}
	if(is_bool($folderTree)){
		return(false);
	}
	if(array_key_exists("tree",$folderTree)){
		foreach ($folderTree["tree"] as &$item) {
		   if($item["path"]==$file){
				return($item);
		   }
		}
	}
	return(false);
}

function createFile($file_folder,$fileName,$content,$branchName,$append=False){
	global $end_point;
	global $repoName;
	global $githubUser;
	global $personal_token;

  	$data = array("content" => base64_encode($content),
				  "branch"  => $branchName
				);

	// Check if file exists, and add sha to modify if so.
	$fileSHA = checkPathExists($file_folder,$fileName);
	if((!is_bool($fileSHA)) and array_key_exists("sha",$fileSHA)){
		$data["sha"] = $fileSHA["sha"];
		$GLOBALS["pullType"] = "Edit";
		// If we're appending contents,
		if($append){
			// Get file contents
			$r1 = getAURL($fileSHA["url"]);
			$currentContents = $r1["content"];
			// append
			$data["content"] = base64_encode(base64_decode($currentContents)."\n".$content);
		}
	}
	
	// This is the first point we know whether we're editing or adding, 
	// so make commit message here:
	$cmtMsg = $GLOBALS["pullType"]." ".$GLOBALS["file_key"]." by ".$GLOBALS["contributorUsername"];
	$data["message"] = $cmtMsg;
	
	$curl_url = $end_point."/repos".$repoName."/contents/".$file_folder."/".$fileName;
	$response = gitPOST($curl_url,$data,"PUT");
	return($response);

}


$url = 'https://api.github.com/repos'.$repoName.'/branches/master';
$branch = getAURL($url);
$branchSHA = $branch['commit']['sha'];

# create unique branch name
$branchName = "doc_".strval(time());

// create branch
$data = array("ref" => 'refs/heads/'.$branchName, "sha" => $branchSHA);
$curl_url = $end_point."/repos".$repoName."/git/refs";
$response = gitPOST($curl_url,$data);

// Create/update files
$response = createFile($file_folder,$file_key.".csv",$CSVContent,$branchName);
//var_dump($response);

$response = createFile($file_folder,$file_key.".bib",$BIBContent,$branchName);
//var_dump($response);

$response = createFile($file_folder,"contributors.txt",$CONContent,$branchName,True);
//var_dump($response);

// Make pull request
$commitMessage = $pullType." ".$file_key." by ".$contributorUsername;
$commitTitle = $pullType." ".$file_key;

$data = array(  "head" => $branchName, 
				"base" => "master",
				"title" => $commitTitle,
				"body" => $commitMessage);
$curl_url = $end_point."/repos".$repoName."/pulls";
$response = gitPOST($curl_url,$data);

echo($response->{"html_url"});

?>