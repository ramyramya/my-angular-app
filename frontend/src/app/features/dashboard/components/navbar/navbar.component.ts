/*import { Component, OnInit } from '@angular/core';
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
}*/

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
  profile_pic: string = '';
  email: string = '';
  selectedFile: File | null = null;
  fileUrl: string = '';

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.dashboardService.getUserData().subscribe(data => {
      this.username = data.username;
      this.profile_pic = data.profile_pic;
      this.email = data.email;
      console.log(data);
      console.log(this.profile_pic);
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
      const fileName = this.selectedFile.name;
      const fileType = this.selectedFile.type;
  
      // Get presigned URL from backend
      this.dashboardService.getPresignedUrl(fileName, fileType).subscribe((response: any) => {
        if (response.success) {
          const presignedUrl = response.presignedUrl;
          console.log(response);
          this.fileUrl = response.fileUrl
  
          // Upload file to S3 using the presigned URL
          fetch(presignedUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': fileType // Use the unencoded "image/jpeg"
              //'x-amz-acl': 'public-read', // Include if it's part of the signed headers
            },
            body: this.selectedFile
          })
            .then(response => {
              if (response.ok) {
                console.log('File uploaded successfully');
                //this.thumbnail = response.fileUrl;
                this.storeFileUrl(this.fileUrl);
                this.closeModal();
              } else {
                console.error('Error uploading file to S3:', response.statusText);
                console.log(response.text());
              }
            })
            .catch(error => {
              console.error('Error uploading file to S3:', error);
            });
          
        } else {
          console.error('Error retrieving presigned URL');
        }
      });
    } else {
      console.error('No file selected for upload');
    }
  }
  

  closeModal(): void {
    const modalElement = document.getElementById('uploadModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement)!;
      modal.hide();
    }
  }

  logout(): void {
    sessionStorage.clear();
    this.router.navigateByUrl('/auth/login');
  }


  storeFileUrl(fileUrl: string): void {
    // Send the file URL to the backend to update the user's profile_pic
    this.dashboardService.updateProfilePic(this.fileUrl).subscribe(response => {
      if (response.success) {
        console.log('Profile picture updated successfully');
        //this.thumbnail = fileUrl;  // Update the thumbnail locally for the user
      } else {
        console.error('Error updating profile picture:', response.message);
      }
    });
}

}
