library(mgcv)

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
abline(0,1,lty=2)

points(1:length(cumUniqueVariables.mean),
       cumUniqueVariables.mean,
     xlab="Number of documents",
     ylab="Number of unique variables",
     type = 'l',lty=1,col=1,lwd=2)
