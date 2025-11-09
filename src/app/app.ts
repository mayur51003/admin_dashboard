import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  isCollapsed = false;
  searchText = '';
  selectedStatus = 'all';
  users: any[] = [];
  filteredUsers: any[] = [];
  selectedUser: any = null;
  activeTab = 'info';

  progressPercentage = 0;

  isLoading = true;

  constructor() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    setTimeout(() => {
      fetch('/assets/users.json')
        .then((response) => response.json())
        .then((data) => {
          this.users = data.response.list;
          this.filterUsers();
          this.isLoading = false; // Loading done
        })
        .catch((err) => {
          console.error('Error loading users:', err);
          this.isLoading = false;
        });
    }, 500);
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  filterUsers() {
    let filtered = this.users;
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(
        (u) => u.userStatus.toLowerCase() === this.selectedStatus.toLowerCase()
      );
    }
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.firstName.toLowerCase().includes(search) ||
          u.lastName.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
      );
    }
    this.filteredUsers = filtered;

    // If selected user is not in filtered list, clear selection
    if (this.selectedUser && !filtered.find((u) => u.userId === this.selectedUser.userId)) {
      this.selectedUser = null;
    }
  }

  onSearchClick() {
    this.isLoading = true;
    setTimeout(() => {
      this.filterUsers();
      this.isLoading = false;
    }, 500);
  }

  clearSearch() {
    this.searchText = '';
    this.filterUsers();
  }

  onStatusChange() {
    this.filterUsers();
  }

  selectUser(user: any) {
    this.selectedUser = user;
    this.activeTab = 'info'; // Reset to info tab when selecting new user
  }

  deactivateUser() {
    if (!this.selectedUser) return;

    if (
      confirm(
        `Are you sure you want to deactivate ${this.selectedUser.firstName} ${this.selectedUser.lastName}?`
      )
    ) {
      // API call for deactivation
      console.log('Deactivating user:', this.selectedUser);

      // Update local data
      this.selectedUser.userStatus = 'Deleted';
      this.filterUsers();

      // Optionally clear selection or select next user
      this.selectedUser = null;
    }
  }

  ngOnInit() {
    this.calculateProgress();
  }

  calculateProgress() {
    const planValidity = this.selectedUser?.planValidity || 191;
    const totalDays = 365;
    this.progressPercentage = Math.round((planValidity / totalDays) * 100);
  }

  onUserSelect(user: any) {
    this.selectedUser = user;
    this.calculateProgress();
  }
}
