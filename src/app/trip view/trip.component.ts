import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // For navigation
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { tripPalMapStyles } from '../map/map-styles'; // Custom map styles
import { TripsService, Trip, ItineraryItem } from '../services/trips.service';
import { SupportComponent } from '../support/support.component';
import { UserService } from '../services/user.service';

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
  trip: Trip | null = null;       // The trip fetched from the backend
  editTrip: Trip | null = null;   // A deep copy used for editing and binding

  // Default map center (NYC). Optionally, recenter using geocodeAddress().
  mapCenter = { lat: 40.7128, lng: -74.0060 };
  zoom = 14;

  mapOptions: google.maps.MapOptions = {
    styles: tripPalMapStyles,
  };

  // Popup properties for deletion feedback
  popupMessage: string = '';
  showPopup: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private tripsService: TripsService,
    private router: Router,
    private userService: UserService // To fetch user (and familyMembers) data
  ) {}

  ngOnInit(): void {
    const tripId = this.route.snapshot.paramMap.get('tripId');
    if (!tripId) return;

    // Fetch the trip data from the backend
    this.tripsService.getTrip(tripId).subscribe({
      next: (fetchedTrip) => {
        // Save the fetched trip document
        this.trip = fetchedTrip;
        // Create a deep copy for editing/binding
        this.editTrip = JSON.parse(JSON.stringify(fetchedTrip));

        // Optionally recenter the map if the trip has a location (using geocodeAddress)
        if (this.editTrip?.location) {
          this.geocodeAddress(this.editTrip.location);
        }

        // If familyAttending is empty, fetch family members from the user document
        if (this.editTrip && (!this.editTrip.familyAttending || this.editTrip.familyAttending.length === 0)) {
          this.userService.getUser().subscribe({
            next: (user: any) => {
              // Assume the user document contains a sub-array called familyMembers
              // Each member is an object with at least a "name" property
              const members = user.familyMembers || [];
              // Map each family member to an object that fits the expected structure:
              // We'll use the family member's name as a unique identifier (familyMemberId)
              this.editTrip!.familyAttending = members.map((member: any) => ({
                familyMemberId: member.name, // If no specific ID exists, use name as a fallback
                name: member.name,
                attending: false
              }));
              // Update the trip document with the new familyAttending array
              this.tripsService.updateTrip(this.editTrip!._id, this.editTrip as Partial<Trip>).subscribe({
                next: (updatedTrip) => {
                  console.log('Trip updated with family attending:', updatedTrip);
                  this.trip = updatedTrip;
                  this.editTrip = JSON.parse(JSON.stringify(updatedTrip));
                },
                error: (err) => {
                  console.error('Failed to update trip with family attending:', err);
                }
              });
            },
            error: (err) => {
              console.error('Failed to fetch user:', err);
            }
          });
        }
      },
      error: (err) => {
        console.error('Failed to fetch trip:', err);
      }
    });
  }

  /**
   * Uses Google Geocoder to convert an address string into coordinates,
   * and updates mapCenter to recenter the map.
   */
  private geocodeAddress(address: string): void {
    if (!(window as any).google?.maps) {
      console.warn('Google Maps script not loaded');
      return;
    }
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results.length > 0) {
        const latLng = results[0].geometry.location;
        this.mapCenter = { lat: latLng.lat(), lng: latLng.lng() };
      } else {
        console.warn('Geocode was not successful for address "' + address + '": ' + status);
      }
    });
  }

  // Called when the user clicks "Save" button
  saveTrip(): void {
    if (!this.editTrip || !this.editTrip._id) return;

    this.tripsService.updateTrip(this.editTrip._id, this.editTrip as Partial<Trip>).subscribe({
      next: (updated) => {
        console.log('Trip updated:', updated);
        this.trip = updated;
        this.editTrip = JSON.parse(JSON.stringify(updated));
      },
      error: (err) => {
        console.error('Failed to update trip:', err);
      }
    });
  }

  // Called when the user clicks "Delete Trip" button
  deleteTrip(): void {
    if (!this.editTrip || !this.editTrip._id) return;

    this.tripsService.deleteTrip(this.editTrip._id).subscribe({
      next: () => {
        console.log('Trip deleted successfully.');
        this.popupMessage = 'Trip successfully deleted.';
        this.showPopup = true;
        setTimeout(() => {
          this.router.navigate(['/trips']);
        }, 1000);
      },
      error: (err) => {
        console.error('Failed to delete trip:', err);
      }
    });
  }

  // Called when the user clicks on the map (to add an itinerary item)
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

  // Called when the user clicks "Remove" next to an itinerary item
  removeItineraryItem(index: number): void {
    this.editTrip?.itinerary?.splice(index, 1);
  }
}
