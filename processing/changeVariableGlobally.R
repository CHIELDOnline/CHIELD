# Change a variable
# Takes two arguments: oldVariable and newVariable
# Remember to use Rscript to run from command line
# e.g.:
# Rscript changeVariableGlobally.R "varialbe one" "variable one"

try(setwd("~/Documents/Bristol/CHIELD/CHIELD_Online/processing/"))

args = commandArgs(trailingOnly=TRUE)
if(length(args) != 2){
  stop("2 arguments required (old and new variable label)")
}
oldVar = args[1]
newVar = args[2]

print(paste("Converting:", oldVar, "to", newVar))

treeBaseFolder = "../data/tree"

numChanged = 0

for(f in list.dirs(treeBaseFolder)){
  files = list.files(f)
  if(sum(grepl("*.csv",files)) > 0){
    
    linkFile = files[grepl("*.csv", files)][1]
    linkFilePos= paste0(f, "/" ,linkFile)
    l <- read.csv(paste0(f, "/" ,linkFile), stringsAsFactors = FALSE, encoding = 'UTF-8', fileEncoding = 'UTF-8')
    chng = sum(l$Var1 == oldVar, na.rm = TRUE) + sum(l$Var2 == oldVar, na.rm = TRUE)
    numChanged = numChanged + chng
    if(chng > 0){
      if(sum(l$Var1 == oldVar, na.rm=TRUE) > 0){
        l$Var1[l$Var1 == oldVar & !is.na(l$Var1)] = newVar
      }
      if(sum(l$Var2==oldVar,na.rm = TRUE) > 0){
        l$Var2[l$Var2 == oldVar & !is.na(l$Var2)] = newVar
      }
      write.csv(l, file = linkFilePos, fileEncoding = "UTF-8", row.names = FALSE)
    }
    
  }
}

print(paste("Changed",numChanged,"entries"))
