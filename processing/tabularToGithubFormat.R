# Take a flat csv version of the database and convert to the tree format

library(stringr)

bib_file = "../data/tabular/bib/CHIELD_bib.bib"
link_file = "../data/tabular/csv/CHIELD_links.csv"

treeBaseFolder = "../data/tree/documents/"


try(setwd("~/Documents/Bristol/CHIELD/CHIELD_Online/processing/"))

readBib = function(f){
  bib = readLines(f, encoding = 'utf-8')
  # remove comment lines
  bib = bib[!grepl("^%",bib)]
  bib = paste(bib,collapse="\n")
  bib = gsub("\n[ \t\r]+","\n",bib)
  bib = gsub("\n\n+","\n",bib)
  bib = strsplit(bib, "\n@")[[1]]
  bib = bib[nchar(bib)>5]
  bib = paste0("@",bib)
  return(bib)
}

getFolder = function(bibref, year){
  if(is.na(year)){
    return(paste("Unknown",bibref,sep="/"))
  } else{
    decade = paste0(floor(year/10)*10,"s")
    return(paste(decade,year,bibref,sep="/"))
  }
}

bib = readBib(bib_file)

bibkeys = sapply(bib, function(X){
  x = str_extract(X,"\\{([^,])+,")
  substr(x,2,nchar(x)-1)
}, USE.NAMES = F)
names(bib) = bibkeys

bibyears = sapply(bib, function(X){
  x = str_extract(X,"Year *= *\\{[12][0-9][0-9][0-9]\\}[,}]")
  str_extract(x,"[12][0-9][0-9][0-9]")
}, USE.NAMES = F)
bibyears = as.numeric(bibyears)
names(bibyears) = bibkeys

links = read.csv(link_file, stringsAsFactors = F, encoding = "utf-8")
links = links[!is.na(links$bibref),]

links.bib = unique(links$bibref)

for(ref in links.bib){
  year = bibyears[ref]
  path = getFolder(ref, year)
  dir.create(paste0(treeBaseFolder,path),
             recursive = T,
             showWarnings = F)
  
  l = links[links$bibref==ref,]
  write.csv(l, 
            file=paste0(treeBaseFolder,
                        path,
                        paste0("/",ref,".csv")))
  cat(bib[ref],
      file=paste0(treeBaseFolder,
                   path,
                   paste0("/",ref,".bib")))
}