
export class Epochs {

    private static instance: Epochs;

    public static getInstance() {
        if (!Epochs.instance) {
            Epochs.instance = new Epochs();
        }
        return Epochs.instance;
    }

    public currentIndex: string;
    

    private constructor() {
        
        this.name = "Epochs";

        
    }
    public a() {
        this.name = "Epochs";
    }
    

}

const epochs = Epochs.getInstance();
export default epochs;