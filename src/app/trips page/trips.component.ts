import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TripsService, Trip } from '../services/trips.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trips',
  templateUrl: './trips.component.html',
  styleUrls: ['./trips.component.css'],
  imports: [FormsModule]
})
export class TripsComponent implements OnInit {
  trips: Trip[] = [];
  filterText = '';

  // For the "Create Trip" modal
  showCreateModal = false;
  newTrip: Partial<Trip> = {};

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
  }

  closeCreateTripModal(): void {
    this.showCreateModal = false;
  }

  submitCreateTrip(): void {
    // POST /api/trips
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
    // Navigate to the single trip page
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
}

