import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { TripsService, Trip } from '../services/trips.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupportComponent } from '../support/support.component';

@Component({
  selector: 'app-trips',
  standalone: true,
  templateUrl: './trips.component.html',
  imports: [FormsModule, CommonModule, SupportComponent]
})
export class TripsComponent implements OnInit {
  trips: Trip[] = [];
  filterText = '';

  // For the "Create Trip" modal
  showCreateModal = false;
  newTrip: Partial<Trip> = {};

  // References to the create trip form inputs (will be available after modal opens)
  @ViewChild('newTripLocation') newTripLocationRef!: ElementRef;
  @ViewChild('newTripAccommodation') newTripAccommodationRef!: ElementRef;

  constructor(
    private tripsService: TripsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchTrips();
  }

  fetchTrips(): void {
    this.tripsService.getTrips().subscribe({
      next: (res) => {
        this.trips = res;
      },
      error: (err) => {
        console.error('Failed to load trips:', err);
      }
    });
  }

  openCreateTripModal(): void {
    this.showCreateModal = true;
    this.newTrip = {}; // Reset any existing data

    // Wait a tick to ensure the modal is rendered, then initialize autocomplete.
    setTimeout(() => {
      this.initializeCreateTripAutocompletes();
    }, 0);
  }

  closeCreateTripModal(): void {
    this.showCreateModal = false;
  }

  submitCreateTrip(): void {
    this.tripsService.createTrip(this.newTrip).subscribe({
      next: (createdTrip) => {
        // Add it to our local list
        this.trips.push(createdTrip);
        this.closeCreateTripModal();
      },
      error: (err) => {
        console.error('Failed to create trip:', err);
      }
    });
  }

  goToTrip(tripId: string): void {
    this.router.navigate(['/trips', tripId]);
  }

  // For a basic client-side filter
  get filteredTrips(): Trip[] {
    if (!this.filterText) return this.trips;
    const lower = this.filterText.toLowerCase();
    return this.trips.filter(trip =>
      trip.location.toLowerCase().includes(lower)
    );
  }

  // Initialize Google Places Autocomplete for newTrip form fields
  private initializeCreateTripAutocompletes(): void {
    
    if (!(window as any).google?.maps) {
      console.warn('Google Maps script not loaded or missing &libraries=places');
      return;
    }

    // Initialize Autocomplete for the Location input
    const locInput = this.newTripLocationRef.nativeElement;
    const locAuto = new google.maps.places.Autocomplete(locInput, {
      types: ['(cities)']
    });
    locAuto.addListener('place_changed', () => {
      const place = locAuto.getPlace();
      if (place && place.geometry) {
        // Use formatted address or name from the selected place
        this.newTrip.location = place.formatted_address || place.name || '';
      }
    });

    // Initialize Autocomplete for the Accommodation input
    const accomInput = this.newTripAccommodationRef.nativeElement;
    const accomAuto = new google.maps.places.Autocomplete(accomInput, {
      types: ['lodging']
    });
    accomAuto.addListener('place_changed', () => {
      const place = accomAuto.getPlace();
      if (place && place.geometry) {
        this.newTrip.accommodation = place.formatted_address || place.name || '';
      }
    });
  }
}

