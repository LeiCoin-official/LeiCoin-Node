
export class NetworkUtils {

    static splitHostAndPort(uri: string): [string | null, number | null] {

        const dataArray = uri.split(/:(?=[^:]*$)/);
        const host = dataArray[0] || null;
        const port = dataArray[1] ? parseInt(dataArray[1]) : null;

        return [host, port];
    }


}
