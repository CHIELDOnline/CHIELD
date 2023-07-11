<h1>CHIELD FAQ</h1>

[toc]

## Coding causal links


### What do the different causal link types mean?

See the ["Relation" table](Help_CausalLinkSpecifications.html#toc_7) in the specification.


### Should I code causal links that are hypothesised or just the ones where causality has been proved?

CHIELD is a database of hypotheses, not of definitive proof.  The connections should reflect the author's ideas. Causality is very hard to demonstrate, but you can add the type of support (experimental, statistical etc.), and there are options to state that e.g. the experiment did not support the link, or that the authors only propose a correlation (~), or that the authors propose no causal link (/>).

### Can I code links that were not supported?

Yes!  There are options to state that e.g. the experiment did not support the link, or that the authors only propose a correlation (~), or that the authors propose no causal link (/>).

### How do I code an interaction effect?

There doesn't appear to be a standard way of representing interactions in causal graphs. Some have an edge which links a node to another edge (i.e. the node interferes with the effect of another link). That's not possible in CHIELD at the moment. The other option is to have a node whose label is the interaction between two variables (e.g. "content bias * population connectivity). For more discussion, see e.g. [VanderWeele & Robins (2007)'s section on sufficient causation](https://academic.oup.com/aje/article/166/9/1096/88564#80869997).

<!--In the case that the two contributing causes amplify each other, not much information is lost by just coding them as having simple links to the effect.  However, when the presence of one effect reverses the effect of another, there seems to be some call to mark this somehow.<-->

However, in many cases the issue can be resolved by thinking about the extra steps in between. 

<!--For example, you could add an extra node called "rate of dispersal", then have:

content bias > rate of dispersal
population connectivity > rate of dispersal
rate of dispersal > time to convergence

"rate of dispersal" might not be an actual parameter in your model, but I'm guessing this is part of the explanation of why these things are connected. -->

If in doubt, keep the structure simple, but add a note in the "Notes" column.

## Documents

### What kind of documents can I add?

Any peer-reviewed publication. This includes journal papers, conference abstracts and books.

### Can I add papers that I didn't write?
Yes!

### Should I add a document if the causal link is already in the database?

Yes! We want to be able to see overlapping theories, replications and converging evidence.   For hypotheses with longer histories, it's often better to just include an up-to-date review or summary of a particular theory (e.g. Dunbar 2004 covers several incremental papers by Dunbar).


### The paper I'm adding tests just one part of a larger theory. Do I code the whole theory or just the tested link?

The value of papers that test explicit links is that they provide supporting evidence for larger theories. The best solution would be to code the original theory separately (or check if it's already coded), then add the single link from the test, including the type of study.

### The paper I'm adding has several different studies for the same causal link. Which do I represent?

If a paper has e.g. a cross-cultural statistical test and an experiment, you can add both as seperate links (seperate rows in the table where the entries are mostly the same except for "type" and probably "notes").  Note that multiple links between the same nodes may not always show up in the graphical display.

## Other

### Who decides which submissions are accepted?

The github repository managers.  If you would like to become a manager, please [contact the developers](about.html).

### How is CHIELD pronounced?

Like "shield", but louder.






