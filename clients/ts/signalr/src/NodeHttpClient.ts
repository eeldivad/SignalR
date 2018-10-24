// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.

// import * as http from "http";
// import * as https from "https";
import * as Request from "request";
// import { URL } from "url";

import { /*AbortError,*/ HttpError /*, TimeoutError*/ } from "./Errors";
import { HttpClient, HttpRequest, HttpResponse } from "./HttpClient";
import { ILogger, LogLevel } from "./ILogger";
// import { isArrayBuffer } from "./Utils";

export class NodeHttpClient extends HttpClient {
    private readonly logger: ILogger;
    private readonly request: Request.RequestAPI<Request.Request, Request.CoreOptions, Request.RequiredUriUrl>;

    public constructor(logger: ILogger) {
        super();
        this.logger = logger;
        this.request = Request.defaults({ jar: true });
    }

    public send(httpRequest: HttpRequest): Promise<HttpResponse> {
        return new Promise<HttpResponse>((resolve, reject) => {
            // const url = new URL(httpRequest.url!);
            // const options: http.RequestOptions = {
            //     headers: {
            //         // Tell auth middleware to 401 instead of redirecting
            //         "X-Requested-With": "XMLHttpRequest",
            //         ...httpRequest.headers,
            //     },
            //     hostname: url.hostname,
            //     method: httpRequest.method,
            //     // /abc/xyz + ?id=12ssa_30
            //     path: url.pathname + url.search,
            //     port: url.port,
            // };

            this.request(httpRequest.url!, {
                headers: {
                    // Tell auth middleware to 401 instead of redirecting
                    "X-Requested-With": "XMLHttpRequest",
                    ...httpRequest.headers,
                },
                method: httpRequest.method,
                timeout: httpRequest.timeout,
            },
            (error, response, body) => {
                if (error) {
                    this.logger.log(LogLevel.Warning, `Error from HTTP request. ${error}`);
                    reject(error);
                    return;
                }

                if (response.statusCode >= 200 && response.statusCode < 300) {
                    resolve(new HttpResponse(response.statusCode, response.statusMessage || "", body));
                } else {
                    reject(new HttpError(response.statusMessage || "", response.statusCode || 0));
                }
            });

            // "any" is used here because require() can't be correctly resolved by the compiler
            // when httpOrHttps is typeof http | typeof https. Change to http when editing to get
            // intellisense.
            // const httpOrHttps: any = url.protocol === "https" ? https : http;

            // const req = httpOrHttps.request(options, (res: http.IncomingMessage) => {
            //     const data: Buffer[] = [];
            //     let dataLength = 0;
            //     res.on("data", (chunk: any) => {
            //         data.push(chunk);
            //         // Buffer.concat will be slightly faster if we keep track of the length
            //         dataLength += chunk.length;
            //     });

            //     res.on("end", () => {
            //         if (httpRequest.abortSignal) {
            //             httpRequest.abortSignal.onabort = null;
            //         }

            //         if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            //             let resp: string | ArrayBuffer;
            //             if (httpRequest.responseType === "arraybuffer") {
            //                 resp = Buffer.concat(data, dataLength);
            //                 resolve(new HttpResponse(res.statusCode, res.statusMessage || "", resp));
            //             } else {
            //                 resp = Buffer.concat(data, dataLength).toString();
            //                 resolve(new HttpResponse(res.statusCode, res.statusMessage || "", resp));
            //             }
            //         } else {
            //             reject(new HttpError(res.statusMessage || "", res.statusCode || 0));
            //         }
            //     });
            // });

            // if (httpRequest.abortSignal) {
            //     httpRequest.abortSignal.onabort = () => {
            //         req.abort();
            //         reject(new AbortError());
            //     };
            // }

            // if (httpRequest.timeout) {
            //     req.setTimeout(httpRequest.timeout, () => {
            //         this.logger.log(LogLevel.Warning, `Timeout from HTTP request.`);
            //         reject(new TimeoutError());
            //     });
            // }

            // req.on("error", (e: Error) => {
            //     this.logger.log(LogLevel.Warning, `Error from HTTP request. ${e}`);
            //     reject(e);
            // });

            // if (isArrayBuffer(httpRequest.content)) {
            //     req.write(Buffer.from(httpRequest.content));
            // } else {
            //     req.write(httpRequest.content || "");
            // }
            // req.end();
        });
    }
}
