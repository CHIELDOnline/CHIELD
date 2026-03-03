<script type="text/javascript" src="js/jquery-3.2.1.min.js"></script>

<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous">

<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>

<script type="text/javascript">
$(document).ready(function(){
  $('#header').load('header.html', function(){
    $('#HelpHREF').addClass('active');
  }); 
});
</script>

<div id="header"></div>


#  Adding data

You can use the web application to add data to CHIELD.  See the instcutions below.

Alternatively, if you are familiar with github, you can fork the [CHIELD repository](https://github.com/CHIELDOnline/CHIELD) and add files to the folder `data/tree/documents/`.  Files for a document are stored in a folder named according to the bibtex reference for the document, within sub-folders corresponding to the decade and year of publication.  See the GitHub repository for examples.

# Adding data using the web application

Go to the [Add Data page](addData.html).  Creating new data is done in four steps:

-  Set your GitHub contributor username
-  Add the bibtex reference
-  Add the causal links
-  Submit your data

## Set your GitHub contributor username

To add data to CHIELD, you'll need a GitHub account.  You can get one for free at [http://github.com/](http://github.com/).

In the "Contributor" tab, type in your GitHub username, and click "Find User".  The "Contributor" panel above should then display your username and your real name.  You can set your real name by [editing your github profile](https://github.com/settings/profile).

## Add the bibtex reference

In the "Reference" tab, paste the bibtex reference for the document into the text box.  The reference must be formatted as a bibtex record.  You can download bibtex records for many publications through e.g. Google Scholar (click the "cite" button, then the "BibTeX" link at the bottom of the popup.  Or you can create your own with tools like [BibDesk](https://bibdesk.sourceforge.io/) or an [online bibtex editor](http://truben.no/latex/bibtex/).

You are encouraged to include the abstact in the bibtex record.

## Add the causal links

In the "Causal Links" tab, there are two ways to add links: through the graphical display and through the tabular display.

###  Add causal links using the graphical network display

The black box at the top of the "Causal Links" tab is a graphical display for visualising the network.  Double click anywhere in the box to **create a new variable**.  A text box will appear where you can type the name of the variable.  A drop-down box of existing variables will help you make a choice, but you can add a new variable if you like.  Press "Enter" to create the variable.

You can also add a variable by typing a variable name in the text box to the top right of the network display box, and then clicking the + icon.

**Draw causal links** between variables by clicking on the source variable, then the destination variable.  You may need to click on the white space to deselect all variables first.  Adding links this way will only work when in *link drawing mode*.  To turn off link drawing mode, click the arrow symbol in the toolbar above the display box.

Note that all links added via the graphical display will be direct causal effects (">").  You can edit this and add other information using the tabular display.

You can drag and drop variables in the display to help see what's going on.

You can zoom in and out using the mouse's scroll wheel.


###  Add causal links using the tabular display

At the bottom of the page is a table that lets you manually enter causal links.  Click the green "+" sign on the far right to add a new row.  You can enter the [causal link specifications](Help_CausalLinkSpecifications.html) here.  When you've finished entering the data for a row, click the green "+" icon in the last column of that row to add it to the table.

You can **edit cells** of existing rows by clicking on the cell, editing the contents, then clicking the green tick icon which appears on the right.  The graphical display will then be updated.  Note you can also open cells for editing by clicking the blue "pencil" icon in the rightmost column of the table.

You can **remove causal links** by finding the relevant row in the table and clicking the red "bin" icon for that row.

###  Add causal links from a csv file

You can download and fill out the [causal links template file](downloads/CausalLinks_Template.csv).  This is a csv file that has the same columns as the tabular display.  

Upload your completed template file by clicking the "Upload csv" button in the toolbar above the display box.  The data in the template file will replace any current data.

## Submit your data

When you have finished creating the data, you can submit it to the github repository by going to the "Submit" tab, and clicking "Submit".  After a moment, you'll be given a link to the GitHub pull request.  This is a request for your data to be added to the database.  After your data is reviewed by one of the database maintainers, your data will be available on CHIELD.