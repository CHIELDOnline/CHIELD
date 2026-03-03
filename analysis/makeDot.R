# studyTypeColours = {
#   simulation: "#00e7d9", // light blue
#   model:      "#006de7", // dark blue
#   review:     "#a300e7", // purple
#   hypothesis: "#00e752", // green
#   statistical:"#e78900", // orange
#   experiment: "#e70000", // red
#   qualitative:"#bce700", // yellow
#   logical:    "#e700a3", // pink
#   other:      "#000000"  // black
# };


# var colCharts = [
#   ["#e92b2b"],
#   ["#e92b2b","#004488"],
#   ['#DDAA33','#BB5566','#004488'],
#   ["#0077BB","#009988","#EE7733","#CC3311"],
#   ["#0077BB","#33BBEE","#009988","#EE7733","#CC3311"],
#   ["#0077BB","#33BBEE","#009988","#EE7733","#CC3311","#EE3377"],
#   ["#332288","#44AA99","#117733","#999933","#CC6677","#882255","#AA4499"],
#   ["#332288","#88CCEE","#44AA99","#117733","#999933","#CC6677","#882255","#AA4499"],
#   ["#332288","#88CCEE","#44AA99","#117733","#999933","#DDCC77","#CC6677","#882255","#AA4499"],
#   ['#8b0000','#ba1c36','#dd4a54','#f07e67','#e3b795','#b4b9df','#968bcb','#735db6','#4a32a1','#00008b'],
#   ['#8b0000','#b61832','#d7414f','#ed6d61','#efa07a','#add8e6','#a9a7d7','#8c7dc5','#6b54b2','#462d9e','#00008b'],
#   ['#8b0000','#b2152f','#d2394b','#e8615d','#f18c6e','#dfbc9e','#b6bee1','#9e97d0','#8372bf','#654eae','#42299d','#00008b']]


makeDot = function(links,rankDir="LR",nodePos=NA){
  
  settings = paste0('\nnodesep=0.1\nrankdir=',rankDir,';\nnode [color="#e92b2b", style=filled, fillcolor="#ffd2d2"]\nedge [penwidth=3]\n')
  
  nodes = uniqueNodes(links)
  nodesText = makeNodeList(links,nodes,nodePos)
  
  edges = makeEdgeList(links,nodes)
  
  graph = paste0('digraph chield{',
             settings,
             nodesText,
             "\n",
             edges, 
             "}",
             collapse="\n"  )
  return(graph)
}

makeNodeList = function(links,nodes,pos=NA){
  if(is.na(pos)){
    nx = uniqueNodes(links)
    return(paste(paste0("N",match(nx,nodes),' [label="',nx,'",margin=0];'),collapse="\n"))
  } else{
    #pos="0,0!"
    nx = uniqueNodes(links)
    pos = paste0('pos="',pos[nx,1],",",pos[nx,2],'!"')
    return(paste(paste0("N",match(nx,nodes),' [label="',nx,'",margin=0,',pos,'];'),collapse="\n"))
  }
}

makeEdgeList = function(links,nodes){
  dotEdgeTypes = list(
    ">"= 'arrowhead="normal",arrowtail="none"',
    "<=>"= 'dir="both"',
    "<"= 'arrowhead="none",dir="back"',
    "~"= 'arrowhead="none",arrowtail="none",style="dashed"',
    "/>"='arrowhead="tee",arrowtail="none"',
    "/="='arrowhead="tee",arrowtail="none"',
    ">>"='arrowhead="normal",arrowtail="none"',
    "~="='arrowhead="dot",arrowtail="none"',
    "^"='arrowhead="normal",arrowtail="none",style="dashed"',
    "-o"='arrowhead="dot",arrowtail="none"'
  )
  
  xlabel = rep("",nrow(links))
  if(sum(!is.na(links$xlabel))>0){
    xlabel[!is.na(links$xlabel)] = paste0(',label="',
                    links[!is.na(links$xlabel),]$xlabel,
                    '",fontsize=25,fontcolor="',
                    links$colour[!is.na(links$xlabel)],
                    '",')
  }
  
  paste0("N",match(links$Var1,nodes), " -> ",
         "N",match(links$Var2,nodes),
         ' [',dotEdgeTypes[links$Relation],',',
         'color="',links$colour,'"',
         xlabel,
         '];',collapse="\n")
}

uniqueNodes = function(lx){
  unique(c(lx$Var1,lx$Var2))
}


makeClusterDot = function(links,newrank=FALSE,rankDir="LR",nodePos=NA){
  
  allNodes =  unique(c(links$Var1,links$Var2))
  #citesPerNode = sapply(nx,function(X){length(unique(links[links$Var1==X | links$Var2==X,]$citation))})
  #names(citesPerNode[citesPerNode==1])
  
  clusterCounter = 0
  
  defs = ""
  
  for(cx in unique(links$citation)){
    cl = uniqueNodes(links[links$citation==cx,])
    other = uniqueNodes(links[links$citation!=cx,])
    uNodes = cl[!cl %in% other]
    oNodes = cl[cl %in% other]
    
    uLinks = links[(links$Var1 %in% uNodes & links$Var2 %in% uNodes) & links$citation==cx,]
    
    useCluster = nrow(uLinks)>0 
    
    if(useCluster){
      clusterNodes = makeNodeList(uLinks,allNodes)
      clusterEdges = makeEdgeList(uLinks,allNodes)
      
      clusterDef = paste0("subgraph cluster_",clusterCounter,' {\n',
             clusterNodes,"\n",
             clusterEdges,"\n",
             '\nlabel="',cx,'";',
             '\nfontcolor="',uLinks$colour[1],'";',
             '\nfontsize=25;',
             '\ncolor="',uLinks$colour[1],'"',
             '\npencolor=transparent;\n}\n')
      
      defs = paste0(defs,"\n",clusterDef)
      
      clusterCounter = clusterCounter + 1
    }
  
    
    oLinks = links[(!(links$Var1 %in% uNodes & links$Var2 %in% uNodes)) & links$citation==cx,]
    if(nrow(oLinks)>0){
      if(!useCluster){
        oLinks$xlabel = NA
        oLinks[1,]$xlabel = cx
      }
      extraNodes = makeNodeList(oLinks,allNodes,nodePos)
      extraEdges = makeEdgeList(oLinks,allNodes)
      defs = paste0(
        defs,"\n",
        extraNodes,"\n",
        extraEdges)
    }
    
  }
  
  settings = paste0('\nnodesep=0.1\nrankdir=',rankDir,';\nnode [color="#e92b2b", style=filled, fillcolor="#ffd2d2"]\nedge [penwidth=3]\n')
  if(newrank){
    settings = paste0("\nnewrank=true;",settings)
  }
  
  
  
  graph = paste0('digraph chield{',
                 settings,
                 defs,
                 "\n}",
                 collapse="\n"  )
  return(graph)
}