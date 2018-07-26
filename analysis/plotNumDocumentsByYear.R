try(setwd("~/Documents/Bristol/CHIELD/CHIELD_Online/analysis//"))

d = read.csv("../data/db/Documents.csv",stringsAsFactors = F)

pdf("../../Graphs/analysis/NumDocumentsByYear.pdf",
    width=6, height=4)
hist(d$year,
     xlab="Year",
     ylab="Number of documents",
     main="")
dev.off()