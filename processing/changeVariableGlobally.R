# Change a variable
# Takes two arguments: oldVariable and newVariable
# Remember to use Rscript to run from command line

try(setwd("~/Documents/Bristol/CHIELD/CHIELD_Online/processing/"))

args = commandArgs(trailingOnly=TRUE)
if(length(args)!=2){
  stop("2 arguments required (old and new variable label)")
}
oldVar = args[1]
newVar = args[2]

print(paste("Converting:",oldVar,"to",newVar))

treeBaseFolder = "../data/tree"

numChanged = 0

for(f in list.dirs(treeBaseFolder)){
  files = list.files(f)
  if(sum(grepl("*.csv",files))>0){
    
    linkFile = files[grepl("*.csv",files)][1]
    l <- read.csv(paste0(f,"/",linkFile), stringsAsFactors = F, encoding = 'utf-8',fileEncoding = 'utf-8')
    numChanged = numChanged + sum(l$Var1==oldVar)
    numChanged = numChanged + sum(l$Var2==oldVar)
    l$Var1[l$Var1==oldVar] = l$Var1[l$Var1==newVar]
    l$Var2[l$Var2==oldVar] = l$Var1[l$Var2==newVar]
    
  }
}

print(paste("Changed",numChanged,"variables"))