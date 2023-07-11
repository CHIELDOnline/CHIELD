
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



# Help

## Causal graphs

Basics of causal graph theory:

Rohrer, J. M. (2017). Thinking Clearly About Correlations and Causation: Graphical Causal Models for Observational Data. [link](http://journals.sagepub.com/doi/full/10.1177/2515245917745629)

Pearl, J. (2009). Causality. Cambridge university press.

Roberts, S. (2018). Robust, causal and incremental approaches to investigating linguistic adaptation. Frontiers in Psychology, 9, 166. [link](https://www.frontiersin.org/articles/10.3389/fpsyg.2018.00166/abstract)


## Adding data to CHIELD

You can add data and documents to CHIELD yourself.


-  [Adding data to CHIELD](Help_AddingData.html)
-  [Causal Link Specification](Help_CausalLinkSpecifications.html)

## Correcting data on CHIELD

If you see a problem with some of the data in CHIELD, you can raise an issue on the GitHub repository.  First, in another page, log into your Github account.  If you don't have one, you can get one for free on [www.github.com](www.github.com).  

Next, go to the document page in the CHIELD website where you see the problem, and click the "Raise Issue" button.  You'll be directed to a GitHub page where you can request a change.

Alternatively, if you are familiar with GitHub, you can fork the [CHIELD repository](https://github.com/CHIELDOnline/CHIELD) and edit data directly.


## Further help

If you spot a technical problem, you can [raise an issue on the GitHub page](https://github.com/CHIELDOnline/CHIELD/issues/new).  Or you can email the developers (see the [about](about.html) page).