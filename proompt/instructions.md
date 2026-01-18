So here is the thing. I *could* just serialize my structs into json and store them as json files. But *I don't want to*.
Since I want to use the features of git, and git works best with text files, since it can give line by line diffs, I lose this feature if I store my text in JSON strings.

Is there any good solutions to store my text into easily diffable structs ? Should I just store any multiline string in a txt file and have only a uuid identifying the name of the file ?
