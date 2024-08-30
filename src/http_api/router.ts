import Elysia, { Handler } from "elysia";
import { InlineHandler } from "elysia/dist/types";

export abstract class HTTPRoute {
    abstract path: string;

    async get(...args[]: typeof Elysia.prototype.get.) {
        return;
        
    }

}

function hi({handler, request, response}: InlineHandler<Schema, Singleton & {
    derive: Ephemeral['derive'] & Volatile['derive'];
    resolve: Ephemeral['resolve'] & Volatile['resolve'];
}, JoinPath<BasePath, Path>) {
    handler.set(response, 200, "Hi");
            
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