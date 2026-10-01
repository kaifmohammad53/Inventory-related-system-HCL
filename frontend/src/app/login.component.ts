import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from './api.service';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-logo">Retail<span>Inventory</span></div>

        @if (mode === 'login') {
          <h1>Welcome Back</h1>
          <p class="subtitle">Sign in to your inventory management system</p>

          <!-- GOOGLE SIGN-IN BUTTON -->
          <button type="button" class="google-signin-btn" (click)="signInWithGoogle()" [disabled]="googleLoading">
            <svg class="google-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>{{ googleLoading ? 'Authenticating with Google...' : 'Continue with Google' }}</span>
          </button>

          <div class="divider">
            <span>or sign in with email</span>
          </div>

          <form (ngSubmit)="login()">
            <div class="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                [(ngModel)]="email"
                placeholder="Enter your email"
                required
              />
            </div>

            <div class="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                [(ngModel)]="password"
                placeholder="Enter your password"
                required
              />
            </div>

            @if (successMessage) {
              <div class="success-message">
                {{ successMessage }}
              </div>
            }

            @if (errorMessage) {
              <div class="error-message">
                {{ errorMessage }}
              </div>
            }

            <button type="submit" class="login-btn" [disabled]="loading || googleLoading">
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <div class="auth-switch">
            <span>Don't have an account?</span>
            <button type="button" class="switch-link-btn" (click)="switchToRegister()">Create Account</button>
          </div>
        } @else {
          <h1>Create Account</h1>
          <p class="subtitle">Register for inventory portal access</p>

          <form (ngSubmit)="register()">
            <div class="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="regFullName"
                [(ngModel)]="regFullName"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div class="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="regEmail"
                [(ngModel)]="regEmail"
                placeholder="Enter your email address"
                required
              />
            </div>

            <div class="form-group">
              <label>Password</label>
              <input
                type="password"
                name="regPassword"
                [(ngModel)]="regPassword"
                placeholder="Create password (minimum 6 characters)"
                required
              />
            </div>

            <div class="form-group">
              <label>Role</label>
              <select name="regRole" [(ngModel)]="regRole" class="form-select">
                <option value="WAREHOUSE_MANAGER">Warehouse Manager</option>
                <option value="STORE_MANAGER">Store Manager</option>
                <option value="SUPPLIER">Supplier</option>
              </select>
            </div>

            @if (successMessage) {
              <div class="success-message">
                {{ successMessage }}
              </div>
            }

            @if (errorMessage) {
              <div class="error-message">
                {{ errorMessage }}
              </div>
            }

            <button type="submit" class="login-btn" [disabled]="loading">
              {{ loading ? 'Registering...' : 'Create Account' }}
            </button>
          </form>

          <div class="auth-switch">
            <span>Already have an account?</span>
            <button type="button" class="switch-link-btn" (click)="switchToLogin()">Sign In</button>
          </div>
        }
      </div>
    </div>
  `,

  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }

      .login-page {
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: linear-gradient(135deg, #eff6ff, #dbeafe);
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }

      .login-card {
        width: 420px;
        background: white;
        border-radius: 16px;
        padding: 36px 40px;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
      }

      .login-logo {
        text-align: center;
        font-size: 26px;
        font-weight: 700;
        color: #111827;
        margin-bottom: 20px;
        letter-spacing: -0.5px;
      }

      .login-logo span {
        color: #2563eb;
      }

      h1 {
        text-align: center;
        margin: 0 0 6px;
        font-size: 23px;
        font-weight: 700;
        color: #111827;
      }

      .subtitle {
        text-align: center;
        color: #64748b;
        font-size: 13.5px;
        margin-bottom: 22px;
      }

      .google-signin-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 11px 16px;
        background: #ffffff;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        color: #374151;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .google-signin-btn:hover:not(:disabled) {
        background: #f9fafb;
        border-color: #9ca3af;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      .google-signin-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .divider {
        display: flex;
        align-items: center;
        text-align: center;
        margin: 20px 0;
        color: #94a3b8;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .divider::before,
      .divider::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid #e2e8f0;
      }

      .divider span {
        padding: 0 12px;
      }

      .form-group {
        margin-bottom: 16px;
      }

      label {
        display: block;
        margin-bottom: 6px;
        font-size: 13px;
        font-weight: 600;
        color: #334155;
      }

      input, .form-select {
        width: 100%;
        box-sizing: border-box;
        padding: 11px 14px;
        border: 1px solid #dbe2ea;
        border-radius: 8px;
        font-size: 14px;
        outline: none;
        background: #ffffff;
        color: #1e293b;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }

      input:focus, .form-select:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }

      .login-btn {
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 8px;
        background: #2563eb;
        color: white;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
        margin-top: 4px;
      }

      .login-btn:hover:not(:disabled) {
        background: #1d4ed8;
      }

      .login-btn:disabled {
        background: #94a3b8;
        cursor: not-allowed;
      }

      .error-message {
        background: #fee2e2;
        color: #991b1b;
        border: 1px solid #fecaca;
        padding: 10px 12px;
        border-radius: 7px;
        margin-bottom: 14px;
        font-size: 13px;
      }

      .success-message {
        background: #dcfce7;
        color: #166534;
        border: 1px solid #bbf7d0;
        padding: 10px 12px;
        border-radius: 7px;
        margin-bottom: 14px;
        font-size: 13px;
      }

      .auth-switch {
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid #f1f5f9;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        font-size: 13.5px;
        color: #64748b;
      }

      .switch-link-btn {
        background: none;
        border: none;
        padding: 0;
        color: #2563eb;
        font-size: 13.5px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: underline;
        transition: color 0.15s ease;
      }

      .switch-link-btn:hover {
        color: #1d4ed8;
      }
    `,
  ],
})
export class LoginComponent implements OnInit, AfterViewInit {
  mode: 'login' | 'register' = 'login';

  email = '';
  password = '';

  regFullName = '';
  regEmail = '';
  regPassword = '';
  regRole = 'WAREHOUSE_MANAGER';

  loading = false;
  googleLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private api: ApiService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Check if user is already logged in
    if (localStorage.getItem('token')) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngAfterViewInit(): void {
    this.initGoogleAuth();
  }

  private initGoogleAuth(): void {
    try {
      if (typeof google !== 'undefined' && google?.accounts?.id) {
        google.accounts.id.initialize({
          client_id: '407408718192.apps.googleusercontent.com', // Generic dev client id
          callback: (response: any) => this.handleGoogleCredential(response.credential),
        });
      }
    } catch (e) {
      console.warn('Google Identity SDK initializing fallback mode:', e);
    }
  }

  signInWithGoogle(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (typeof google !== 'undefined' && google?.accounts?.id) {
      this.googleLoading = true;
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          this.googleLoading = false;
          // Prompt fallback direct prompt
          this.promptGoogleTokenInput();
        }
      });
    } else {
      this.promptGoogleTokenInput();
    }
  }

  private promptGoogleTokenInput(): void {
    const token = prompt('Enter or paste your Google ID Token to authenticate with Spring Boot:');
    if (token && token.trim()) {
      this.handleGoogleCredential(token.trim());
    } else {
      this.googleLoading = false;
    }
  }

  async handleGoogleCredential(credential: string): Promise<void> {
    this.googleLoading = true;
    this.errorMessage = '';

    try {
      const response = await this.api.post<any>('/auth/google', {
        idToken: credential,
        requestedRole: this.regRole || 'STORE_MANAGER',
      });

      localStorage.setItem('token', response.token);
      localStorage.setItem('userEmail', response.email);
      localStorage.setItem('userName', response.fullName);
      localStorage.setItem('userRole', response.role);

      await this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.error('Google login failed:', error);
      this.errorMessage = error?.message || 'Google authentication failed. Please try again.';
    } finally {
      this.googleLoading = false;
    }
  }

  switchToRegister(): void {
    this.mode = 'register';
    this.errorMessage = '';
    this.successMessage = '';
  }

  switchToLogin(): void {
    this.mode = 'login';
    this.errorMessage = '';
    this.successMessage = '';
  }

  async login(): Promise<void> {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const response = await this.api.post<any>('/auth/login', {
        email: this.email,
        password: this.password,
      });

      localStorage.setItem('token', response.token);
      localStorage.setItem('userEmail', response.email);
      localStorage.setItem('userName', response.fullName);
      localStorage.setItem('userRole', response.role);

      await this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.error('Login failed:', error);
      this.errorMessage = error?.message || 'Invalid email or password. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async register(): Promise<void> {
    if (!this.regFullName.trim()) {
      this.errorMessage = 'Please enter your full name.';
      return;
    }
    if (!this.regEmail.trim()) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }
    if (!this.regPassword || this.regPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const response = await this.api.post<any>('/auth/register', {
        fullName: this.regFullName.trim(),
        email: this.regEmail.trim(),
        password: this.regPassword,
        role: this.regRole,
      });

      if (response && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userEmail', response.email);
        localStorage.setItem('userName', response.fullName);
        localStorage.setItem('userRole', response.role);
        await this.router.navigate(['/dashboard']);
      } else {
        this.successMessage = 'Account created successfully! Please sign in.';
        this.email = this.regEmail;
        this.mode = 'login';
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      this.errorMessage = error?.message || 'Registration failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}
