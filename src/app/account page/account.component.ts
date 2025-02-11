import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // We need this for [(ngModel)]
import { SupportComponent } from '../support/support.component';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'account',
  standalone: true,
  imports: [CommonModule, FormsModule, SupportComponent],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css',
})
export class AccountComponent implements OnInit {
  activeSection: string = 'about';
  userData: any = null; // store user info here

  // For editing "About"
  editUser: any = {
    username: '',
    email: '',
    about: '',
    address: '',
    phone: '',
    postcode: '',
    dob: ''
  };
  

  // For Preferences
  newPref: string = '';           // new preference text
  isEditingPrefIndex: number | null = null; // track which index is being edited
  editPrefValue: string = '';     // the value of the preference being edited

  // For Family
  newMemberName: string = '';     // new family member name
  newFamilyPref: string = '';     // new preference for a family member
  editMemberIndex: number | null = null; // which family member is being edited
  editMemberName: string = '';           // the updated name for the family member

  // For editing a single preference for a family member
  isEditingFamPref: { memberIndex: number; prefIndex: number | null } | null = null;
  editFamilyPrefValue: string = '';

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Fetch user data on component load
    this.userService.getUser().subscribe({
      next: (res: any) => {
        this.userData = res;
        // Populate editUser with current values
        this.editUser.username = this.userData.username || '';
        this.editUser.email = this.userData.email || '';
        this.editUser.about = this.userData.about || '';
        this.editUser.address = this.userData.address || '';
        this.editUser.phone = this.userData.phone || '';
        this.editUser.postcode = this.userData.postcode || '';
        this.editUser.dob = this.userData.dob || '';

        // Ensure arrays exist
        if (!this.userData.preferences) {
          this.userData.preferences = [];
        }
        if (!this.userData.familyMembers) {
          this.userData.familyMembers = [];
        }
      },
      error: (err) => {
        console.error('Failed to fetch user data:', err);
      },
    });
  }

  setActiveSection(section: string) {
    this.activeSection = section;
  }

  logout() {
    this.authService.logout();
  }

  // ------------- ABOUT SECTION -------------
  saveAbout() {
    this.userData.username = this.editUser.username;
    this.userData.email = this.editUser.email;
    this.userData.about = this.editUser.about;
    this.userData.address = this.editUser.address;
    this.userData.phone = this.editUser.phone;
    this.userData.postcode = this.editUser.postcode;
    this.userData.dob = this.editUser.dob;
  
    this.userService.updateUser(this.userData).subscribe({
      next: (res: any) => {
        console.log('About info updated, including new fields.', res);
      },
      error: (err) => {
        console.error('Failed to update user info:', err);
      },
    });
  }
  

  // ------------- PREFERENCES SECTION -------------
  addPref() {
    if (!this.newPref.trim()) return;

    // Add the new preference to the array
    this.userData.preferences.push(this.newPref.trim());

    // Clear the input
    this.newPref = '';

    // Save to server
    this.userService.updateUser(this.userData).subscribe({
      next: (res: any) => {
        console.log('Preference added.', res);
      },
      error: (err) => {
        console.error('Failed to add preference:', err);
      },
    });
    console.log("addPref() called:", this.newPref);

  }

  editPref(index: number) {
    this.isEditingPrefIndex = index;
    this.editPrefValue = this.userData.preferences[index];
  }

  savePref() {
    if (this.isEditingPrefIndex === null) return;
    // Update the preference
    this.userData.preferences[this.isEditingPrefIndex] = this.editPrefValue;

    // Clear editing state
    const oldIndex = this.isEditingPrefIndex;
    this.isEditingPrefIndex = null;
    this.editPrefValue = '';

    // Save to server
    this.userService.updateUser(this.userData).subscribe({
      next: (res: any) => {
        console.log(`Preference #${oldIndex} updated.`, res);
      },
      error: (err) => {
        console.error('Failed to update preference:', err);
      },
    });
  }

  cancelPrefEdit() {
    this.isEditingPrefIndex = null;
    this.editPrefValue = '';
  }

  deletePref(index: number) {
    this.userData.preferences.splice(index, 1);

    // Save to server
    this.userService.updateUser(this.userData).subscribe({
      next: (res: any) => {
        console.log(`Preference #${index} deleted.`, res);
      },
      error: (err) => {
        console.error('Failed to delete preference:', err);
      },
    });
  }

  // ------------- FAMILY SECTION -------------
  addFamilyMember() {
    if (!this.newMemberName.trim()) return;

    // Create new family member object
    const newMember = {
      name: this.newMemberName.trim(),
      preferences: []
    };
    this.userData.familyMembers.push(newMember);

    // Clear input
    this.newMemberName = '';

    // Save to server
    this.userService.updateUser(this.userData).subscribe({
      next: (res: any) => {
        console.log('Family member added.', res);
      },
      error: (err) => {
        console.error('Failed to add family member:', err);
      },
    });
  }

  startEditMember(mIndex: number, currentName: string) {
    this.editMemberIndex = mIndex;
    this.editMemberName = currentName;
  }

  saveFamilyMemberName(mIndex: number) {
    if (mIndex === null) return;

    this.userData.familyMembers[mIndex].name = this.editMemberName;

    const oldIndex = mIndex;
    this.editMemberIndex = null;
    this.editMemberName = '';

    // Save to server
    this.userService.updateUser(this.userData).subscribe({
      next: (res: any) => {
        console.log(`Family member #${oldIndex} name updated.`, res);
      },
      error: (err) => {
        console.error('Failed to update family member name:', err);
      },
    });
  }

  cancelMemberEdit() {
    this.editMemberIndex = null;
    this.editMemberName = '';
  }

  deleteFamilyMember(mIndex: number) {
    // Remove from array
    this.userData.familyMembers.splice(mIndex, 1);

    // Save
    this.userService.updateUser(this.userData).subscribe({
      next: (res: any) => {
        console.log(`Family member #${mIndex} removed.`, res);
      },
      error: (err) => {
        console.error('Failed to remove family member:', err);
      },
    });
  }

  // Manage preferences for a single family member
  addFamilyPref(mIndex: number) {
    if (!this.newFamilyPref.trim()) return;

    this.userData.familyMembers[mIndex].preferences.push(this.newFamilyPref.trim());
    this.newFamilyPref = '';

    this.userService.updateUser(this.userData).subscribe({
      next: (res: any) => {
        console.log('Family preference added.', res);
      },
      error: (err) => {
        console.error('Failed to add family preference:', err);
      },
    });
  }

  editFamilyPref(mIndex: number, fpIndex: number) {
    this.isEditingFamPref = { memberIndex: mIndex, prefIndex: fpIndex };
    this.editFamilyPrefValue = this.userData.familyMembers[mIndex].preferences[fpIndex];
  }

  saveFamilyPref() {
    if (!this.isEditingFamPref) return;

    const { memberIndex, prefIndex } = this.isEditingFamPref;
    if (prefIndex === null) return;

    // Update the preference
    this.userData.familyMembers[memberIndex].preferences[prefIndex] = this.editFamilyPrefValue;

    // Clear editing state
    this.isEditingFamPref = null;
    this.editFamilyPrefValue = '';

    // Save to server
    this.userService.updateUser(this.userData).subscribe({
      next: (res: any) => {
        console.log('Family preference updated.', res);
      },
      error: (err) => {
        console.error('Failed to update family preference:', err);
      },
    });
  }

  cancelFamilyPrefEdit() {
    this.isEditingFamPref = null;
    this.editFamilyPrefValue = '';
  }

  deleteFamilyPref(mIndex: number, fpIndex: number) {
    this.userData.familyMembers[mIndex].preferences.splice(fpIndex, 1);

    this.userService.updateUser(this.userData).subscribe({
      next: (res: any) => {
        console.log(`Family preference #${fpIndex} removed.`, res);
      },
      error: (err) => {
        console.error('Failed to remove family preference:', err);
      },
    });
  }
}
