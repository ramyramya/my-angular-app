import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  passwordVisible: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]]
    });
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      console.log(this.signupForm.value);
      this.authService.signup(this.signupForm.value).subscribe({

        next:
          response => {
            //console.log(response);
            if (response.success) {
              this.toastr.success("Registered Successfully");
              this.router.navigateByUrl('/auth/login');
            }
            else {
              this.toastr.error('Signup failed');
            }
            //console.log('Signup successful', response);
          },
        error: error => {
          console.error('Signup failed', error);
        }
      }
      );
    }
    this.signupForm.reset();
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
}
