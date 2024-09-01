import Elysia, { DefinitionBase, EphemeralType, MetadataBase, RouteBase, SingletonBase, type ElysiaConfig } from "elysia";

export const HTTPRouter405Route = new Elysia()

.get("/", async ({set}) => {
    set.status = 405;
    return Response.json({ message: 'Method Not Allowed' });
});


