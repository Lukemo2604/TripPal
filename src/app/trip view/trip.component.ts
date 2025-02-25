import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';

import { TripsService, Trip, ItineraryItem } from '../services/trips.service';
import { SupportComponent } from '../support/support.component';

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  templateUrl: './trip.component.html',
  styleUrls: ['./trip.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    SupportComponent,
    GoogleMapsModule
  ]
})
export class TripComponent implements OnInit {
  trip: Trip | null = null;       // The trip from the server
  editTrip: Trip | null = null;   // A local copy for editing in the form

  // Default map center (NYC). If the doc has lat/lng, you can override below.
  mapCenter = { lat: 40.7128, lng: -74.0060 };
  zoom = 14;

  constructor(
    private route: ActivatedRoute,
    private tripsService: TripsService
  ) {}

  ngOnInit(): void {
    // 1) Grab the tripId from the route
    const tripId = this.route.snapshot.paramMap.get('tripId');
    if (!tripId) return;

    // 2) Fetch the trip data from the backend
    this.tripsService.getTrip(tripId).subscribe({
      next: (fetchedTrip) => {
        // Store the fetched doc
        this.trip = fetchedTrip;
        // Create a deep copy for editing/binding
        this.editTrip = JSON.parse(JSON.stringify(fetchedTrip));

        // If your doc includes lat/lng fields, you can center the map here:
        // if (this.editTrip?.lat && this.editTrip?.lng) {
        //   this.mapCenter = { lat: this.editTrip.lat, lng: this.editTrip.lng };
        // }
      },
      error: (err) => {
        console.error('Failed to fetch trip:', err);
      }
    });
  }

  // Called when user clicks "Save" button
  saveTrip(): void {
    if (!this.editTrip || !this.editTrip._id) return;

    // 3) PATCH the updated trip data
    this.tripsService.updateTrip(this.editTrip._id, this.editTrip).subscribe({
      next: (updated) => {
        console.log('Trip updated:', updated);
        // Reassign so the page reflects the changes
        this.trip = updated;
        this.editTrip = JSON.parse(JSON.stringify(updated));
      },
      error: (err) => {
        console.error('Failed to update trip:', err);
      }
    });
  }

  // Called when user clicks on the map (to add itinerary item)
  onMapClicked(event: google.maps.MapMouseEvent): void {
    if (!this.editTrip) return;

    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();
    if (lat != null && lng != null) {
      const newPlace: ItineraryItem = {
        placeName: 'Custom Place',
        lat,
        lng
      };
      if (!this.editTrip.itinerary) {
        this.editTrip.itinerary = [];
      }
      this.editTrip.itinerary.push(newPlace);
    }
  }

  // Called when user clicks "Remove" next to an itinerary item
  removeItineraryItem(index: number): void {
    this.editTrip?.itinerary?.splice(index, 1);
  }
}
