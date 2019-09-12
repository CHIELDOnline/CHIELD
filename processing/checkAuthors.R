library(bibtex)
library(RSQLite)
library(dplyr)

try(setwd("~/Documents/Bristol/CHIELD/CHIELD_Online/processing/"))
source("detexify.R")


b = read.bib("../app/Site/downloads/CHIELD.bib")

journals = sapply(names(b), function(X){b[X]$journal})
sort(table(unlist(journals)),decreasing = T)[1:10]

my_db_file <- "../data/db/CHIELD.sqlite"
my_db <- src_sqlite(my_db_file, create = TRUE)
my_db2 <- dbConnect(RSQLite::SQLite(), my_db_file)
authors = dbReadTable(my_db2, "authors")

authors = unique(authors$name)

dx = adist(authors)

authors[which(dx==1,arr.ind = T)[,1]]
authors[which(dx==2,arr.ind = T)[,1]]
authors[which(dx==3,arr.ind = T)[,1]]
sort(unique(authors[which(dx==4,arr.ind = T)[,1]]))

authors[sapply(authors,function(X){nchar(strsplit(X," ")[[1]][1])==1})]

lastNames = sapply(authors,function(X){x = strsplit(X," ")[[1]];x[length(x)]})
lastNamesC = sort(table(lastNames))
lastNamesC[lastNamesC>1]
for(x in names(lastNamesC[lastNamesC>1])){
  print(authors[grepl(x,authors)])
}

## Replace some authors manually

replaceAuthorName = function(oldName,newName){
  treeBaseFolder = "../data/tree"
  for(f in list.dirs(treeBaseFolder)){
    files = list.files(f)
    if(sum(grepl("*.csv",files))>0){
      
      bibFile = files[grepl("*.bib",files)][1]
      b = read.bib(paste0(f,"/",bibFile))
      bKey = b$key
      authors = detexify(b$author)
      if(oldName %in% authors){
        b$author[which(authors==oldName)] = as.person(newName)
        write.bib(b,file=paste0(f,"/",bibFile))
      }
      #bRecord = paste(as.character(toBibtex(b)),collapse="\n")
      #write.bib(b,file=bibFile)
    }
  }
}


if(FALSE){
  # First round
  replaceAuthorName("George Van Driem","George van Driem")
  replaceAuthorName("Patrick J O’Donnell","Patrick J O'Donnell")
  replaceAuthorName("Stephen Levinson","Stephen C Levinson")
  replaceAuthorName("Eors Szathmary","Eörs Szathmáry")
  replaceAuthorName("Bernard Crespi","Bernard J Crespi")
  replaceAuthorName("Hannah Haynie","Hannah J Haynie")
  replaceAuthorName("Damian Blasi","Damián E Blasi")
  replaceAuthorName("C Evans","Cara Evans")
  replaceAuthorName("R. Mace","Ruth Mace")
  replaceAuthorName("N. J. Enfield","Nick J. Enfield")
  replaceAuthorName("A. Cangelosi","Angelo Cangelosi")
  replaceAuthorName("John R Stepp","John Richard Stepp")
  replaceAuthorName("S Lee","Sean Lee")
  # Second round 5/9/19
  replaceAuthorName("Russell Gray","Russel D Gray")
  replaceAuthorName("Fiona Jordan","Fiona M Jordan")
  replaceAuthorName("Scott Moisik","Scott R Moisik")
  replaceAuthorName("Patrick Kavanagh","Patrick H Kavanagh")
  replaceAuthorName("C Bentz","Christian Bentz")
  replaceAuthorName("K L Hunley","Keith Hunley")
  replaceAuthorName("John R Stepp","John Richard Stepp")
  replaceAuthorName("J Nichols","Johanna Nichols")
}