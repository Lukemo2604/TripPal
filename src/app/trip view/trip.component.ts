import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';

import { tripPalMapStyles } from '../map/map-styles'; // Custom map styles
import { TripsService, Trip, ItineraryItem } from '../services/trips.service';
import { SupportComponent } from '../support/support.component';
import { UserService } from '../services/user.service';

interface DayInfo {
  dayIndex: number;   // e.g. 1, 2, 3
  date: string;       // e.g. "2025-04-18"
}

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
  trip: Trip | null = null;       
  editTrip: Trip | null = null;   
  expandFlights = false;

  // We store an array of day objects, each with dayIndex and date
  days: DayInfo[] = [];

  // For each day, we keep a "new activity" form object in a dictionary
  newActivityForDay: { [dayIndex: number]: ItineraryItem } = {};

  expandedDays: { [key: number]: boolean } = {};

  // Default map center
  mapCenter = { lat: 40.7128, lng: -74.0060 };
  zoom = 14;

  mapOptions: google.maps.MapOptions = {
    styles: tripPalMapStyles,
  };

  // Popup for save/delete feedback
  popupMessage: string = '';
  showPopup: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private tripsService: TripsService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const tripId = this.route.snapshot.paramMap.get('tripId');
    if (!tripId) return;

    this.tripsService.getTrip(tripId).subscribe({
      next: (fetchedTrip) => {
        this.trip = fetchedTrip;
        this.editTrip = JSON.parse(JSON.stringify(fetchedTrip));

        // Ensure itinerary array
        if (!this.editTrip?.itinerary) {
          this.editTrip!.itinerary = [];
        }

        // Ensure flights
        if (this.editTrip && !this.editTrip.flights) {
          this.editTrip.flights = {
            departing: { flightNumber: '', departureTime: '', arrivalTime: '' },
            arriving: { flightNumber: '', departureTime: '', arrivalTime: '' }
          };
        }

        // If there's a location, optionally recenter map
        if (this.editTrip?.location) {
          this.geocodeAddress(this.editTrip.location);
        }

        // Generate days between startDate and endDate
        this.generateDays();

        // Initialize newActivityForDay objects
        this.days.forEach(d => {
          this.newActivityForDay[d.dayIndex] = {
            placeName: '',
            startTime: '',
            endTime: '',
            cost: 0,
            dayIndex: d.dayIndex
          };
          this.expandedDays[d.dayIndex] = false;
        });

        // If familyAttending is empty, fetch user family
        if (this.editTrip && (!this.editTrip.familyAttending || this.editTrip.familyAttending.length === 0)) {
          this.userService.getUser().subscribe({
            next: (user: any) => {
              const members = user.familyMembers || [];
              this.editTrip!.familyAttending = members.map((member: any) => ({
                familyMemberId: member.name,
                name: member.name,
                attending: false
              }));
              this.tripsService.updateTrip(this.editTrip!._id, this.editTrip!).subscribe({
                next: (updatedTrip) => {
                  console.log('Trip updated with family attending:', updatedTrip);
                  this.trip = updatedTrip;
                  this.editTrip = JSON.parse(JSON.stringify(updatedTrip));
                },
                error: (err) => console.error('Failed to update trip with family attending:', err)
              });
            },
            error: (err) => console.error('Failed to fetch user:', err)
          });
        }
      },
      error: (err) => console.error('Failed to fetch trip:', err)
    });
  }

  // Generate an array of day objects from startDate to endDate
  private generateDays(): void {
    if (!this.editTrip?.startDate || !this.editTrip.endDate) return;

    const start = new Date(this.editTrip.startDate);
    const end = new Date(this.editTrip.endDate);

    this.days = [];
    let current = new Date(start);
    let dayIndex = 1;

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0]; // "YYYY-MM-DD"
      this.days.push({
        dayIndex,
        date: dateStr
      });
      dayIndex++;
      current.setDate(current.getDate() + 1);
    }
  }

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

  toggleFlights(): void {
    this.expandFlights = !this.expandFlights;
  }

  toggleDay(dayIndex: number): void {
    this.expandedDays[dayIndex] = !this.expandedDays[dayIndex];
  }

  isDayExpanded(dayIndex: number): boolean {
    return !!this.expandedDays[dayIndex];
  }

  saveTrip(): void {
    if (!this.editTrip || !this.editTrip._id) return;

    this.tripsService.updateTrip(this.editTrip._id, this.editTrip).subscribe({
      next: (updated) => {
        console.log('Trip updated:', updated);
        this.trip = updated;
        this.editTrip = JSON.parse(JSON.stringify(updated));

        this.popupMessage = 'Trip saved!';
        this.showPopup = true;

        setTimeout(() => {
          this.router.navigate(['/trips']);
        }, 1000);
      },
      error: (err) => console.error('Failed to update trip:', err)
    });
  }

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
      error: (err) => console.error('Failed to delete trip:', err)
    });
  }

  // Reverse geocode to get place name
  onMapClicked(mapEvent: google.maps.MapMouseEvent): void {
    if (!this.editTrip) return;

    const lat = mapEvent.latLng?.lat();
    const lng = mapEvent.latLng?.lng();
    if (lat == null || lng == null) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results.length > 0) {
        const placeName = results[0].formatted_address;
        const newPlace: ItineraryItem = {
          placeName: placeName || 'Map Pin',
          lat,
          lng,
          startTime: '',
          endTime: '',
          cost: 0,
          dayIndex: 1 // default to Day 1, or you can ask user which day
        };
        this.editTrip!.itinerary.push(newPlace);
      } else {
        console.warn('Reverse geocoding failed, status:', status);
        const newPlace: ItineraryItem = {
          placeName: 'Map Pin',
          lat,
          lng,
          startTime: '',
          endTime: '',
          cost: 0,
          dayIndex: 1
        };
        this.editTrip!.itinerary.push(newPlace);
      }
    });
  }

  // Return itinerary items belonging to a given day
  getItineraryItemsForDay(dayIndex: number): ItineraryItem[] {
    if (!this.editTrip?.itinerary) return [];
    return this.editTrip.itinerary.filter(item => item.dayIndex === dayIndex);
  }

  // Add custom activity for a specific day
  addCustomActivity(dayIndex: number): void {
    if (!this.editTrip) return;

    // Copy from newActivityForDay[dayIndex], then reset
    const activity = { ...this.newActivityForDay[dayIndex] };
    // Make sure dayIndex is set
    activity.dayIndex = dayIndex;

    this.editTrip.itinerary.push(activity);

    // Reset the form
    this.newActivityForDay[dayIndex] = {
      placeName: '',
      startTime: '',
      endTime: '',
      cost: 0,
      dayIndex
    };
  }

  // Remove an itinerary item by index
  removeItineraryItem(index: number): void {
    this.editTrip?.itinerary?.splice(index, 1);
  }
}

