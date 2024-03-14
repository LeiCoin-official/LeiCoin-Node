
export class Epochs {

    private static instance: Epochs;

    public static getInstance() {
        if (!Epochs.instance) {
            Epochs.instance = new Epochs();
        }
        return Epochs.instance;
    }


}

const epochs = Epochs.getInstance();
export default epochs;