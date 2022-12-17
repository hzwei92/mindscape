# mindscape.pub

https://mindscape.pub is an open source, nested graph forum.

The owner of a post can "open" the post, so that it contains its own subgraph of posts. 

The owner is then the moderator of that subgraph, able to modify its overall layout
(including removal of posts).

When a user posts into someone else's subgraph, they can modify the layout (including removal) only for their own posts.

Posts that are removed from a particular subgraph remain in the overall graph.

Posts can be linked to one another, as well as pasted into subgraphs.

# The Arrow Protocol

Mindscape is a client-server architecture that implements the Arrow Protocol.

The Arrow Protocol seeks to enable the composition of data into modular trees, called subgraphs, that are local views of a global graph.

The key innovation of the Arrow Protocol is the usage of Arrows instead of embedded URIs to link information together. 

An Arrow is essentially a row or object with the structure (id_URI, source_URI, target_URI).

source_URI and target_URI can be set to NULL or to id_URI to implement a post.

otherwise, source_URI !== target_URI, and the Arrow functions as a link.

Twigs are an additional data type used to define the layout of a subgraph.

They enable a single Arrow to take part in multiple subgraphs.
