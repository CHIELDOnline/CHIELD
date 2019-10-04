library(bibtex)
library(RSQLite)
library(dplyr)

try(setwd("~/Documents/Bristol/CHIELD/CHIELD_Online/processing/"))
source("detexify.R")


b = read.bib("../app/Site/downloads/CHIELD.bib")

my_db_file <- "../data/db/CHIELD.sqlite"
my_db <- src_sqlite(my_db_file, create = TRUE)
my_db2 <- dbConnect(RSQLite::SQLite(), my_db_file)
variables = dbReadTable(my_db2, "variables")

variables = unique(variables$name)

dx = adist(variables)

sort(variables[which(dx==1,arr.ind = T)[,1]])


# Check spelling
library(hunspell)
spelling = hunspell(unique(variables),dict = dictionary("en_GB"))

dx = data.frame(
  var =variables,
  prob=sapply(hunspell(unique(variables)),paste,collapse="/"),
  stringsAsFactors = F
)
dx$len = sapply(spelling,length)
dx = dx[dx$len>0,]

dx$suggest = sapply(dx$prob,
                    function(X){
                      paste(hunspell_suggest(strsplit(X,"/")[[1]]),collapse="/")
                    })
write.csv(dx,"~/Desktop/SpellingSuggestions.csv")
