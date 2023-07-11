#!/usr/bin/python

from github import Github
import sys


# Incoming args already have "issue/" folder prefix
files_to_process = sys.argv[-3:]
if len(files_to_process)==3:
	body_text_file = files_to_process[0]
	f0 = open(body_text_file)
	body_text = f0.read()
	f0.close()

	labels_file = files_to_process[1]
	f1 = open(labels_file)
	label = f1.read()
	f1.close()

	title_file = files_to_process[2]
	f2 = open(title_file)
	title = f2.read()
	f2.close()



# Default Parameters
repository_data_tree_folder = ""
githubUser = ""
githubAccessToken = ""
githubRepoName = ""

# import configuration variables
from githubConfig import *

if githubUser=="":
	print("Error: Github config not set, expecting a file 'githubConfig.py' with settings for 'githubUser', 'githubAccessToken', and 'githubRepoName'")
	quit()


g = Github(githubUser, githubAccessToken)
repo = g.get_user().get_repo(githubRepoName)

issue = repo.create_issue(title=title, body=body_text, labels=[label])
	
print(issue.html_url)