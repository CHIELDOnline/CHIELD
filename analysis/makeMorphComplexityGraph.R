# Build a graph comparing different theories of the relationship between population size and morphological complexity.

# We download the CHIELD database as a set of csv files
# (see https://chield.excd.org/downloads.html)
# then manipulate the list of causal links to select the ones we want to visualise.
# These are passed to custom scripts for producing dot format files.
# The dot files can be openend in GraphViz.

# Set working directory
try(setwd("~/Documents/Bristol/CHIELD/Writeup/IntroPaper/visualisation/"))

# Load scripts for making dot file
source("makeDot.R")

l = read.csv("~/Documents/Bristol/CHIELD/CHIELD_Online/data/db/CausalLinks.csv",
             stringsAsFactors=F, encoding='UTF-8',fileEncoding="UTF-8")
v = read.csv("~/Documents/Bristol/CHIELD/CHIELD_Online/data/db/Variables.csv",
             stringsAsFactors=F, encoding='UTF-8',fileEncoding="UTF-8")
d = read.csv("~/Documents/Bristol/CHIELD/CHIELD_Online/data/db/Documents.csv",
             stringsAsFactors=F, encoding='UTF-8',fileEncoding="UTF-8")

l$citation = d[match(l$bib,d$pk),]$citation
l$Var1 = v[match(l$Var1,v$pk),]$name
l$Var2 = v[match(l$Var2,v$pk),]$name

# This is the string that will load these documents in CHIELD explore mode.
selection = "Atkinson, Smith & Kirby (2016);Berdicevskis & Eckhoff (2016);Bentz & Berdicevskis (2016);Bentz & Winter (2013);Atkinson, Kirby & Smith (2015);Ardell, Anderson & Winter (2016);Lupyan & Dale (2010);Little (2011);Raviv, Meyer & Lev-Ari (2018);Reali, Chater & Christiansen (2014);Cuskley & Loreto (2016);DeLancey (2014);Trudgill (2017);Sinnemäki (2010);Nettle (2012);Wray & Grace (2007);Reali, Chater & Christiansen (2018);Maitz & Németh (2014);Ross (1996);Koplenig (2019)"

#Sinnemäki (2014);
#Tinits, Nölle & Hartmann (2017);
#Bowern (2010);
#Trudgill (2011)

selection = strsplit(selection,";")[[1]]

lx = l[l$citation %in% selection,]

# Remove sub-categories for some labels
# e.g. "morphological complexity: paradigmatic" becomes
#  just "morphological complexity"
simplifyLabels = c("morphological complexity",
                   "phonological complexity")
for(sl in simplifyLabels){
  lx$Var1[grepl(sl,lx$Var1)] = sl
  lx$Var2[grepl(sl,lx$Var2)] = sl
}

# List of nodes to prune
removeNodes = c("cultural selection: learnability",'economic development','compositionality','protolanguage','learning cost','informational autonomy of utterances','radius of communication','learning phonetic boundaries','linguistic variation: between groups','linguistic diversity','vocabulary size','structural complexity','communicative success','shared language','stability','learning exposures','distance from equator','lexical entropy','degree of shared information','preferences in acquisition','borrowing','complexity and diversification')

lx = lx[!lx$Var1 %in% removeNodes,]
lx = lx[!lx$Var2 %in% removeNodes,]

# Rename some nodes for connectivity
renameNodes = function(lx,old,new){
  lx[lx$Var1==old,]$Var1 = new
  lx[lx$Var2==old,]$Var2 = new
  return(lx)
}
renaming = list(
  c("linguistic complexity","morphological complexity"),
  c("degree of esoterogeny","esoterogeny"),
  c("l2 attainment: morphosyntax","L2 attainment: morphosyntax"),
  c("communication with non-native speakers","foreigner-directed speech"),
  c("linguistic input: amount of variation","variation in learning sets"),
  c("proportion of L2 learners","proportion of adult learners")
)
for(i in 1:length(renaming)){
  sel1 = lx$Var1==renaming[[i]][1]
  sel2 = lx$Var2==renaming[[i]][1]
  if(sum(sel1)>0){
    lx[sel1,]$Var1 = renaming[[i]][2]
  }
  if(sum(sel2)>0){
    lx[sel2,]$Var2 = renaming[[i]][2]
  }
}

# Remove measurements
lx = lx[lx$Relation!="~=",]

# Add extra edges
edgesToAdd = list(
  c("morphological irregularity",">","morphological complexity",'pos','Maitz & Németh (2014)'),
  c("inflectional syntheticity",">","morphological complexity",'pos','Maitz & Németh (2014)')#,
 # c("variation in learning sets",">","entropy rate",'pos','Koplenig (2019)')
  )

for(edge in edgesToAdd){
  lx = rbind(lx,rep(NA,ncol(lx)))
  lx[nrow(lx),c("Var1","Relation","Var2","Cor","citation")] = edge
}


# Remove self edges
lx = lx[lx$Var1!=lx$Var2,]

# Swap direction of some edges to place them to the right
lx[lx$Var1=="morphological redundancy" & lx$Var2=="morphological complexity",c("Var1","Relation","Var2")] = 
  c("morphological complexity","<","morphological redundancy")
lx[lx$Var1=="word order" & lx$Var2=="morphological complexity",c("Var1","Relation","Var2")] = 
  c("morphological complexity","<","word order")

lx[lx$Var1=="geographic spread" & lx$Var2=="morphological complexity",c("Var1","Relation","Var2")] = 
  c("morphological complexity","~","geographic spread")
lx[lx$Var1=="linguistic neighbours" & lx$Var2=="morphological complexity",c("Var1","Relation","Var2")] = 
  c("morphological complexity","~","linguistic neighbours")

# Set document colours
cx = rainbow(length(unique(lx$citation)))
set.seed(3289)
cx = sample(cx)
names(cx) = unique(lx$citation)
lx$colour = cx[lx$citation]


# Remove correlations (for clarity)
#correlationRelations = lx[lx$Relation=="~",]
#lx = lx[lx$Relation!="~" | (lx$Var2=="linguistic neighbours") | (lx$Var2=="geographic spread"),]
lx = lx[!(lx$Var1=="population size" & lx$Var2=="morphological complexity" & lx$Relation=="~"),]

# Make simple dot file
dot = makeDot(lx)
cat(dot,file="../results/graphs/MorphComplexity.dot")

# Make dot file that attempts to cluster nodes by document
clusterDot = makeClusterDot(lx, newrank=TRUE)
cat(clusterDot,file="../results/graphs/MorphComplexity_cluster.dot")

# Make dot file that attempts to cluster nodes by document
#clusterDotCor = makeClusterDot(correlationRelations, newrank=TRUE)
#cat(clusterDotCor,file="../results/graphs/MorphComplexity_cluster_correlations.dot")



