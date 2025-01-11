import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  username: string = '';
  thumbnail: string = '';

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.dashboardService.getUserData().subscribe(data => {
      console.log(data);
      this.username = data.username;
      this.thumbnail = data.thumbnail;
    });
    console.log(this.username);
    console.log(this.thumbnail);
  }

  logout(): void {
    sessionStorage.clear();
    window.location.href = '/login';
  }

  updateProfilePhoto(): void {
    alert('Profile photo update functionality coming soon!');
  }
}
