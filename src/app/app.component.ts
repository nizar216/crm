// angular import
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpinnerComponent } from './theme/shared/components/spinner/spinner.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, SpinnerComponent]
})
export class AppComponent implements OnInit {
  // public props
  title = 'mantis-free-version';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Authentication check is now handled with a flag in AuthService
    this.authService.checkSession();
  }
}
