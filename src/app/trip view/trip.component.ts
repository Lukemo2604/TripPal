import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TripsService, Trip, ItineraryItem } from '../services/trips.service';

@Component({
  selector: 'app-trip-detail',
  standalone: true, // <-- ADD THIS
  templateUrl: './trip.component.html',
  styleUrls: ['./trip.component.css'],
  imports: [
    CommonModule, // <-- ALLOW *ngIf, *ngFor, etc.
    FormsModule   // <-- ALLOW [(ngModel)]
  ]
})
export class TripComponent implements OnInit {
  trip: Trip | null = null;     // Original data from server
  editTrip: Trip | null = null; // Copy to edit in the UI

  // Example: default map center
  mapCenter = { lat: 40.7128, lng: -74.0060 };

  constructor(
    private route: ActivatedRoute,
    private tripsService: TripsService
  ) {}

  ngOnInit(): void {
    const tripId = this.route.snapshot.paramMap.get('tripId');
    if (tripId) {
      this.tripsService.getTrip(tripId).subscribe({
        next: (fetchedTrip) => {
          this.trip = fetchedTrip;
          // Make a deep copy for editing
          this.editTrip = JSON.parse(JSON.stringify(fetchedTrip));
        },
        error: (err) => {
          console.error('Failed to fetch trip:', err);
        }
      });
    }
  }

  saveTrip(): void {
    if (!this.editTrip || !this.editTrip._id) return;

    // Call PATCH /api/trips/:id
    this.tripsService.updateTrip(this.editTrip._id, this.editTrip).subscribe({
      next: (updated) => {
        console.log('Trip updated:', updated);
        // Reassign the data
        this.trip = updated;
        this.editTrip = JSON.parse(JSON.stringify(updated));
      },
      error: (err) => {
        console.error('Failed to update trip:', err);
      }
    });
  }

  onMapClicked(mapEvent: any): void {
    const lat = mapEvent.latLng?.lat();
    const lng = mapEvent.latLng?.lng();
    if (this.editTrip && lat && lng) {
      const newPlace: ItineraryItem = {
        placeName: 'Custom Place',
        lat,
        lng
      };
      if (!this.editTrip.itinerary) this.editTrip.itinerary = [];
      this.editTrip.itinerary.push(newPlace);
    }
  }

  removeItineraryItem(index: number): void {
    if (this.editTrip?.itinerary) {
      this.editTrip.itinerary.splice(index, 1);
    }
  }
}

