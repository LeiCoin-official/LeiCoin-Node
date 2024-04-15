
export interface Dictionary<T> {
    [key: string]: T;
}
export interface Dict<T> extends Dictionary<T> {}


export interface AnyObject extends Dictionary<any> {}
export interface AnyObj extends AnyObject {}
