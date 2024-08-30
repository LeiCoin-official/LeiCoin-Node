import Elysia, { Handler } from "elysia";

export abstract class HTTPRoute {
    abstract path: string;

    async get(handler: Handler = {set}) {
        
    }

}

export abstract class HTTPSubRouter extends HTTPRoute {

    protected app: Elysia;

    protected routes: HTTPRoute[] = [];

    constructor(app: Elysia) {
        super();
        this.app = app.get("/hi", ({set}) => {
            
        });
    }

}

export class HTTPRootRouter extends HTTPSubRouter {
    


}