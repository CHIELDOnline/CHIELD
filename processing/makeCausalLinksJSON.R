# Convert the causal links to a python dictionary format (json)

suppressWarnings(suppressMessages(library(jsonlite)))
print("Creating causal links json file ...")

#try(setwd("~/Documents/Bristol/CHIELD/CHIELD_Online/processing/"))

clinks = read.csv("../data/db/CausalLinks.csv", stringsAsFactors = F)

clinks$Var1 = as.character(clinks$Var1)
clinks$Var2 = as.character(clinks$Var2)

# Convert ids to text names
# NO! Keep as pks
#v = read.csv("../data/db/Variables.csv", stringsAsFactors = F)
#clinks$Var1 = v[match(clinks$Var1, v$pk),]$name
#clinks$Var2 = v[match(clinks$Var2, v$pk),]$name

dict = list()
for(i in 1:nrow(clinks)){
  if(clinks[i,]$Relation %in% c(">",">>","<=>","=~")){
    # make sure we're not adding duplicate links
    # (the SQL search finds all links between nodes)
    if(!clinks[i,]$Var2 %in% dict[[clinks[i,]$Var1]]){
      dict[[clinks[i,]$Var1]] = c(dict[[clinks[i,]$Var1]],clinks[i,]$Var2)  
    }
  }
  if(clinks[i,]$Relation %in% c("<","<=>")){
    if(!clinks[i,]$Var1 %in% dict[[clinks[i,]$Var2]]){
      dict[[clinks[i,]$Var2]] = c(dict[[clinks[i,]$Var2]],clinks[i,]$Var1)
    }
  }
}

dict.json = toJSON(dict)

cat(as.character(dict.json),file="../app/data/db/CausalLinks.json")
