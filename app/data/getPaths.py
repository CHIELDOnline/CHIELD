# Take two target nodes,
# Find all paths that connect them
# Return a list of node ids to add to the user's visualisation
#  (this will be used in an SQL statement that finds links between these nodes)

import json, sys

#graph = {'A': ['B', 'C'],
#             'B': ['C', 'D'],
#             'C': ['D'],
#             'D': ['C'],
#             'E': ['F'],
#             'F': ['C']}


def find_all_paths(graph, start, end, path=[]):
	path = path + [start]
	if start == end:
		return [path]
	if not graph.has_key(start):
		return []
	paths = []
	for node in graph[start]:
		if node not in path:
			newpaths = find_all_paths(graph, node, end, path)
			for newpath in newpaths:
				paths.append(newpath)
	return paths


var1 = sys.argv[-2]
var2 = sys.argv[-1]

with open('db/CausalLinks.json', 'r') as f:
	read_data = f.read()
f.closed

graph = json.loads(read_data)

paths = find_all_paths(graph, var1, var2)

# We want to find all links between the target nodes, but we don't want to:
#  Include the target nodes
#  Include links going out of intermediate nodes that are not part of the set
#  So the SQL statement should be in var1 AND in var2

uniqueNodes = list(set([item for sublist in paths for item in sublist]))

print ",".join(uniqueNodes)