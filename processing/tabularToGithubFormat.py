# python 3

import bibtexparser, csv

bibFile = "../data/tabular/bib/CHIELD_bib.bib"
linksFile = "../data/tabular/csv/CHIELD_links.csv"

headFolder = "../data/tree/"

with open(bibFile) as bibtex_file:
    bib_database = bibtexparser.load(bibtex_file)
    
d = {}
dHeaders = []

rowNum = 0
rowCode = ""
with open(linksFile) as csvfile:
	dreader = csv.reader(csvfile)
	for row in dreader:
		if rowNum ==0:
			dHeaders = row
		else:
			bibref = row[dHeaders.index("bibref")]
			try:
				d[bibref].append(dict(zip(dHeaders,row)))
			except:
				d[bibref] = [dict(zip(dHeaders,row))]
		rowNum += 1

for bibkey in d.keys():
	links = d[bibkey]
	if not bibkey in bib_database.keys():
		print("Error: no bib reference for "+bibkey)
	else:
		bibFile = bib_database[bibkey]
		
	
