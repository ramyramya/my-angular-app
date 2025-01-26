import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Extract the token from the URL
    this.token = this.route.snapshot.queryParams['token'] || '';
  }

  onSubmit() {
    if (this.newPassword !== this.confirmPassword) {
      this.toastr.error('Passwords do not match');
      return;
    }

    // Call the back-end to reset the password
    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.toastr.success('Password reset successfully');
        this.authService.clearTokens();
        sessionStorage.removeItem('user_id');
        this.router.navigateByUrl('/auth/login');
      },
      error: (err) => {
          this.toastr.error('Failed to reset the password. Please try again.');
      },
    });
  }
}

