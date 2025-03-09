import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from "rxjs";

import { Constants } from './constants';

declare type requestUrlOptions = { headers?: HttpHeaders | { [header: string]: string | string[]; }; context?: HttpContext; observe?: "body"; params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>; }; reportProgress?: boolean; withCredentials?: boolean; transferCache?: { includeHeaders?: string[]; } | boolean; };

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  public post(rel_path: string, body: { [k: string]: any }, options?: requestUrlOptions) {
    const url = Constants.BASE_URL + rel_path;
    return lastValueFrom(options ? this.http.post(url, body, {...options, responseType: "json"}) : this.http.post(url, body));
  }

  public get(rel_path: string, options?: requestUrlOptions) {
    const url = Constants.BASE_URL + rel_path;
    return lastValueFrom(options ? this.http.get(url, {...options, responseType: "json"}) : this.http.get(url));
  }
}
