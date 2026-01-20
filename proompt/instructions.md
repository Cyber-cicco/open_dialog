Ok, now is time to make an important design decision. As you can see, there are several components that could use some keyboard interactions.
Escape when the modal is opened should close the modal, the arrow keys and enter should be able to select users on the user search field.

Also, since it is a desktop productivity app, it will most certainly need to configure a lot of keymaps. So I need to come up with a design that scales and makes the thing non confusing.

So here is what I imagine would go:
 * shared context of keymappings.
 * keymappings have conditions of applying. An open modal makes the modal keymappings exist. Closing it renders it inactive.
 * these sets of keymappings have a priority. When a modal is not opened, escape might to something. But when it is, the definition of the modal takes priority. Same for the user searche field, arrow keys might do something elsewhere, but when on a user search field, it must take priority.
 * We need to design a solution that prevents the application state and the key mapping state to be out of sync.

 So what do you think ?



