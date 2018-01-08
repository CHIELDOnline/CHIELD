# CHIELD


## Configuring the server side

The python script that uploads data to github requires some parameters.  These are imported from a python script in `app/data/githubConfig.py`.  For security reasons, this is not included in the public repository, and should not be made public (include this file's path in your `.gitignore` file).

The file should set the following parameters:

```
githubUser = "CHIELDOnline"
githubAccessToken = "PasteYourGithubAccessTokenHere"
githubRepoName = "CHIELD"
repository_data_tree_folder = "/app/data/tree/documents/"
```

Github access tokens can be generated [through GitHub](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/).

