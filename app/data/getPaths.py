# Take two target nodes,
# Find all paths that connect them
# Return a list of node ids to add to the user's visualisation
#  (this will be used in an SQL statement that finds links between these nodes)
# This is based on Dijkstra's algorithm. However, we don't need to find all
#  possible paths, only the set of nodes along all possible paths.
#  The SQL search will find all paths connecting these nodes later.
#  So we can keep track of edges traversed, and only follow each edge once.

# Maybe what we really want to do is this: https://stackoverflow.com/questions/25813635/efficiently-finding-all-nodes-on-some-path-between-two-nodes-in-a-directed-graph
# Do a breadth-first search from start node, do breadth-first-search from end node, 
#  then take the intersection between the two sets of nodes.
# Or even faster: make a dictionary of all nodes accessible from each node
#   Then just look up the intersection between start and end.
# However, the "backwards" search from the end variable needs to follow links 'backwards'
# So you need two dictionaries: Forwards and backwards.

import json, sys

#graph = {'A': ['B', 'C'],
#             'B': ['C', 'D'],
#             'C': ['D'],
#             'D': ['C'],
#             'E': ['F'],
#             'F': ['C']}

visited_edges = []

def find_all_paths(graph, start, end, path=[]):
	path = path + [start] # see https://developmentality.wordpress.com/2010/08/23/python-gotcha-default-arguments/
	if start == end:
		return [path]
	#if not graph.has_key(start):
	if not start in graph.keys(): # No out neighbours, and not reached end
		return []
	paths = []
	for node in graph[start]:
		if (node not in path) and ((start,node) not in visited_edges):
			newpaths = find_all_paths(graph, node, end, path)
			for newpath in newpaths:
				paths.append(newpath)
		visited_edges.append((start,node))
	return(paths)


var1 = sys.argv[-2]
var2 = sys.argv[-1]

#  This will be called from Site/php, so make path relative:
f = open('../../data/db/CausalLinks.json', 'r')
read_data = f.read()
f.close()


graph = json.loads(read_data)

paths = find_all_paths(graph, var1, var2)

# We want to find all links between the target nodes, but we don't want to:
#  Include the target nodes
#  Include links going out of intermediate nodes that are not part of the set
#  So the SQL statement should be in var1 AND in var2

uniqueNodes = list(set([item for sublist in paths for item in sublist]))

print(",".join(uniqueNodes))