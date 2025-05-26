import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

export interface User {
  idUser: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // The apiUrl already contains '/api', so we don't need to repeat it
  private readonly USER_API = `${environment.apiUrl}/users`;
  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  private sessionChecked = false;

  constructor(private http: HttpClient, private router: Router) {
    // Session check moved to APP_INITIALIZER or explicit call
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.USER_API}/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.user) {
            this.currentUserSubject.next(response.user);
            localStorage.setItem('currentUser', JSON.stringify(response.user));
          }
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.USER_API}/logout`, {})
      .pipe(
        tap(() => {
          this.currentUserSubject.next(null);
          localStorage.removeItem('currentUser');
          this.router.navigate(['/login']);
        })
      );
  }

  checkSession(): void {
    // Prevent duplicate calls
    if (this.sessionChecked) return;
    
    // First check local storage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }

    // Then verify with the server
    this.http.get<{ user: User | null }>(`${this.USER_API}/check-session`)
      .subscribe({
        next: (response) => {
          this.sessionChecked = true;
          if (response.user) {
            this.currentUserSubject.next(response.user);
            localStorage.setItem('currentUser', JSON.stringify(response.user));
          } else {
            this.currentUserSubject.next(null);
            localStorage.removeItem('currentUser');
          }
        },
        error: () => {
          this.sessionChecked = true;
          this.currentUserSubject.next(null);
          localStorage.removeItem('currentUser');
        }
      });
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }
}
