#!/usr/bin/python

# TODO: make sure bibref has no illegal characters

from github import Github
import json
from os import listdir, remove
from math import floor
from shutil import copyfile
from time import time


# Default Parameters
repository_data_tree_folder = ""
githubUser = ""
githubAccessToken = ""
githubRepoName = ""

from githubConfig import *

if githubUser=="":
	print("Error: Github config not set, expecting a file 'githubConfig.py' with settings for 'githubUser', 'githubAccessToken', and 'githubRepoName'")
	quit()


def findFilesToProcess():
	files = listdir("newRecords/")
	files = [x for x in files if x.endswith(".txt")]
	return files

			
def processFile(file):

	file_path = "newRecords/"+file
	processed_file_path = "processedRecords/"+file

	# Read file
	data = ""
	with open(file_path) as fp:
		for line in fp:
			data += line

	data = data.split("\n")
#	contributor + "\n" + bib_key+"\n"+bib_year+"\n"+bib_source_processed+"\n";
	contributor = data[0]
	bibref = data[1]
	bib_year = data[2]
	bib_source = data[3].replace('--newline--',"\n")
	causal_links = "\n".join(data[4:])
	
	githubFolder = getFolder(bibref, bib_year)
	
	# create unique branch name
	branchName = "doc_"+bibref+str(int(round(time()*1000)))
	
	#print(branchName)
	#print(githubFolder)
	
	#print(bib_year)
	
	#print(contributor)
	#print(bib_source)
	#print(causal_links)
	
	createBranch(branchName)
	
	# Bibtex file
	createFile(githubFolder + bibref+".bib","Add "+bibref, bib_source, branchName)
	# Causal links
	createFile(githubFolder + bibref+"_links.csv","Add "+bibref, causal_links, branchName)
	# Contributor
	createFile(githubFolder + "contributors.txt", "Add contributors", contributor, branchName)
	
	# Create pull request
	pull = createPullRequest("Add "+bibref, "Add "+bibref+" from "+contributor,branchName)
	
	pull_url = "https://github.com/"+githubUser + "/" + githubRepoName + "/pull/" + str(pull.number)
	
	print(pull_url)
	
	# Copy php file to processed folder
	copyfile(file_path, processed_file_path)
	#remove(file_path)
			
			
def getFolder(bibref,year):
# 	  getFolder = function(bibref, year){
# 	  if(is.na(year)){
# 		return(paste("Unknown",bibref,sep="/"))
# 	  } else{
# 		decade = paste0(floor(year/10)*10,"s")
# 		return(paste(decade,year,bibref,sep="/"))
# 	  }
# 	}

	try:
		year_num = int(year)
		decade = str(floor(year_num/10)*10) + "s"
		folder = repository_data_tree_folder + decade + "/" + str(year) + "/" + bibref + "/"
		
	except:
		folder = repository_data_tree_folder + "Unknown/"+bibref+"/"
	return folder
	


def createBranch(target_branch):
	sb = repo.get_branch("master")
	repo.create_git_ref(ref='refs/heads/' + target_branch, sha=sb.commit.sha)
	#print("Created branch "+target_branch + ":" + sb.commit.sha)

def createFile(file_path,commit_title,content, target_branch):
	repo.create_file(file_path, commit_title, content, target_branch)

def createPullRequest(pull_title, pull_request_text,target_branch):
	pull = repo.create_pull(title=pull_title, body=pull_request_text, base="master",head=target_branch)
	return(pull)

	# This code actually merges the branches
	#head = repo.get_branch(target_branch)
	#merge_to_master = repo.merge("master", head.commit.sha, "merge to master")


############


files = findFilesToProcess()
if len(files)>0:
	#print("processing:"+",".join(files))
	g = Github(githubUser, githubAccessToken)
	repo = g.get_user().get_repo(githubRepoName)
	
for file in files:
	processFile(file)


# Instance of github with authentication
#g = Github("seannyD", "XXX")

# GetRepo
#repo = g.get_user().get_repo("CHIELD_test")
	
#sendToGithub(repo, file_path="/test17.txt",content="mycontnet2", 
#				commit_title="File commit", pull_title="pull title", 
#				pull_request_text = "pull request text")