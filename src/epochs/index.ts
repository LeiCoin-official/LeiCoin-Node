
export class Epochs {

    private static instance: Epochs;

    public static getInstance() {
        if (!this.instance) {
            this.instance = new this();
        }
        return this.instance;
    }

    //public currentIndex: string;

    private constructor() {
                
    }


    

}

const epochs = Epochs.getInstance();
export default epochs;