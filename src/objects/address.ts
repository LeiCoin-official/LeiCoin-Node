
export class Address {

    public static getType(addressWithPrefix: string) {
        return addressWithPrefix.slice(2, addressWithPrefix.length).replace("x", "0").substring(0, 2);
    } 

}

export default Address;