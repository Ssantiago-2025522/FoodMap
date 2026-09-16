import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './profile.html'
})
export class Profile implements OnInit {
    user: User | null = null;

    constructor(private authService: AuthService) {}

    ngOnInit(): void {
        this.user = this.authService.getUsuario();
    }
}