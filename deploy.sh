#!/bin/bash

path_to_python="python"

source deploy_config.sh

# Re-create the database from the tree structure

cd processing
R -f TreeToDatabase.R
cd ..

# Copy the sqlite database and downloadable csv files to the local app:
cp -R data/db/ app/data/db/

# Copy the local app public folder to the server public folder:
cp -R app/Site/ $server_public_folder

# Copy the local app private folder to the server private folder:
cp -R app/data/ $server_private_folder

# Set the right permissions
chown _www ${server_private_folder}newRecords
chown _www ${server_private_folder}processedRecords

# Need to update the python path for php to work
sed -i "" -e "s#path_to_python#${path_to_python}#g" ${server_public_folder}php/sendNewRecord.php