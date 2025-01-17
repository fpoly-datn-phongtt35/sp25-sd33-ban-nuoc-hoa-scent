import { Injectable } from '@angular/core';
import { UserResponse } from '../../responses/user/user.reponse';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly USER_KEY = 'user';

  getUserResponseFromLocalStorage(): UserResponse | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  setUserResponseToLocalStorage(user: UserResponse): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  clearUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }
}
