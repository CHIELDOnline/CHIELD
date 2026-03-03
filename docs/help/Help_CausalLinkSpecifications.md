
<script type="text/javascript" src="js/visualisation/vis.js"></script>
<link href="css/vis-network.min.css" rel="stylesheet" type="text/css"/>
<script type="text/javascript" src="js/jquery-3.2.1.min.js"></script>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous">
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
<script type="text/javascript">
$(document).ready(function(){
  $("#header").load("header.html", function(){
    $("#HelpHREF").addClass("active");
    createExample1Network();
  }); 
});
</script>

<style type="text/css">
blockquote {
  border-left: 4px solid #dddddd;
  padding: 0 15px;
  color: #777777; }
  blockquote > :first-child {
    margin-top: 0; }
  blockquote > :last-child {
    margin-bottom: 0; }
table {
  padding: 0;border-collapse: collapse; }
  table tr {
    border-top: 1px solid #cccccc;
    background-color: white;
    margin: 0;
    padding: 0; }
    table tr:nth-child(2n) {
      background-color: #f8f8f8; }
    table tr th {
      font-weight: bold;
      border: 1px solid #cccccc;
      margin: 0;
      padding: 6px 13px; }
    table tr td {
      border: 1px solid #cccccc;
      margin: 0;
      padding: 6px 13px; }
    table tr th :first-child, table tr td :first-child {
      margin-top: 0; }
    table tr th :last-child, table tr td :last-child {
      margin-bottom: 0; }
</style>

<div id="header"></div>



# Causal link specification

CHIELD is a database of causal links.  Each record in the database is a particular causal link between two variables which is taken from an academic document.

Below is the specification of how data is stored in CHIELD.

-  Bibtex file specifying the details of the document
-  csv file specifying the causal links
-  Contirbutors file specifying who contributed the data


See the page on [adding data to CHIELD](Help_AddingData.html) for information on how to create these formats.

If you think the specification could be improved, you could [raise an issue](https://github.com/CHIELDOnline/CHIELD/issues/new) (requires a free GitHub account).

# Documents

In CHIELD, Causal links are grouped under **documents**.  These will usually be published journal articles.  

The condition for entry into the database is that the document proposed a hypothesis with causal claims that relates to some part of the evolution of communication and that it is published in a peer-reviewed publication.  This could be either biological or cultural evolution (or both) at any stage in history.

Entry into the database does not mean that the hypothesis is correct nor widely accepted nor even empirically supported.  The aim is not that the database be a single coherent, consistent theory of the evolution of communication, but a reflection of the field.

Potential sources for documents include:

-  [The Language Evolution and Computation Bibliography](http://groups.lis.illinois.edu/amag/langev/)
-  [The Journal of Language Evolution](https://academic.oup.com/jole)
-  [Interaction studies](https://benjamins.com/#catalog/journals/is/main)
-  [EvoLang conferences](http://evolang.org/)

Details of documents are stored in CHIELD in BibTex format.


# Causal links

## Example

Below is an example of a causal link specification for the following claim:

>  "We hypothesise that high temperatures cause more ice-cream consumption, and more ice-cream consumption leads to more shirt stains.":


| Var1 | Relation | Var2 | Cor | Topic | Stage | Type | Confirmed | Notes|
| -----|:--------:|:----:|:---:|:-----:|:-----:|:----:|:--------:|:-----:| 
| temperature | > | ice-cream consumption | pos | food | | hypothesis |  | "high temperatures cause more ice-cream consumption"|
| ice-cream consumption | > | shirt stains | pos | food | | hypothesis |  | "more ice-cream consumption leads to more shirt stains"|

Note that the first node is "temperature", not "high temperature": we can specify the direction of causality in the "Cor" field.

This is equivalent to this causal graph:

<div id="icecream"></div>

<script type="text/javascript">
	  createExample1Network = function(){
	  // create an array with nodes
	  var nodes = new vis.DataSet([
	    {id: 1, label: 'temperature'},
	    {id: 2, label: 'ice-cream consumption'},
	    {id: 3, label: 'shirt stains'}
	  ]);
	  // create an array with edges
      var edges = new vis.DataSet([
        {from: 1, to: 2,
        arrows: {
          to: {
            enabled:true,
            type: "arrow"
          }}},
        {from: 2, to: 3,
        arrows: {
          to: {
            enabled:true,
            type: "arrow"
          }}}
      ]);
	  // create a network
	  var container = document.getElementById('icecream');
	  var data = {
	    nodes: nodes,
	    edges: edges
	  };
		var network_options = {
		    edges: {smooth: false},
		    nodes: {
		       color: {
		        border: "#e92b2b",
		        background: "#ffd2d2",
		        highlight:{
		          border: "#e92b2b",
		          background: "#ffd2d2"},
		        hover: {
		          border: "#e92b2b",
		          background: "#ffd2d2"}
		       }
		    }
		};
	  var network = new vis.Network(container, data, network_options);
	 }
</script>

There are many more examples in the main CHIELD database if you view the details of a particular document.

## Specification

Data for all fields (except the "notes") should be entered as lower-case.


### Source variable (Var 1)

The definition of variables is, at this point, left vague.  This is because they might include a number of different kinds of concepts, depending on the research topic.  For example, some variables might be concrete and measurable such as presence of a genetic allele, but others might represent higher-level concepts like a selection pressure for efficient communication.  Also, variables might measure concepts on different scales, such as the age of an individual or the size of a population.  While this is perhaps conceptually weak, in practice the interpretations are reasonably clear.

Variables with colons will be interpreted as sub-variables of a higher-order variable.  For example, there is a general concept of theory of mind, which could be represented by the variable `theory of mind`.  However, some documents make specific proposals about different levels of theory of mind.  These could be entered as:

-  `theory of mind: level 0`
-  `theory of mind: level 1`
-  `theory of mind: level 2`

The text before the colon must match the higher-order variable, but the text after can be anything (does not have to be "level X").

### Destination variable (Var 2)

The same format as the source variable.  Note that the destination variable cannot be the same as the source variable.

### Relation

The relation between the source variable and the destination variable.

| Syntax  | Meaning           |
| --------|:-------------:| 
| X > Y   | A change in X causes a change in Y | 
| X <=> Y | X and Y Co-evolve | 
| X ~ Y   | X and Y are correlated | 
| X /> Y  | X does not causally influence Y | 
| X >> Y  | X is a necessary precondition for Y | 
| X ~= Y  | X is an indicator of (measured by) Y | 
| X ^ Y   | X exerts an evolutionary selection pressure on Y | 

Note that there are no "left-facing" arrows, but you can just swap the source and destination.

Some of the syntax is borrowed from the [lavaan](http://lavaan.ugent.be/) R package. This package uses "=~" for an *indicator* relationship, but this can cause problems when typing in some spreadsheet applications, so it has been reversed to "~=" (the meaning is the same).

The *selection pressure* relation "^" is an experimental relation type.  It is included to support evolutionary hypotheses.  Often, causal relations apply to immediate or short-term consequences for individuals.  For example, [Dunbar (2004)](http://localhost/CHIELD/Site/document.html?key=dunbar2004gossip) reviews work showing that grooming releases endorphins.  However, sometimes these don't capture the overall message of a theory.  For example, [Dunbar (2004)](http://localhost/CHIELD/Site/document.html?key=dunbar2004gossip) suggests that "the cognitive demands of gossip are the very reason why such large brains evolved in the human lineage".  The implication is not that if an individual gossips more, then their brain gets bigger.  Rather, gossip is useful for forming alliances, which has an effect on fitness.  As a consequence, evolution selects individuals with bigger brains to support more gossip.  This seems like a different kind of causal argument than, for example, grooming releasing endorphins.  Moreover, this seems like a central point for Dunbar, but it is not captured by any of the explicitly mentioned causal links.  The "^" relation is intended for these situations.

### Correlation direction (Cor)

The causal effect can be:

| Cor | Meaning           |
| ----|:-------------:| 
|     | (blank): no specific direction | 
| pos | As X appears or increases, Y appears or increaes (possibly non-linearly) | 
| neg | As X appears or increases, Y disappears or decreaes (possibly non-linearly) | 
| nm  | The relation between X and Y is non-monotonic | 

### Topic

This relates to the topic of the hypothesis (e.g. syntax, semantics, phonetics, genetics, population dynamics etc.).  Topics should be lower-case.  Multiple topics can be entered, seperated by a semicolon ";".

###  Stage

Following [Scott-Phillips & Kirby (2010)](http://www.cell.com/trends/cognitive-sciences/abstract/S13646613(10)00140-3), causal links can be assigned to one of four evolutionary stages:

-  preadaptation
-  coevolution
-  cultural evolution
-  language change

From Scott-Phillips & Kirby (2010):

>  "We can characterise the study of language evolution as being concerned with the emergence of language out of non-language. This involves two main processes of information transmission and change: a biological one (shown here with solid arrows) and cultural one (shown here with dashed arrows). Prior to the existence of a culturally transmitted communication system, we can consider only the various preadaptations for language (e.g. vocal learning, conceptual structure; [47). Once cultural transmission is in place, then it might operate simultaneously with biological evolution in a co-evolutionary process and/or there might be cultural evolution alone [48. In either case, we urgently need a better general understanding of how cultural transmission and social coordination shape language if we are to achieve a complete picture of the evolution of language. Once language has emerged, further changes can and do occur. This is the domain of language change and historical linguistics."
	
	
### Type

The type of evidence used to support the causal link.  This is important information for spotting where causal theories could be more robustly supported.  Note that it need not be supported by direct evidence.

| Type        | Meaning           |
| ------------|:-------------:| 
| experiment  | Quantitative experiment (with conditions and manipulation) |
| review      | Evidence cited from other work |
| model       | Mathematical model |
| simulation  | Computational or experimental simulation |
| statistical | Statistical analysis of data (e.g. cross-cultural typology, corpus, survey). Most often correlational, but could be causal depending on the methods. |
| qualitative | Results of a qualitative study (interviews, observation etc.) |
| logical     | Argument based on logical statements (e.g. argument from first principles, mathematical proofs) |
| hypothesis  | No direct evidence, but a predition or suggestion  |
| other       | Some other type of evidence |

This is a non-exhaustive list, so if you think other categories should be added, you could [raise an issue](https://github.com/CHIELDOnline/CHIELD/issues/new).

### Confirmed

Optinally, you can add whether evidence for the causal link was confirmed.  By default the assumption is that the link is considered to be true.  To mark causal links that have been tested, but no evidence was found (e.g. no significant differences), set this field to "no".  To specify causal links that were shown *not* to be true, set this field to "refuted" (though you can also use the "/>" specification for the Relation field).

### Notes

This field is free text to help understand the causal link.  Ideally, this should be a clear causal statement from the document relating the two variables.  Definitions and citations to other work are also useful here, but readers should refer to the original document rather rely on extensive notes. It could also be a summary or clarification from the coder.


# Contributors

Each document is associated with a contributor file.  These files are used to attribute the contributors and to track changes in the data.  The web interface automatically creates this file, and these will **usually only be changed by administrators** of the GitHub repository.  The file can be used to indicate that one person has created the data, but another (perhaps the original author) has confirmed that it is accurate.

The file is a tab-delimited text files with the following columns (no header):

-  Github username
-  Real name
-  Date (UTC format)
-  Note (optional)

For example:

```
SeannyD	Sean Roberts	Tue Mar 06 2018 14:03:49 GMT+0000 (GMT)	Initial addition of data
SeannyD	Sean Roberts	Tue Mar 07 2018 10:13:22 GMT+0000 (GMT)	Fixed causal link
```

In the GitHub repository, this file is called `contributors.txt` and is stored in the same folder as the document and causal links file.  


