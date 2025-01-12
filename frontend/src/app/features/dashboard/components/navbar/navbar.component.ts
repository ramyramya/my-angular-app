import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { Router } from '@angular/router';
import * as bootstrap from 'bootstrap';  // Import Bootstrap JS

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  username: string = '';
  thumbnail: string = '';
  selectedFile: File | null = null;

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.dashboardService.getUserData().subscribe(data => {
      this.username = data.username;
      this.thumbnail = data.thumbnail;
    });
  }

  openModal(): void {
    const modalElement = document.getElementById('uploadModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  uploadProfilePhoto(): void {
    if (this.selectedFile) {
      // Logic for uploading the file to your backend or handling the file
      console.log('Uploading profile photo...', this.selectedFile);

      // Close modal after upload (optional)
      const modalElement = document.getElementById('uploadModal');
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement)!;
        modal.hide();
      }
    }
  }

  logout(): void {
    sessionStorage.clear();
    this.router.navigateByUrl('/auth/login');
  }
}
