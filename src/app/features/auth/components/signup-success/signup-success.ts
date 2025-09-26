import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthApi } from '../../services/auth-api';

@Component({
  selector: 'app-signup-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './signup-success.html',
  styleUrls: ['./signup-success.scss'],
})
export class SignupSuccess implements OnInit {

  loading = true;
  errorMsg?: string;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private api: AuthApi
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (!token) {
        this.loading = false;
        this.errorMsg = 'Token manquant ou invalide.';
        return;
      }

      this.api.confirmEmail(token).subscribe({
        next: res => {
          localStorage.setItem('auth_token', res.token);
          this.api.me().subscribe({
            next: () => this.router.navigate(['/home']),
            error: () => {
              this.loading = false;
              this.errorMsg = 'Impossible de récupérer les informations utilisateur.';
            }
          });
        },
        error: () => {
          this.loading = false;
          this.errorMsg = 'Token invalide ou expiré.';
        }
      });
    });
  }
}
