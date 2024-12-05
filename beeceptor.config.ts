export type BeeceptorConfig = {
    endpoint: string
    calloutProxies: {
        reqMethod: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "TRACE"
        reqCondition: (reqCond1 | reqCond2)
        resType: "sync" | "async"
        resUrl: string
    }[]
}

type reqCond1 = {
    reqCond: "Request path exactly matches" | "Request path starts with" | "Request path contains" | "Request path matches a regular expression" | "Request body contains" | "Request body matches a regular expression"
    match: string;
}

type reqCond2 = {
    reqCond: "Request header matches a regular expression"
    match: {
        http_header_name: string;
        http_header_val: string;
    }
}

export const beeceptorConfig: BeeceptorConfig = {
    endpoint: "myendpointname",
    calloutProxies: [
        {
            reqMethod: "GET",
            reqCondition: {
                reqCond: "Request path exactly matches",
                match: "/api/v1/users",
            },
            resType: "sync",
            resUrl: "https://google.com/" // <- usually this would be the URL of your server (webhook consumer) 

        },
        {
            reqMethod: "DELETE",
            reqCondition: {
                reqCond: "Request path exactly matches",
                match: "/api/v1/users",
            },
            resType: "async",
            resUrl: "https://google.com/"
        }
    ],
}