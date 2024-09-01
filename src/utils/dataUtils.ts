
export type ObjORNull<T> = T | null;

export interface Dict<T> {
    [key: string | number]: T;
}

export interface AnyObj extends Dict<any> {}


export class CStatic {
    protected constructor() {}
}


// Define a generic interface representing the class structure
interface Constructable<T> {
    new (...args: any[]): T;
}


type New<T = any> = new (...args: any[]) => T;
type AbstractNew<T = any> = abstract new (...args: any[]) => T;

export type Static<
    C extends New<InstanceType<C>> | AbstractNew<InstanceType<C>>,
    SI,
    I = SI extends New<any> ? InstanceType<SI> : {}
> = 
    C extends New<InstanceType<C>> 
    // ConcreteClass
    ? InstanceType<C> extends I 
        ? C extends (SI & New<InstanceType<C>>)
            ? (InstanceType<C> & I)
            : (SI & New<InstanceType<C>>) // Indicate StaticInterface Error
        : I // Indicate Interface Error
    // AbstractClass
    : InstanceType<C> extends I 
        ? C extends (SI & AbstractNew<InstanceType<C>>)
            ? (InstanceType<C> & I)
            : (SI & AbstractNew<InstanceType<C>>) // Indicate StaticInterface Error
        : I // Indicate Interface Error



interface IBasicModuleLike {
    initialized: boolean;

    init(...args: any[]): Promise<void> | void;
    stop(...args: any[]): Promise<void> | void;
}
interface IModuleLike extends IBasicModuleLike {
    started: boolean;

    start(...args: any[]): Promise<void> | void;
}
export type BasicModuleLike<C extends New<InstanceType<C>> | AbstractNew<InstanceType<C>>> = Static<C, IBasicModuleLike>;
export type ModuleLike<C extends New<InstanceType<C>> | AbstractNew<InstanceType<C>>> = Static<C, IModuleLike>;

//export class ModuleLike<C extends New<InstanceType<C>> | AbstractNew<InstanceType<C>>> extends CStatic implements Static<C, IModuleLike> {}

export class DataUtils {

    // Function to get the current date and time as a formatted string
    public static getCurrentLogTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const second = String(now.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}-${hour}-${minute}-${second}`;
    }

    // Define a function to create an instance of a class from a JSON object
    public static createInstanceFromJSON<T>(cls: Constructable<T>, json: any): T {
        // Retrieve the constructor of the class
        //const constructor = cls as any;
    
        // Retrieve the parameter names of the constructor
        //const paramNames = constructor.toString().match(/\(([^)]+)\)/)?.[1].split(',').map((param: string) => param.trim()) || [];
        const paramNames = cls.toString().match(/\(([^)]+)\)/)?.[1].split(',').map((param: string) => param.trim()) || [];
    
        // Create an array of arguments for the constructor
        const args = paramNames.map((paramName: string) => json[paramName]);
    
        // Instantiate the class with the arguments
        const instance = Reflect.construct(cls, args);
    
        // Return the instance
        return instance;
    }

    public sortObjectAlphabetical<T extends Object>(obj: T): T {
        const deepSort = (input: any): any => {
            if (typeof input !== 'object' || input === null) {
                return input;
            }
    
            if (Array.isArray(input)) {
                return input.map(deepSort);
            }
    
            const sortedObj: Dict<any> = {};
            Object.keys(input)
                .sort()
                .forEach(key => {
                    sortedObj[key] = deepSort(input[key]);
                });
            return sortedObj;
        };
    
        const sortedObj = deepSort(obj);
        return sortedObj;
    }

    /*
    public static calculateEpochAndRelativeSlot(slotIndex: string) {
        const currentEpoch = BigNum.divide(slotIndex, Constants.BLOCKS_PER_EPOCH);
        const relativeSlot = BigNum.mod(slotIndex, Constants.BLOCKS_PER_EPOCH);
        return { currentEpoch, relativeSlot };
    }
    */

    public static replaceAtIndex(str: string, searchValue: string, replaceValue: string, index: number) {
        if (index < 0 || index >= str.length) {
            return str;
        }
        const nextIndex = str.indexOf(searchValue, index);
        if (nextIndex === -1) {
            return str;
        }
        return str.substring(0, nextIndex) + replaceValue + str.substring(nextIndex + searchValue.length);
    }

}

