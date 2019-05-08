library(mgcv)
library(gridExtra)

try(setwd("~/Documents/Bristol/CHIELD/CHIELD_Online/processing/"))

d = read.csv("../data/db/CausalLinks.csv",stringsAsFactors = F)
dv1 = d[,c("Var1","bibref")]
dv2 = d[,c("Var2","bibref")]
names(dv2) = c("Var1",'bibref')
d = rbind(dv1,dv2)

cumUniqueVariables.mean = rep(0,length(unique(d$bibref)))
numSamples = 100
getCumUniqueVariables = function(){
  docs = sample(unique(d$bibref))
  d$bibref = factor(d$bibref,levels=docs)
  d = d[order(d$bibref),]
  # Cumulative unique variables
  cumUniqueVariables = 
    sapply(docs,function(doc){
    length(unique(d[1:max(which(d$bibref==doc)),]$Var1))
  })
  return(cumUniqueVariables)
}

set.seed(2178)
cumUniqueVariables.mean = replicate(numSamples,getCumUniqueVariables())
cumUniqueVariables.mean = rowSums(cumUniqueVariables.mean)/numSamples

res = data.frame(
  cumUniqueVariables.mean = cumUniqueVariables.mean,
  numDocuments = 1:length(cumUniqueVariables.mean)
)

m0 = lm(cumUniqueVariables.mean~
          numDocuments+
          I(numDocuments^2),
        data = res)
summary(m0)

newdata = data.frame(
  numDocuments = 1:1000
)

predictedCurve = predict(m0,
    newdata = data.frame(numDocuments = 1:3000))
dx = abs(diff(predictedCurve))
plateau = which(dx==min(dx))
predictedCurve[plateau]

newdata = data.frame(
  numDocuments = seq(1,plateau,length.out=100)
)

predictedCurve = predict(m0,newdata = newdata)

plot(newdata$numDocuments,
     predictedCurve,
     xlab="Number of documents",
     ylab="Number of unique variables",
     type = 'l',
     xlim=range(newdata$numDocuments),
     ylim=c(0,max(predictedCurve)),
     lty=2,col=2)
#abline(0,1,lty=2)
points(1:length(cumUniqueVariables.mean),
       cumUniqueVariables.mean,
     xlab="Number of documents",
     ylab="Number of unique variables",
     type = 'l',lty=1,col=1,lwd=2)


library(ggplot2)

cuv  =data.frame(numDocuments=1:length(cumUniqueVariables.mean),
                 cumUniqueVariables.mean = cumUniqueVariables.mean)

cumPlot = ggplot(newdata,aes(x=numDocuments,y=predictedCurve)) +
  geom_line(data=cuv,aes(x = numDocuments,y=cumUniqueVariables.mean),size=1.5) +
  geom_line(linetype="dotted") + 
  xlab("Number of documents") +
  ylab("Number of unique variables")
pdf("../../Writeup/IntroPaper/visualisation/CumulativeVariablesPlot.pdf",width=4,height=3)
cumPlot
dev.off()

## General stats

dx = read.csv("../data/db/CausalLinks.csv",stringsAsFactors = F)
tx = table(dx$Type[dx$Type!="" & dx$Type!="other"])
txx = data.frame(Type=names(tx),Count=tx)
txxOrder = as.character(txx$Type[order(txx$Count.Freq)])
txx$Count.Var1 = as.character(txx$Count.Var1)
txx$Type = as.character(txx$Type)
txx = rbind(txx,c("not documented","not documented",nrow(dx)-sum(txx$Count.Freq)))
txx$Type = factor(txx$Type,levels=c("not documented",txxOrder))
txx$Count.Freq = as.numeric(txx$Count.Freq)


typePlot = ggplot(txx,aes(x = 1,y=Count.Freq,label=Type,fill=Type)) + geom_bar(stat = "identity") +
  geom_text(size = 3, position = position_stack(vjust = 0.5),colour="white") +
  scale_fill_manual(values = c( "#878787","#e700a3","#00e7d9","#bce700","#006de7","#e78900","#e70000","#a300e7","#00e752")) +
  theme(legend.position = 'none')+
  theme(axis.title=element_blank(),
        axis.ticks = element_blank(),
        axis.text = element_blank(),
        panel.grid.major.x = element_blank(),
        panel.grid.minor.x = element_blank(),
        panel.background = element_blank())+
  ylim(0,nrow(dx)) +
  ggtitle("Type") +
  theme(plot.title = element_text(hjust = 0.5))

dx$Stage = gsub("cultrual evolution","cultural evolution",dx$Stage)

sx = table(dx$Stage[dx$Stage!="" & dx$Stage!="none"])
sxx = data.frame(Stage=names(sx),Count=sx)
sxx$Stage = as.character(sxx$Stage)
sxx$Count.Var1 = as.character(sxx$Count.Var1)
sxx = rbind(sxx,c("not documented","not documented",nrow(dx)-sum(sxx$Count.Freq)))
sxx$Stage = gsub("cultural evolution","cultural\nevolution",sxx$Stage)
sxx$Stage = gsub("language change","language\nchange",sxx$Stage)
sxx$Stage = factor(sxx$Stage,levels=c("not documented","preadaptation","coevolution","cultural\nevolution","language\nchange"))
sxx$Count.Freq = as.numeric(sxx$Count.Freq)

#"language change":'#28A745',
#"cultural evolution":'#ffd507',
#"coevolution":'#ff9400',
#"preadaptation":'#DC3545'

stagePlot = ggplot(sxx,aes(x = 1,y=Count.Freq,label=Stage,fill=Stage)) + geom_bar(stat = "identity") +
  geom_text(size = 3, position = position_stack(vjust = 0.5), colour="white") +
  scale_fill_manual(values = c("#878787","#DC3545","#ff9400",'#ffd507','#28A745')) +
  theme(legend.position = 'none') +
  xlab("Stage") + ylab("Number of Links") + 
  theme(axis.ticks.x = element_blank(),
        axis.text.x = element_blank(),
        axis.title.x = element_blank(),
        panel.grid.major.x = element_blank(),
        panel.grid.minor.x = element_blank(),
        panel.background = element_blank()) +
  ylim(0,nrow(dx))+
  ggtitle("Stage") +
  theme(plot.title = element_text(hjust = 0.5))


chield = read.csv("../data/db/Documents.csv",stringsAsFactors = F)

chield$decade = floor(chield$year/10)*10
decades= table(chield$decade)

yearPlot = ggplot(chield,aes(x=decade)) + geom_histogram(binwidth = 10,color="black") +
  scale_x_continuous(name="Decade", breaks=seq(1930,2010,by=10)) +
  ylab("Number of documents")

# Logo
library(png)
library(grid)
img <- readPNG("../misc/logo/CHIELD_Logo_with_title.png")
logo <- rasterGrob(img, interpolate=TRUE)#, just=c(0.5,0.3))
logo = ggplot()+
  annotation_custom(logo) +
  theme(panel.background = element_blank())

# Basic stats
authors = read.csv("../data/db/Authors.csv",stringsAsFactors = F,encoding = "UTF-8",fileEncoding = "UTF-8")

stats = data.frame(
  y = seq(from=2,to=1,length.out = 4),
  label = c(paste(nrow(chield),"\nDocuments"),
            paste(length(unique(authors$name)),"\nAuthors"),
            paste(nrow(dx),"\nCausal Links"),
            paste(length(unique(c(dx$Var1,dx$Var2))),"\nVariables")))


labelPlot = ggplot(stats,aes(x=1,y=y,label=label)) +geom_text(colour="#e70000") +
  theme(axis.title = element_blank(),
        axis.text = element_blank(),
        panel.background = element_blank(),
        panel.grid = element_blank(),
        axis.ticks = element_blank()) +
  ylim(0.8,2.2)



allPlots = grid.arrange(logo,labelPlot,stagePlot, typePlot, yearPlot, cumPlot, 
             layout_matrix = matrix(c(1,2,2,2,3,3,3,3,4,4,4,4,5,5,6,6),nrow=4),
             widths = c(1,1.2,1,2.5))
allPlots
pdf("../../Writeup/IntroPaper/visualisation/GeneralStats.pdf",width=8,height=6)
plot(allPlots)
dev.off()