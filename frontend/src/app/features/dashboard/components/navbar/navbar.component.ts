import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { Router } from '@angular/router';
import * as bootstrap from 'bootstrap';  // Import Bootstrap JS
import imageCompression from 'browser-image-compression';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  username: string = '';
  thumbnail: string = '';
  email: string = '';
  selectedFile: File | null = null;
  fileUrl: string = '';

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.dashboardService.getUserData().subscribe(data => {
      this.username = data.username;
      this.thumbnail = data.thumbnail;
      this.email = data.email;
      console.log(data);
      console.log(this.thumbnail);
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

  /*uploadProfilePhoto(): void {
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
  }*/
  
    async uploadProfilePhoto(): Promise<void> {
      if (this.selectedFile) {
        const fileName = this.selectedFile.name;
        const fileType = this.selectedFile.type;
  
        // Compress the selected image
        try {
          const compressedFile = await this.compressImage(this.selectedFile);
          console.log('Compressed file:', compressedFile);
  
          // Get presigned URL from backend
          this.dashboardService.getPresignedUrl(fileName, fileType).subscribe((response: any) => {
            if (response.success) {
              const presignedUrl = response.presignedUrl;
              console.log(response);
              this.fileUrl = response.fileUrl;
  
              // Upload the compressed file to S3 using the presigned URL
              fetch(presignedUrl, {
                method: 'PUT',
                headers: {
                  'Content-Type': fileType, // Use the file's MIME type
                },
                body: compressedFile
              })
                .then(response => {
                  if (response.ok) {
                    console.log('File uploaded successfully');
                    this.storeFileUrl(this.fileUrl);
                    this.closeModal();
                  } else {
                    console.error('Error uploading file to S3:', response.statusText);
                  }
                })
                .catch(error => {
                  console.error('Error uploading file to S3:', error);
                });
            } else {
              console.error('Error retrieving presigned URL');
            }
          });
        } catch (error) {
          console.error('Error compressing image:', error);
        }
      } else {
        console.error('No file selected for upload');
      }
    }
  
    async compressImage(file: File): Promise<File> {
      const options = {
        maxSizeMB: 1, // Limit the size to 1MB
        maxWidthOrHeight: 60, // Maximum width or height of the compressed image
        useWebWorker: true, // Use a web worker for the compression
      };
  
      try {
        const compressedFile = await imageCompression(file, options);
        return compressedFile;
      } catch (error) {
        console.error('Error compressing file:', error);
        throw error;
      }
    }



  closeModal(): void {
    const modalElement = document.getElementById('uploadModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement)!;
      this.selectedFile = null;
      modal.hide();
    }
  }

  logout(): void {
    sessionStorage.clear();
    this.authService.logout();
    this.router.navigateByUrl('/auth/login');
  }


  storeFileUrl(fileUrl: string): void {
    // Send the file URL to the backend to update the user's profile_pic
    this.dashboardService.updateProfilePic(this.fileUrl).subscribe(response => {
      if (response.success) {
        console.log('Profile picture updated successfully');
        this.thumbnail = fileUrl;  // Update the thumbnail locally for the user
      } else {
        console.error('Error updating profile picture:', response.message);
      }
    });
}

onDragOver(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();
  // Highlight the drop area
  (event.target as HTMLElement).classList.add('dragover');
}

onDragLeave(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();
  // Remove the highlight from the drop area
  (event.target as HTMLElement).classList.remove('dragover');
}

onDrop(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();
  const files = event.dataTransfer?.files;
  if (files && files[0]) {
    this.selectedFile = files[0];
  }
  // Remove the highlight from the drop area
  (event.target as HTMLElement).classList.remove('dragover');
}


}
