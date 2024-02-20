type LeiCoinNetDataPackageType = "block" | "transaction" | "message";

export interface LeiCoinNetDataPackageInterface {
    type: LeiCoinNetDataPackageType;
    content: string;
}

export class LeiCoinNetDataPackage {

    public static create(type: LeiCoinNetDataPackageType, content: any) {
        return JSON.stringify(
            {
                type,
                content
            }
        )
    }

    public static extract(data: string): LeiCoinNetDataPackageInterface {
        return JSON.parse(data);
    }

}
