Don't implement anything yet, this is just planning phase.

I want to have a dialog feed on the right panel. By default, it would take the root node of the struct, and find it's way to the end, or until it revisits a node if there are no dead ends. If a node is not linked to anything or the root node, it goes without saying that you should not be able to see it on the dialog feed.
I'll also need to link the field context of the things on the right panel to their corresponding node, so that will be quite a pain. I want the user to be able to edit the dialog both in the right panel and in the nodes. 
When a node is edited on the panel, it needs to check if the current dialog feed contains the node. If not, it must reconstruct a feed to the root node. If it does not find a way to the root node, than it must not be on the dialog feed, and only edited in the node.

Also, I think it might be a good idea that, if a path reached it's end on the dialog feed, you could have a button to insert a node directly from the dialog feed, and edit it inside of it.

We might need to add convenience functionnalities later, like deleting a node in the feed, autolinking the next field to the previous field if the deleted field was a basic dialog node, etc.

So I think I might need keep two maps in memory : one of sources to targets, and one targets to sources, in order to be able to traverse the struct in O(1) time. What do you think ?
