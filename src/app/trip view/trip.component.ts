import {
    Component,
    OnInit,
    AfterViewInit,
    ViewChild,
    ElementRef
  } from '@angular/core';
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
  export class TripComponent implements OnInit, AfterViewInit {
    // Template refs for location and accommodation (Google Places Autocomplete)
    @ViewChild('locInput') locInputRef!: ElementRef;
    @ViewChild('accomInput') accomInputRef!: ElementRef;
  
    // The trip from the server
    trip: Trip | null = null;
  
    // A local copy for editing/binding in the template
    editTrip: Trip | null = null;
  
    // Default map center; if your doc has lat/lng, you can override
    mapCenter = { lat: 40.7128, lng: -74.0060 };
    zoom = 14;
  
    constructor(
      private route: ActivatedRoute,
      private tripsService: TripsService
    ) {}
  
    ngOnInit(): void {
      // Grab tripId from route, then fetch the trip
      const tripId = this.route.snapshot.paramMap.get('tripId');
      if (tripId) {
        this.tripsService.getTrip(tripId).subscribe({
          next: (fetchedTrip) => {
            // Save the fetched doc
            this.trip = fetchedTrip;
            // Create a deep copy for editing/binding
            this.editTrip = JSON.parse(JSON.stringify(fetchedTrip));
  
            // If the trip doc has lat/lng stored, you can center the map on it:
            // if (this.editTrip?.lat && this.editTrip?.lng) {
            //   this.mapCenter = { lat: this.editTrip.lat, lng: this.editTrip.lng };
            // }
          },
          error: (err) => {
            console.error('Failed to fetch trip:', err);
          }
        });
      }
    }
  
    ngAfterViewInit(): void {
      // Check if the Google Maps script is loaded
      if (!(window as any).google?.maps) {
        console.warn('Google Maps script not loaded or missing &libraries=places');
        return;
      }
  
      // 1) Autocomplete for "Location"
      const locAuto = new google.maps.places.Autocomplete(
        this.locInputRef.nativeElement,
        { types: ['(cities)'] }
      );
      locAuto.addListener('place_changed', () => {
        const place = locAuto.getPlace();
        if (place && place.geometry && this.editTrip) {
          this.editTrip.location = place.formatted_address || place.name || '';
          // optional: store lat/lng in the doc
          // this.editTrip.lat = place.geometry.location.lat();
          // this.editTrip.lng = place.geometry.location.lng();
        }
      });
  
      // 2) Autocomplete for "Accommodation"
      const accomAuto = new google.maps.places.Autocomplete(
        this.accomInputRef.nativeElement,
        { types: ['lodging'] }
      );
      accomAuto.addListener('place_changed', () => {
        const place = accomAuto.getPlace();
        if (place && place.geometry && this.editTrip) {
          this.editTrip.accommodation =
            place.formatted_address || place.name || '';
        }
      });
    }
  
    saveTrip(): void {
      if (!this.editTrip || !this.editTrip._id) return;
  
      // Perform PATCH /api/trips/:id with the updated data
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
  
    onMapClicked(mapEvent: google.maps.MapMouseEvent): void {
      // If user clicks on the map, add an itinerary item
      const lat = mapEvent.latLng?.lat();
      const lng = mapEvent.latLng?.lng();
      if (this.editTrip && lat && lng) {
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
  
    removeItineraryItem(index: number): void {
      this.editTrip?.itinerary?.splice(index, 1);
    }
  }
  