# Take the CHILED database in a directory tree format and build an SQL database

suppressWarnings(suppressMessages(library(digest)))
suppressWarnings(suppressMessages(library(stringr)))
suppressWarnings(suppressMessages(library(dplyr)))
suppressWarnings(suppressMessages(library(dbplyr)))
suppressWarnings(suppressMessages(library(RSQLite)))
suppressWarnings(suppressMessages(library(bibtex)))
suppressWarnings(suppressMessages(library(readr)))
suppressWarnings(suppressMessages(library(crayon)))

try(setwd("~/Documents/Bristol/CHIELD/CHIELD_Online/processing/"))

source("detexify.R")

treeBaseFolder = "../data/tree"

default_contributor = "seannyD"
default_contributor_realname = "Sean Roberts"

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

checkCharacters = function(X){
  sapply(X,function(Z){
    x = try(nchar(Z))
    if(grepl("invalid multibyte string",x)){
      print("WARNING: invalid multibyte string")
      print(x)
      print(Z)
    }
    
  })
  return("Finished Checking")
}

makePks = function(base){
  # unique keys based on hash numbers.  
  # Duplicate strings are given different keys
  # Old method:
  n = sapply(1:length(base),function(i){sum(base[i:length(base)]==base[i])})
  as.character(sapply(paste0(n,base),str_to_int))
  
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
  bAuthors = sapply(b$author,function(X){
    paste(X$family,collapse=" ")
    })
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

# Super bibtex file with all documents
# (as vector of strings so we can order it later)
bigBibtexFile = c()

contributors = data.frame(
  username = NA,
  realname = NA,
  date = NA,
  bibref = NA,
  stringsAsFactors = F
)


for(f in list.dirs(treeBaseFolder)){
  files = list.files(f)
  if(sum(grepl("*.csv",files))>0){
    
    linkFile = files[grepl("*.csv",files)][1]
    bibFile = files[grepl("*.bib",files)][1]
    l = data.frame(Var1=NA,Var2=NA)       
    tryCatch(l <- read.csv(paste0(f,"/",linkFile), stringsAsFactors = F, encoding = 'utf-8',fileEncoding = 'utf-8'),
             error=function(e){
               cat(red("-----------------"))
               cat(red("-     Error     -"))
               cat(red("-----------------\n"))
               print(f)
               print(e)
             })
      # Remove rows without basic data
      l = l[complete.cases(l[,c("Var1","Var2")]),]
      l$Var1[l$Var1==""] = NA
      l$Var2[l$Var2==""] = NA
      l = l[complete.cases(l[,c("Var1","Var2")]),]
      
      if("X" %in% names(l)[2:length(names(l))]){
        cat(red("---------------\n"))
        cat(red("-   Warning   -\n"))
        cat(red("- File has extra column\n"))
        cat(red(f))
        cat(red("---------------\n"))
      }
      
      # Check if there is actually any data left
      if(nrow(l)>0){
        for(colx in causal_links_columns){
          if(!colx %in% names(l)){
            l[,colx] = ""
          }
        }
        l = l[,causal_links_columns]
        # Add links to list of links
        links = rbind(links,l)
        
        if("" %in% l$bibref || sum(is.na(l$bibref))>0){
          cat(green("---------------\n"))
          cat(green("-   Warning   -\n"))
          cat(green("- Bibref empty \n"))
          cat(green(f))
          cat(green("---------------\n"))
        }
      
        #b = readLines(paste0(f,"/",bibFile), warn = F)
        b = read.bib(paste0(f,"/",bibFile))
        
        checkCharacters(readLines(paste0(f,"/",bibFile),warn = F))
        
        # Add to big list
        
        bigBibtexFile = c(bigBibtexFile,paste(toBibtex(b),collapse = "\n"))
        
        # Extract info
        
        bKey = b$key
        bAuthor = paste(detexify(b$author),collapse='; ')
        bYear = b$year
        bTitle = detexify(b$title)
        # Make sure page range is specified as double dash
        if(!is.null(b$pages)){
          b$pages = gsub("-","--",b$pages)
          b$pages = gsub("--+","--",b$pages)
        }
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
        
        newContributors= data.frame(
          username=default_contributor,
          realname=default_contributor_realname,
          date = "",
          bibref=bKey
        )
        
        contributor.file = paste0(f,"/contributors.txt")
        if(file.exists(contributor.file)){
          suppressWarnings(cx <- read.delim(contributor.file,sep="\t", header=F, stringsAsFactors = F))
          names(cx)[1:3] = c("username",'realname','date') 
          cx$bibref = bKey
          newContributors = cx
        } 
        contributors = rbind(contributors,newContributors[,c("username","realname","date","bibref")])
      }
    
  }
}
bib = bib[2:nrow(bib),]
bib = bib[!is.na(bib$pk),]
bib = bib[bib$pk!="",]
rownames(bib) = bib$pk

contributors = contributors[!is.na(contributors$username),]

# Filter duplicate contributors (if they've edited something multiple times)
# TODO: should take most recent edit to get changes to real name?
contributors = contributors[!duplicated(contributors[,c("username",'bibref')]),]

# Contributor real names come from Github.
# But we can add in extra conversions for those who have not filled out their details:
extraContributorNamesFile = "../data/ExtraContributorNameConversions.csv"
if(file.exists(extraContributorNamesFile)){
  extraContributorNames = read.csv(extraContributorNamesFile,stringsAsFactors = F, encoding = "UTF-8",fileEncoding = "UTF-8")
  for(i in 1:nrow(extraContributorNames)){
    contributors[contributors$username==
                   extraContributorNames$username[i],]$realname =
      extraContributorNames$realname[i]
  }
}

if(sum(is.na(contributors$username))>0){
  contributors[is.na(contributors$username),]$username = "x"
}


# Write big bibtex file
bigBibtexFile = sort(bigBibtexFile)
cat(paste(bigBibtexFile,sep="\n\n"), file="../app/Site/downloads/CHIELD.bib")


links$pk = makePks(paste0(links$bibref,"#",links$Var1,"#",links$Var2))

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
variables$pk = as.character(variables$pk)
variables$name = as.character(variables$name)
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

causal.links$Confirmed[causal.links$Confirmed=="none" & !is.na(causal.links$Confirmed)] = ""
causal.links$Confirmed[causal.links$Confirmed=="null" & !is.na(causal.links$Confirmed)] = "null"

print("Checking notes")
checkCharacters(causal.links$Notes)

# Write csv files

write.csv(causal.links,"../data/db/CausalLinks.csv", row.names = F, fileEncoding = "utf-8")
write.csv(variables,"../data/db/Variables.csv", row.names = F, fileEncoding = "utf-8")
write.csv(documents,"../data/db/Documents.csv", row.names = F, fileEncoding = "utf-8")
write.csv(processes,"../data/db/Processes.csv", row.names = F, fileEncoding = "utf-8")
write.csv(contributors,"../data/db/Contributors.csv", row.names = F, fileEncoding = "utf-8")

version = getVersion()

write.csv(version, "../data/db/Version.csv", row.names = F, fileEncoding = "utf-8")

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
                     col_types = "cccc")
version = read_csv("../data/db/Version.csv",
                        col_types = "cc")

# Escape html characters for security
escapeHTML = function(d,columns){
  d = d %>% mutate_at(columns,
                stringr::str_replace_all, 
                pattern = "<", replacement = "&lt;")
  d = d %>% mutate_at(columns,
                      stringr::str_replace_all, 
                      pattern = ">", replacement = "&gt;")
  return(d)
}

suppressWarnings(causal_links <- escapeHTML(causal_links,c("Notes")))
variables = escapeHTML(variables,c("name"))
documents = escapeHTML(documents,c("author","title","record","citation"))
processes= escapeHTML(processes,c("name"))
contributors= escapeHTML(contributors,c("username",'realname'))



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


