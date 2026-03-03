try(setwd("~/Documents/Bristol/CHIELD/CHIELD_Online/analysis//"))

d = read.csv("../data/db/Documents.csv",stringsAsFactors = F)

decades= range(floor(d$year/10)*10)

pdf("../../Graphs/analysis/NumDocumentsByYear.pdf",
    width=6, height=4)
hist(d$year,
     xlab="Year",
     ylab="Number of documents",
     main="",
     breaks=seq(decades[1],decades[2]+10,by=10))
dev.off()