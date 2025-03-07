import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { HttpClient } from '@angular/common/http';
import { tripPalMapStyles } from '../map/map-styles'; // Custom map styles
import { TripsService, Trip, ItineraryItem } from '../services/trips.service';
import { SupportComponent } from '../support/support.component';
import { UserService, UserData, FamilyMember } from '../services/user.service';
import { TripMapComponent } from '../map/trip-map.component';

interface DayInfo {
  dayIndex: number;   // e.g. 1, 2, 3
  date: string;       // e.g. "2025-04-18"
}



@Component({
  selector: 'app-trip-detail',
  standalone: true,
  templateUrl: './trip.component.html',
  imports: [
    CommonModule,
    FormsModule,
    SupportComponent,
    GoogleMapsModule,
    TripMapComponent
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
  recommendations: any[] = [];
  userData: UserData | null = null;

  // Popup for save/delete feedback
  popupMessage: string = '';
  showPopup: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private tripsService: TripsService,
    private router: Router,
    private userService: UserService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const tripId = this.route.snapshot.paramMap.get('tripId');
    if (!tripId) return;

    
    this.userService.getUser().subscribe((userData: any) => {
      this.userData = userData;
    });
    
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

  // New method to generate recommendations
  getRecommendations(): void {
    // Ensure we have the trip and user data loaded.
    if (!this.editTrip || !this.editTrip.location) {
      console.error("Trip or trip location is not set.");
      return;
    }
    if (!this.userData) {
      console.error("User data is not loaded.");
      return;
    }
    
    // Retrieve the logged-in user’s preferences.
    const userPreferences: string[] = this.userData.preferences || [];
    
    // Merge "attending" from the trip with "preferences" from the user
    const tripFamilyAttending = this.editTrip.familyAttending || [];
    const familyPreferences: string[] = (this.editTrip.familyAttending || [])
    .filter((f: any) => f.attending)
    .reduce((acc: string[], f: any) => {
      // Use a type assertion to tell TypeScript that f has a name property.
      const attendingMember = f as { name: string; attending: boolean };
      const userFam = this.userData!.familyMembers.find(u => u.name === attendingMember.name);
      if (userFam && userFam.preferences) {
        return acc.concat(userFam.preferences);
      }
      return acc;
    }, []);
  
    
    // Combine both arrays (and deduplicate if needed)
    const combinedPreferences = [...userPreferences, ...familyPreferences];
    
    const payload = {
      city: this.editTrip.location,
      userPreferences,
      familyPreferences
    };
    
    this.http.post<{ recommendations: any[] }>('http://localhost:5000/api/recommendations', payload)
      .subscribe(
        (res: { recommendations: any[] }) => {
          this.recommendations = res.recommendations;
        },
        (err: any) => {
          console.error('Error fetching recommendations', err);
        }
      );
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

  handleMapPlace(newItem: ItineraryItem) {
    if (!this.editTrip) return;
    // Add the item to the itinerary
    this.editTrip.itinerary.push(newItem);
    console.log('Map place added to itinerary:', newItem);
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

  addRecommendationToDay(recommendation: any, dayIndex: string): void {
    const dayIndexNumber = parseInt(dayIndex, 10);
    if (!this.editTrip) return;
    const itineraryItem = {
      placeName: recommendation.name,
      startTime: '',
      endTime: '',
      cost: 0,
      dayIndex: dayIndexNumber,
      // Additional fields (address, photoUrl, etc.) if desired.
    };
    this.editTrip.itinerary.push(itineraryItem);
    console.log(`Added recommendation "${recommendation.name}" to day ${dayIndexNumber}`);
  }
  
  

}

