import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Perform a GET request to the backend API
   * @param endpoint - API endpoint path
   * @param params - Optional query parameters
   * @param options - Optional HTTP options
   * @returns Observable of response
   */
  get<T>(endpoint: string, params: any = {}, options: any = {}): Observable<T> {
    const httpParams = this.buildParams(params);
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, { 
      params: httpParams,
      ...options
    }).pipe(map((response: any) => response as T));
  }

  /**
   * Perform a POST request to the backend API
   * @param endpoint - API endpoint path
   * @param body - Request body
   * @param options - Optional HTTP options
   * @returns Observable of response
   */
  post<T>(endpoint: string, body: any, options: any = {}): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, body, options)
      .pipe(map((response: any) => response as T));
  }

  /**
   * Perform a PUT request to the backend API
   * @param endpoint - API endpoint path
   * @param body - Request body
   * @param options - Optional HTTP options
   * @returns Observable of response
   */
  put<T>(endpoint: string, body: any, options: any = {}): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, body, options)
      .pipe(map((response: any) => response as T));
  }

  /**
   * Perform a DELETE request to the backend API
   * @param endpoint - API endpoint path
   * @param options - Optional HTTP options
   * @returns Observable of response
   */
  delete<T>(endpoint: string, options: any = {}): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`, options)
      .pipe(map((response: any) => response as T));
  }

  /**
   * Build HttpParams from object
   * @param params - Object containing parameters
   * @returns HttpParams object
   */
  private buildParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.append(key, params[key]);
        }
      });
    }
    return httpParams;
  }
}
