import Elysia from "elysia";

export abstract class HTTPRoute extends Elysia {
    

    public get() {

    }


}


export abstract class HTTPSubRouter extends HTTPRoute {

    protected readonly app: Elysia;

    protected routes: HTTPRoute[] = [];

    constructor(app: Elysia) {
        super();
        this.app = app;
        new Elysia({
            
        })
    }

}

export class HTTPRootRouter extends HTTPSubRouter {
    protected path: string;
}

function HTTPRouter(app: Elysia) {
    app.get("/", ({}) => {
        res.send("Hello World");
    }
}