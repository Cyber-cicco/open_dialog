* Always follow the patterns given in the examples.
* Don't use too much useEffect on one component, especially not with useState. If you have to do so, you should create a specialized hook.
* useCallBack and useMemo when necessary. If a function does not interfer with a component state, extract it from the component.
* When I ask you to change a component and there is a layout shift, give back the whole component. Only give back diffs if they are small.
