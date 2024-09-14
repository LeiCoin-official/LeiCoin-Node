import cors from "@elysiajs/cors";
import sendTransactions_route from "./transaction.js";
import Elysia from "elysia";
import { HTTPRouter405Route } from "../route.js";

export const HTTPRootRouter = new Elysia()

.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
}))

.onError(({ code }) => {
    switch (code) {
        case "NOT_FOUND":
            return Response.json({ message: 'Not Found' }, { status: 404 });
        case "INTERNAL_SERVER_ERROR":
            return Response.json({ message: 'Internal Server Error', status: 500 });
        case "VALIDATION":
            return Response.json({ message: 'Validation Error' }, { status: 400 });
        case "PARSE":
            return Response.json({ message: 'Parse Error' }, { status: 400 });
        case "INVALID_COOKIE_SIGNATURE":
            return Response.json({ message: 'Invalid Cookie Signature' }, { status: 400 });
        case "UNKNOWN":
        default:
            return Response.json({ message: 'Unknown Error' }, { status: 500 });
    }
})

.use(HTTPRouter405Route())

.get('/', async () => {
    return Response.json({ message: "Online" }, { status: 200 });
})

.use(sendTransactions_route)

