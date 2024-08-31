import Elysia, { Handler } from "elysia";
import { InlineHandler } from "elysia/dist/types";

export abstract class HTTPRoute {
    abstract path: string;

    async get(...args[]: typeof Elysia.prototype.get.) {
        return;
        
    }

}


export abstract class HTTPSubRouter extends HTTPRoute {

    protected app: Elysia;

    protected routes: HTTPRoute[] = [];

    constructor(app: Elysia) {
        super();
        this.app = app.get("/", ({server}) => {
            
        });
    }

}

export class HTTPRootRouter extends HTTPSubRouter {
    path: string;
    


}

function () {
    
}