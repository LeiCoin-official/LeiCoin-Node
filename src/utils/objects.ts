
interface Dictionary<T> {
    [key: string]: T;
}

interface AnyObject extends Dictionary<any> {}

export { Dictionary as Dict }
export { AnyObject as AnyObj }
