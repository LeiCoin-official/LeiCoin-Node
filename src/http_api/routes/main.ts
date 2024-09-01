import cors from "@elysiajs/cors";
import sendTransactions_route from "../sendTransactions.js";
import Elysia from "elysia";
import { HTTPRouter405Route } from "../route.js";

export const HTTPRootRouter = new Elysia()

.use(cors({
    origin: "*"
}))

.use(HTTPRouter405Route)

.get('/', async ({set}) => {
    set.status = 200;
    return Response.json({ message: "Online" });
})

.use(sendTransactions_route)