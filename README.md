# CHIELD


## Configuring the server side


The folder `app/data` should be deployed to the private folder of your web server.
The folder `app/Site` should be deployed to the public folder of your web server.

The script `deploy.sh` is designed to do this automatically.  It requres some shell variables to be set, which it sources from `deploy_config.sh` (for security and configuration reasons this file is not included in the repository):

```
server_public_folder="/path/to/public/CHIELD/Site/"
server_private_folder="/path/to/private/CHIELD/data/"
path_to_python="/path/to/python"
```

The `path_to_python` variable should be set to the absolute path of the python executable.  This can be found by running `which python`.  (on my mac it was `/Library/Frameworks/Python.framework/Versions/3.5/bin/python3`)

The python script that uploads data to github requires some parameters.  These are imported from a python script in `app/data/githubConfig.py`.  For security reasons, this is not included in the public repository, and should not be made public (include this file's path in your `.gitignore` file).

The file should set the following parameters:

```
githubUser = "CHIELDOnline"
githubAccessToken = "PasteYourGithubAccessTokenHere"
githubRepoName = "CHIELD"
repository_data_tree_folder = "/app/data/tree/documents/"
```

Github access tokens can be generated [through GitHub](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/).

