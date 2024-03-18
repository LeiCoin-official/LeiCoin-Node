

export class CommitteeConnections {

    private static instance: CommitteeConnections;

    public static getInstance() {
        if (!CommitteeConnections.instance) {
            CommitteeConnections.instance = new CommitteeConnections();
        }
        return CommitteeConnections.instance;
    }

    

    private constructor() {
        
    }
 
}


const committeeConnections = CommitteeConnections.getInstance();
export default committeeConnections;