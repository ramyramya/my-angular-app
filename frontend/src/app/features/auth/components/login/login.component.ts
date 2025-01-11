import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  passwordVisible: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private toastr: ToastrService, private router: Router) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      emailOrUsername: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;
      //console.log('Logging in with:', loginData);

      this.authService.login(loginData).subscribe(
        {
          next: response => {
            if (response.success) {
              sessionStorage.setItem('access_token', response.accessToken);
              sessionStorage.setItem('refresh_token', response.refreshToken);
              console.log('Logged in successfully!');
              this.toastr.success('Logged in successfully!', 'Success');
              this.loginForm.reset();
              this.router.navigateByUrl('/dashboard');
            } else {
              console.log('Login failed:', response.message);
              this.toastr.error('Login failed: ' + response.message, 'Error');
              this.loginForm.reset();
            }
          }, error: error => {
            console.error('Error during login:', error);
            // Display error notification
            this.toastr.error('An error occurred during login. Please try again.', 'Error');
          }
        });
    }
  }
}

