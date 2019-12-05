library(RJSONIO)

try(setwd("~/Documents/Bristol/CHIELD/CHIELD_Online/processing/"))
h = read.delim("../data/tabular/topicHierarchy.tab",sep="\t",header = F,fileEncoding = "UTF-8",encoding = "UTF-8")

# Turn tabbed list into table with all rows filled out
columnsWithData = which(apply(h,2,function(X){sum(X!="")>0}))
h = h[,columnsWithData]

#h$root = h[,1]!=""
h$leaf = h[,ncol(h)]!=""

for(i in 1:nrow(h)){
  for(j in 1:(ncol(h)-1)){
    if(h[i,j]=="" & i>1){
        h[i,j] = h[i-1,j]
    }
  }
}
h = h[h$leaf,]

## Filter hierarchy to only those included in CHIELD
l = read.csv("../data/db/CausalLinks.csv",stringsAsFactors = F,encoding = "UTF-8",fileEncoding = "UTF-8")
topics = (l$Topic)
topics = unlist(strsplit(topics,";"))
topics = gsub(" +$","",topics)
topics = gsub("^ +","",topics)
topics = unique(topics[!is.na(topics)])

h = h[h[,(nrow(h)-1)] %in% topics,]

# Turn data frame into nested JSON:

makeList<-function(x){
  if(ncol(x)>2){
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
                     children=makeList(h)),
                pretty = T)
cat(jsonOut, file="../app/Site/json/topicHierarchy.json")
