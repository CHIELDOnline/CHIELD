# Take the CHILED database in a directory tree format and build a SQL database

library(digest)
library(stringr)
library(dplyr)
library(dbplyr)
library(RSQLite)
library(bibtex)
library(readr)

source("detexify.R")

try(setwd("~/Documents/Bristol/CHIELD/CHIELD_Online/processing/"))

treeBaseFolder = "../data/tree"

default_contributor = "seannyD"
default_contributor_realname = "Seán Roberts"

causal_links_columns = 
  c('bibref', 'Var1','Relation','Var2',
    'Cor',"Process",
    "Topic", "Stage", "Type",
    "Subtype","Confirmed","Notes")

# helper functions

hex_to_int = function(h) {
  xx = strsplit(tolower(h), "")[[1L]]
  pos = match(xx, c(0L:9L, letters[1L:6L]))
  sum((pos - 1L) * 16^(rev(seq_along(xx) - 1)))
}

str_to_int = function(s){
  hex_to_int(digest(s,algo='xxhash32'))
}

makePks = function(base){
  # unique keys based on hash numbers.  
  # Duplicate strings are given different keys
  # Old method:
  n = unlist(tapply(base,base,function(X){1:length(X)}))
  as.character(sapply(paste0(base,n),str_to_int))
  
  # For now, just return incrementing values
  #1:length(base)
}

getShortCitation = function(b){
  if(is.null(b$author)){
    return("")
  }
  citationAndSep = " & "
  citationEnd = ""
  bAuthors = b$author
  if(length(bAuthors)>4){
    bAuthors = b$author[1:4]
    citationAndSep = ", "
    citationEnd = " et al."
  }
  bAuthors = sapply(b$author,function(X){X$family})
  bAuthors = detexify(bAuthors)
  if(length(bAuthors)==1){
    authorList = bAuthors[1]
  } else{
    authorList = paste0(
      paste(bAuthors[1:(length(bAuthors)-1)],collapse=", "),
      citationAndSep,
      tail(bAuthors,1),
      citationEnd
    )
  }
  
  bCitation = paste0(
    authorList,
    " (",b$year,")")
  return(bCitation)
}

getVersion = function(){
  gitRevision = system("git rev-parse HEAD",intern = T)
  CHIELD.version = readLines("../version.txt")
  return(data.frame(version=CHIELD.version,
                    gitRevision = gitRevision))
}

#####


links = data.frame()
bib = data.frame(pk = NA,author = NA,
        year = NA,title = NA,record = NA,
        citation=NA, stringsAsFactors = F)

contributors = data.frame(
  username = default_contributor,
  realname = default_contributor_realname,
  numDocs = 0
)

for(f in list.dirs(treeBaseFolder)){
  files = list.files(f)
  if(sum(grepl("*.csv",files)>0)){
    
    linkFile = files[grepl("*.csv",files)][1]
    bibFile = files[grepl("*.bib",files)][1]
                     
    l = read.csv(paste0(f,"/",linkFile), stringsAsFactors = F)
    l = l[complete.cases(l[,c("Var1","Var2")]),]
    for(colx in causal_links_columns){
      if(!colx %in% names(l)){
        l[,colx] = ""
      }
    }
    l = l[,causal_links_columns]
    # Add links to list of links
    links = rbind(links,l)
  
    #b = readLines(paste0(f,"/",bibFile), warn = F)
    b = read.bib(paste0(f,"/",bibFile))
    
    bKey = b$key
    bAuthor = paste(detexify(b$author),collapse='; ')
    bYear = b$year
    bTitle = detexify(b$title)
    bRecord = paste(as.character(toBibtex(b)),collapse="\n")
    #bCitation = format(b, style = "html")
    # remove link text
    #bCitation = gsub(">[^<]+</a>",">link</a>",bCitation)
    # Citation is now e.g. Ackley & Littman (1994)
    bCitation = getShortCitation(b)
    
    bib = rbind(bib,
                c(bKey, bAuthor, bYear, bTitle,
                  bRecord, bCitation))
    
    # Contributor
    contributor.file = paste0(f,"/contributors.txt")
    if(file.exists(contributor.file)){
      print(f)
      cx = read.delim(contributor.file,sep="\t", header=F, stringsAsFactors = F)
      if(ncol(cx)==2){
        names(cx) = c("username",'realname') 
      } else{
        names(cx) = "username"
        cx$realname = cx$username
      }
      for(i in 1:nrow(cx)){
        unx = cx[i,]$username
        # If user exists, increment number of docs by 1
        if(unx %in% contributors$username){
          contributors[contributors$username==unx,]$numDocs = contributors[contributors$username==unx]$numDocs+1
        } else{
          # if they don't exist, add them
          contributors = rbind(contributors,
                               c(cx$username,cx$realname,1))
        }
      }
    } else{
      # By default, assume it's the default contributor
      contributors[contributors$username==default_contributor,]$numDocs = contributors[contributors$username==default_contributor]$numDocs+1
    }
  }
}
bib = bib[2:nrow(bib),]
bib = bib[!is.na(bib$pk),]
bib = bib[bib$pk!="",]
rownames(bib) = bib$pk
contributors = contributors[!is.na(contributors$username),]

links$pk = makePks(paste0(links$bibref,"#",links$Var1,"#",links$Var2))

if(length(unique(links$pk))!=nrow(links)){
  print("Warning: Duplicate pks?")
}

# Documents

documents = bib

# Variables

vars = unique(c(links$Var1,links$Var2))
vars = vars[!is.na(vars)]
vars = vars[nchar(vars)>0]

variables = data.frame(
  pk = makePks(vars),
  name = vars
)

# Processes

pro.names = unique(links$Process)
pro.names = pro.names[!is.na(pro.names)]
pro.names = pro.names[nchar(pro.names)>0]

processes = data.frame(
  pk = makePks(pro.names),
  name = pro.names
)

# Causal links

causal.links = links[,c("pk",causal_links_columns)]

causal.links$Var1 = variables[match(causal.links$Var1, variables$name),]$pk
causal.links$Var2 = variables[match(causal.links$Var2, variables$name),]$pk

causal.links$Process = processes[match(causal.links$Process, processes$name),]$pk

# Write csv files

write.csv(causal.links,"../data/db/CausalLinks.csv", row.names = F)
write.csv(variables,"../data/db/Variables.csv", row.names = F)
write.csv(documents,"../data/db/Documents.csv", row.names = F)
write.csv(processes,"../data/db/Processes.csv", row.names = F)
write.csv(contributors,"../data/db/Contributors.csv", row.names = F)

version = getVersion()

write.csv(version, "../data/db/Version.csv", row.names = F)

#db <- dbConnect(SQLite(), dbname="Test.sqlite")
#dbWriteTable(conn = db, name = "Student", value = Student, row.names = FALSE)

###
# Create an SQL database

causal_links = read_csv("../data/db/CausalLinks.csv",
                        col_types = paste(rep("c",ncol(causal.links)),collapse=''))
variables = read_csv("../data/db/Variables.csv",
                     col_types = paste(rep("c",ncol(variables)),collapse=''))
documents = read_csv("../data/db/Documents.csv",
                     col_types = paste(rep("c",ncol(documents)),collapse=''))
processes = read_csv("../data/db/Processes.csv",
                     col_types = paste(rep("c",ncol(processes)),collapse=''))
contributors = read_csv("../data/db/Contributors.csv",
                     col_types = "cci")
version = read_csv("../data/db/Version.csv",
                        col_types = "cc")

my_db_file <- "../data/db/CHIELD.sqlite"
my_db <- src_sqlite(my_db_file, create = TRUE)
my_db2 <- dbConnect(RSQLite::SQLite(), my_db_file)
dbWriteTable(my_db2, "causal_links",causal_links, overwrite=T)
dbWriteTable(my_db2, "variables",variables, overwrite=T)
dbWriteTable(my_db2, "documents",documents, overwrite=T)
dbWriteTable(my_db2, "processes",processes, overwrite=T)
dbWriteTable(my_db2, "contributors",contributors, overwrite=T)
dbWriteTable(my_db2, "version",version, overwrite=T)
dbDisconnect(my_db2)

