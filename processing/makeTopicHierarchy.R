# Take the file topicHierarchy.tab and convert to JSON nested format
#  Note this could probably be done much easier just by adding a JSON bracket to each line of the text file?

library(RJSONIO)

try(setwd("~/Documents/Bristol/CHIELD/CHIELD_Online/processing/"))

# use readLines to work out max depth
# (because read.delim will misalign columns without this info)
h= readLines("../data/tabular/topicHierarchy.tab", encoding = "UTF-8")
maxDepth = max(sapply(strsplit(h,"\t"),length))

h = read.delim2("../data/tabular/topicHierarchy.tab",sep="\t",header = F,fileEncoding = "UTF-8",encoding = "UTF-8",as.is=T,col.names = paste0("V",1:maxDepth))

# Turn tabbed list into table with all rows filled out
columnsWithData = which(apply(h,2,function(X){sum(X!="")>0}))
h = h[,columnsWithData]

rowsWithData = which(apply(h,1,function(X){sum(X!="")>0}))
h = h[rowsWithData,]

#h$leaf = (h[,ncol(h)]!="")

depth = function(row){
  max(which(row!=""))
}

# Identify leaf nodes 
# (basically any node where the next line has 
#  the same or higher indent)
h$leaf = TRUE
hcols = 1:(ncol(h)-1)
for(i in 1:(nrow(h)-1)){
  if(depth(h[i,hcols]) < depth(h[i+1,hcols])){
    h[i,]$leaf = FALSE
  }
}

# Fill in columns so that higher tiers
#  get copied into all rows
for(i in 2:nrow(h)){
  maxCol = max(which(h[i,1:(ncol(h)-1)]!=""))
  for(j in 1:maxCol){
    if(h[i,j]==""){
        h[i,j] = h[i-1,j]
    }
  }
}
h = h[h$leaf,]

## Filter hierarchy to only those included in CHIELD
## (Alternative is to add rest to "unclassified")
l = read.csv("../data/db/CausalLinks.csv",stringsAsFactors = F,encoding = "UTF-8",fileEncoding = "UTF-8")
Ctopics = (l$Topic)
Ctopics = unlist(strsplit(Ctopics,";"))
Ctopics = gsub(" +$","",Ctopics)
Ctopics = gsub("^ +","",Ctopics)
Ctopics = unique(topics[!is.na(Ctopics)])
# Capitalise first letter
#Ctopics = tolower(Ctopics)
#Ctopics = sapply(Ctopics,function(X){
#  X = strsplit(X,"")[[1]]
#  X[1] = toupper(X[1])
#  paste(X,collapse="")
#})
Ctopics = Ctopics[!is.na(Ctopics)]
# All leaves in hierarchy
hLeaves = apply(h,1,function(X){
  X[depth(X[1:(length(X)-1)])]
})

filterHierarchy=FALSE
if(filterHierarchy){
  h = h[sapply(hLeaves,function(X){tolower(X) %in% tolower(Ctopics)})]
}

# Add topics not in hierarchy to "unclassified"
unc = Ctopics[!Ctopics %in% hLeaves]
uncm = matrix("",nrow = length(unc),ncol=ncol(h))
uncm[,1]="Unclassified"
uncm[,2]=unc
uncm[,ncol(uncm)] = TRUE
colnames(uncm) = names(h)
h = rbind(h,uncm)

# Turn data frame into nested JSON:
makeList<-function(x){
  isInternalNode = FALSE
  if(ncol(x)>2){
    if(sum(x[,2:ncol(x)]!="")>0){
      isInternalNode = TRUE
    }
  }
  if(isInternalNode){
    listSplit<-split(x[-1],x[1],drop=T)
    lapply(names(listSplit),function(y){
      list(
        label=y,
        children=makeList(listSplit[[y]]))
      })
  }else{
    lapply(seq(nrow(x[1])),function(y){
      list(
        leaf="true",
        label=x[,1][y]
        )
      })
  }
}


h2 = makeList(h[,1:(ncol(h)-1)])


jsonOut<-toJSON(list(label="Topics",
                     expanded="true",
                     children=h2),
                pretty = T)
cat(jsonOut, file="../app/Site/json/topicHierarchy.json")
