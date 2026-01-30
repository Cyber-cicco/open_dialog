So I have this idea about rearranging the way my dialog nodes are stored.

I need these files to be diffable. And JSON is not. commas can get messy, so I was thinking about NDJSON, one line per node.

But I need to make sure diffs make sense. So I was thinking about sorting the nodes by id. Do you think that is sound ?


