# Convert causal links to dot language
library(igraph)
try(setwd("~/Documents/Bristol/CHIELD/CHIELD_Online/analysis/"))


dotEdgeTypes = c(">"= 'arrowhead="normal",arrowtail="none"',
"<=>"= 'arrowhead="normal",arrowtail="normal"',
"<"= 'arrowhead="none",arrowtail="normal"',
"~"= 'arrowhead="none",arrowtail="none",style="dashed",color="#b3b6b7"',
"/>"='arrowhead="tee",arrowtail="none"',
">>"='arrowhead="normal",arrowtail="none",color="Red"',
"~="='arrowhead="dot",arrowtail="none"',
"^"='arrowhead="normal",arrowtail="none",style="dashed",color="Green"'
)

causalLinksToDOT = function(d){
  varLabels = unique(c(d$Var1.label,d$Var2.label))
  varIds = v[match(varLabels,v$name),]$pk
  
  gx = graph_from_data_frame(d[d$Relation!="^",
          c("Var1.label","Var2.label")])
  gx.diameter = diameter(gx)
  rankdir = "LR"
  if(gx.diameter > 4){
    rankdir="TB"
  }
  
  #V = unique(c(d$Var1.label,d$Var2.label))
  #edL <- vector("list", length=length(V))
  #for(i in 1:length(V)){
  #  edL[[i]] = list(edges=which(V %in% unique(d[d$Var1.label==V[i],]$Var2.label)))
  #}
  #gx = graphNEL(nodes=V,edgeL=edL,edgemode = "directed")
  #x = plot(gx, "dot",attrs=list(
  #  graph=list(rankdir="LR"),
  #  node=list(color="#e92b2b", style='filled', fillcolor="#ffd2d2"),
  #  edge=list(penwidth=3)))
  #aspectRatio = x@boundBox@upRight@x / x@boundBox@upRight@y

  nodesDot = paste("V",varIds,' [label="',varLabels,'"]', sep='')
  
  edgesProperties = dotEdgeTypes[d$Relation]
  
  edgesDot = paste(
    "V",d$Var1,
    " -> ",
    "V",d$Var2,
    " [",edgesProperties,"] ",
    sep=""
  )
  
  dot = paste0("digraph chield {\n",
    'node [color="#e92b2b", style=filled, fillcolor="#ffd2d2"]\nedge [penwidth=3]\ngraph [rankdir="',rankdir,'"]\n',
    paste(nodesDot,collapse = "\n"),
    "\n",
    paste(edgesDot, collapse = "\n"),
    "\n}"
  )
  return(dot)
}



d = read.csv("../app/data/db/CausalLinks.csv",stringsAsFactors = F)
v = read.csv("../app/data/db/Variables.csv",stringsAsFactors = F)

d$Var1.label = v[match(d$Var1,v$pk),]$name
d$Var2.label = v[match(d$Var2,v$pk),]$name

for(doc in unique(d$bibref)){
  docDot = causalLinksToDOT(d[d$bibref==doc,])
  filename = paste0("../../Graphs/dot/",doc,".dot")
  cat(docDot,file=filename)
}

allLinksDot = causalLinksToDOT(d)
cat(allLinksDot, file="../../Graphs/dotClusters/AllLinks.dot")


# Components

g = graph_from_data_frame(d[d$Relation!="^",
                            c("Var1.label","Var2.label")])
clu <- components(g)
grps = groups(clu)
for(i in 1:length(grps)){
    componentVariables = grps[[i]]
    dx = d[d$Var1.label %in% componentVariables & 
        d$Var2.label %in% componentVariables & 
        d$Relation!="/>",]
    componentDot = causalLinksToDOT(dx)
    filename = paste0("../../Graphs/dotClusters/Cluster",i,".dot")
    cat(componentDot,file=filename)
}

componentSizes = sapply(grps,length)
max(componentSizes)/sum(componentSizes)


dunbar = d[d$bibref=="dunbar2004gossip",]
dunbar = dunbar[dunbar$Relation!="^",]
dunbarDot = causalLinksToDOT(dunbar)
cat(dunbarDot,file="../../Graphs/dot/dunbar2004gossip_alt.dot")
