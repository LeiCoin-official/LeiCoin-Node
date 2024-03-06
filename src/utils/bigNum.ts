export default class BigNum {

    public static add(v1: string, v2: string) {
        return (BigInt(v1) + BigInt(v2)).toString();
    }

    public static subtract(v1: string, v2: string) {
        return (BigInt(v1) - BigInt(v2)).toString();
    }

    public static greater(v1: string, v2: string) {
        return BigInt(v1) > BigInt(v2);
    }

    public static greaterOrEqual(v1: string, v2: string) {
        return BigInt(v1) >= BigInt(v2);
    }

    public static less(v1: string, v2: string) {
        return BigInt(v1) < BigInt(v2);
    }

    public static lessOrEqual(v1: string, v2: string) {
        return BigInt(v1) <= BigInt(v2);
    }

    public static max(v1: string, v2: string) {
        return this.greater(v1, v2) ? v1 : v2;
    }

    public static min(v1: string, v2: string) {
        return this.less(v1, v2) ? v1 : v2;
    }

}