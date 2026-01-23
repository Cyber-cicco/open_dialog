I won't do it for now because I'm not sure of my design choices, but I feel like there is a ground for a git compatible local first database in this project. Every storage follows a pattern, and every time I want to ensure coherence because of foreign  keys in my struct, I have to do so manually, but always in the same way.

You could define something like this:

```rust

pub struct Test1 {
    id:Uuid
    data:Text // this text file will be saved in a plain text file to help with git diffing
    #[foreign_key(Test2.id)]
    tes2_id: Uuid
}

pub struct Test2 {
    ...
}
```
foreign key stores a test2_test1.json in a meta directory that ensures things are coherent when creating, deleting or updating a test1 / test2.

What do you think ? Don't implement anything, just brainstorming here. 
