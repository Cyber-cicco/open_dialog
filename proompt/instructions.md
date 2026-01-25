Ok I *might* have vibed a little too much. If I continue to iterate on the shitty state machine of oblivion that is the dialog.context.tsx, it will only get worse. I do not know enough of React to be able to design alone and with confidence a system that stinks less. So I need you to guide me.

Here is what I think:

 * wtf is going on with refs everywhere. why in the fuckedy fuck is there a ref to state variable. 
 * isInitialLoadRef should not exist. It's a thing that was made to prevent the dialog from saving when it loaded. This is completely stupid.
 * I need to have an API that allows me to define a configuration for the saving of the dialog. For now, it saves even if I drag the node. It's shit. I should have a hook with a simple API and a useEffect
 * forwardMap and reverseMap should be their own hook.
 * dialogFeed should be it's own hook.
 * Even if the dialog state depends on the graph state, having them mixed together is not a good idea. The dialog should know about the graph changes, but the graph should do it's own thing. 

