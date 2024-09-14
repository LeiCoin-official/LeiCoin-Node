import Elysia from "elysia";

export function HTTPRouter405Route() {
    return new Elysia()
    .all("/", async ({set}) => {
        return Response.json({ message: 'Method Not Allowed' }, { status: 405 });
    });
}