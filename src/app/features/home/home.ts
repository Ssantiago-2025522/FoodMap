import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  private userService = inject(UserService);

  readonly usuario = toSignal(this.userService.user$, {
    initialValue: this.userService.getUser()
  });
}
