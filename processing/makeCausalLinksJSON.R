# Convert the causal links to a python dictionary format (json)

suppressWarnings(suppressMessages(library(jsonlite)))
print("Creating causal links json file ...")

#try(setwd("~/Documents/Bristol/CHIELD/CHIELD_Online/processing/"))

clinks = read.csv("../data/db/CausalLinks.csv", stringsAsFactors = F)

clinks$Var1 = as.character(clinks$Var1)
clinks$Var2 = as.character(clinks$Var2)

# Compact format
selA = clinks$Relation %in% c(">",">>")#,"<=>","=~")
#selB = clinks$Relation %in% c("<")#,"<=>")
dict = sapply(unique(clinks$Var1),function(X){
  ret = unique(c(
    clinks[(selA & clinks$Var1==X),]$Var2
 #   clinks[(selB & clinks$Var2==X),]$Var1
    ))
  return(ret[ret!=X])
})
dict = dict[lapply(dict,length)>0]

# Backwards
dictB = sapply(unique(clinks$Var2),function(X){
  ret = unique(c(
    clinks[(selA & clinks$Var2==X),]$Var1
#    clinks[(selB & clinks$Var1==X),]$Var2
  ))
  return(ret[ret!=X])
})
dictB = dictB[lapply(dictB,length)>0]

dict.json = toJSON(list(forwards=dict,backwards=dictB))
cat(as.character(dict.json),file="../app/Site/json/CausalLinks.json")




# Old For loop method
# dict = list()
# for(i in 1:nrow(clinks)){
#   if(clinks[i,]$Relation %in% c(">",">>","<=>","=~")){
#     # make sure we're not adding duplicate links
#     # (the SQL search finds all links between nodes)
#     if(!clinks[i,]$Var2 %in% dict[[clinks[i,]$Var1]]){
#       dict[[clinks[i,]$Var1]] = c(dict[[clinks[i,]$Var1]],clinks[i,]$Var2)  
#     }
#   }
#   if(clinks[i,]$Relation %in% c("<","<=>")){
#     if(!clinks[i,]$Var1 %in% dict[[clinks[i,]$Var2]]){
#       dict[[clinks[i,]$Var2]] = c(dict[[clinks[i,]$Var2]],clinks[i,]$Var1)
#     }
#   }
# }