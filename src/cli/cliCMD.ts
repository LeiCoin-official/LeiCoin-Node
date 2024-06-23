

export abstract class CLICMD {

    public abstract name: string;
    public abstract description: string;
    public abstract usage: string;

    public abstract run(args: string[], parent_args: string[]): Promise<void>;

}

export default CLICMD;

