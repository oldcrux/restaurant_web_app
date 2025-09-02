"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateTime } from 'luxon';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { allBookings, createBooking } from "@/services/booking-services";
import { getClientSessionUser } from "@/auth/supertokens/config/app-utils";
import { Booking } from "@/lib/types";

// Extended type for FullCalendar event format
interface BookingEvent extends Omit<Booking, 'startTime' | 'endTime'> {
  title: string;
  start: string;
  end: string;
  extendedProps: {
    customerName: string;
    customerPhoneNumber: string;
    guestsCount: number;
    status: string;
    notes?: string;
  };
}

const STATUS_OPTIONS = [
  { value: "booked", label: "Booked" },
  { value: "seated", label: "Seated" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function BookingScheduler() {
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null);
  const [formData, setFormData] = useState<Omit<Booking, 'id' | 'orgName' | 'storeName' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt'>>({
    customerName: "",
    customerPhoneNumber: "",
    guestsCount: 2,
    startTime: "",
    endTime: "",
    status: "booked",
    notes: "",
  });

  const sessionUser = getClientSessionUser();
  const currentStoreName = sessionUser?.currentStore;
  const currentStore = sessionUser?.storeRoles?.find(
    (role: any) => role.storeName === sessionUser?.currentStore
  );

  const calendarRef = useRef<FullCalendar>(null);

  const fetchEvents = useCallback(async (start: Date, end: Date) => {
    try {
      setIsLoading(true);

      const timezone = currentStore?.timezone || 'UTC';
      const bookings = await allBookings();

      // console.log("All Bookings:", bookings.data);
      // const formattedEvents = bookings.data?.length > 0 ? bookings.data.map((booking: any) => ({
      //   id: booking.id,
      //   title: `${booking.customerName || "Guest"} (${booking.guestsCount})`,
      //   start: new Date(booking.startTime).toISOString(), // Ensure ISO format
      //   end: new Date(booking.endTime).toISOString(),
      //   extendedProps: {
      //     customerName: booking.customerName,
      //     customerPhoneNumber: booking.customerPhoneNumber,
      //     guestsCount: booking.guestsCount,
      //     status: booking.status,
      //     notes: booking.notes,
      //   },
      // })) : [];
      const formattedEvents = bookings.data?.length > 0
      ? bookings.data.map((booking: any) => {
          return {
            id: booking.id,
            title: `${booking.customerName || "Guest"} (${booking.guestsCount})`,
            start: booking.startTime,
            end: booking.endTime,
            extendedProps: {
              customerName: booking.customerName,
              customerPhoneNumber: booking.customerPhoneNumber,
              guestsCount: booking.guestsCount,
              status: booking.status,
              notes: booking.notes,
            },
          };
        })
      : [];

    //   console.log("Formatted Events:", formattedEvents);
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch bookings");
    } finally {
      setIsLoading(false);
    }
  }, [currentStoreName, toast]);

  useEffect(() => {
    if (!isModalOpen) {
      // Reset form when modal is closed
      setSelectedEvent(null);
      setFormData({
        customerName: "",
        customerPhoneNumber: "",
        guestsCount: 2,
        startTime: "",
        endTime: "",
        status: "booked",
        notes: "",
      });
    }
  }, [isModalOpen]);

  // const formatForInput = (dateString: string) => {
  //   const date = new Date(dateString);
  //   // Convert to local time string and slice to get YYYY-MM-DDTHH:MM format
  //   return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
  //     .toISOString()
  //     .slice(0, 16);
  // };

  const formatForInput = (utcString: string, timezone: string) => {
    if (!utcString) return "";
    // Convert stored UTC → local browser time (datetime-local expects local)
    return DateTime.fromISO(utcString, { zone: "utc" })
      .setZone(timezone)
      .toFormat("yyyy-LL-dd'T'HH:mm");
  };

  const parseFromInput = (localString: string, timezone: string) => {
    if (!localString) return "";
    // localString is in store timezone → convert to UTC for DB
    return DateTime.fromFormat(localString, "yyyy-LL-dd'T'HH:mm", {
      zone: timezone,
    })
      .toUTC()
      .toISO();
  };

  const handleDateSelect = (selectInfo: any) => {
    const now = DateTime.utc();
    const start = DateTime.fromISO(selectInfo.startStr, { zone: "utc" });
    if (start < now) {
      toast.error("Cannot create bookings in the past");
      return;
    }
  
    const timezone = currentStore?.timezone || "UTC";
  
    setSelectedEvent(null);
    setFormData({
      customerName: "",
      customerPhoneNumber: "",
      guestsCount: 2,
      startTime: formatForInput(selectInfo.startStr, timezone),
      endTime: formatForInput(selectInfo.endStr, timezone),
      status: "booked",
      notes: "",
    });
    setIsModalOpen(true);
  };
  
  // const handleDateSelect = (selectInfo: any) => {
  //   // Prevent selecting past dates/times
  //   const now = new Date();
  //   const startTime = new Date(selectInfo.startStr);
    
  //   if (startTime < now) {
  //     toast.error("Cannot create bookings in the past");
  //     return;
  //   }
    
  //   setSelectedEvent(null);
  //   setFormData({
  //     customerName: "",
  //     customerPhoneNumber: "",
  //     guestsCount: 2,
  //     startTime: formatForInput(selectInfo.startStr),
  //     endTime: formatForInput(selectInfo.endStr),
  //     status: "booked",
  //     notes: "",
  //   });
  //   setIsModalOpen(true);
  // };

  // const handleEventClick = (clickInfo: any) => {
  //   const event = clickInfo.event;
  //   setSelectedEvent(event);
  //   setFormData({
  //     customerName: event.extendedProps.customerName || "",
  //     customerPhoneNumber: event.extendedProps.customerPhoneNumber || "",
  //     guestsCount: event.extendedProps.guestsCount,
  //     startTime: format(parseISO(event.startStr), "yyyy-MM-dd'T'HH:mm"),
  //     endTime: format(parseISO(event.endStr), "yyyy-MM-dd'T'HH:mm"),
  //     status: event.extendedProps.status,
  //     notes: event.extendedProps.notes || "",
  //   });
  //   setIsModalOpen(true);
  // };

  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    const timezone = currentStore?.timezone || "UTC";
  
    setSelectedEvent(event);
    setFormData({
      customerName: event.extendedProps.customerName || "",
      customerPhoneNumber: event.extendedProps.customerPhoneNumber || "",
      guestsCount: event.extendedProps.guestsCount,
      startTime: formatForInput(event.startStr, timezone),
      endTime: formatForInput(event.endStr, timezone),
      status: event.extendedProps.status,
      notes: event.extendedProps.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: name === 'guestsCount' ? parseInt(value) || 0 : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const timezone = currentStore?.timezone || "UTC";
  
      const bookingData: Booking = {
        ...formData,
        startTime: parseFromInput(formData.startTime, timezone) || "",
        endTime: parseFromInput(formData.endTime, timezone) || "",
        id: selectedEvent?.id || "",
        orgName: "",
        storeName: "",
        createdBy: "",
        updatedBy: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
  
      await createBooking(bookingData);
  
      const view = calendarRef.current?.getApi();
      if (view) {
        await fetchEvents(view.view.activeStart, view.view.activeEnd);
      }
  
      toast(selectedEvent ? "Booking updated successfully" : "Booking created successfully");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving booking:", error);
      toast.error("Failed to save booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);

  //   try {
  //   //   const url = selectedEvent ? `/api/booking/${selectedEvent.id}` : "/api/booking";
  //   //   const method = selectedEvent ? "PUT" : "POST";

  //   //   const payload = {
  //   //     ...formData,
  //   //     restaurantId,
  //   //   };

  //   //   const response = await fetch(url, {
  //   //     method,
  //   //     headers: {
  //   //       "Content-Type": "application/json",
  //   //     },
  //   //     body: JSON.stringify(payload),
  //   //   });

  //   const bookingData: Booking = {
  //     ...formData,
  //     id: selectedEvent?.id || '', // Will be generated by the server if empty
  //     orgName: '', // Will be set by the service
  //     storeName: '', // Will be set by the service
  //     createdBy: '', // Will be set by the service
  //     updatedBy: '', // Will be set by the service
  //     createdAt: new Date().toISOString(),
  //     updatedAt: new Date().toISOString(),
  //   };
  //   const response = await createBooking(bookingData);

  //   // console.log("Booking response:", response);
  //     // if (!response.ok) {
  //     //   const error = await response.json();
  //     //   throw new Error(error.message || "An error occurred");
  //     // }

  //     // Refresh events
  //     const view = calendarRef.current?.getApi();
  //     if (view) {
  //       await fetchEvents(view.view.activeStart, view.view.activeEnd);
  //     }

  //     toast(selectedEvent ? "Booking updated successfully" : "Booking created successfully");

  //     setIsModalOpen(false);
  //   } catch (error: any) {
  //     console.error("Error saving booking:", error);
  //     toast.error("Failed to save booking");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    if (!confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    try {
      const response = await fetch(`/api/booking/${selectedEvent.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete booking");
      }

      // Refresh events
      const view = calendarRef.current?.getApi();
      if (view) {
        await fetchEvents(view.view.activeStart, view.view.activeEnd);
      }

      toast("Booking deleted successfully");

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Failed to delete booking");
    }
  };

  // Initial data load
  useEffect(() => {
    const today = new Date();
    const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 1000 * 60 * 60 * 24);
    fetchEvents(dayStart, dayEnd);
  }, [fetchEvents]);

  // Custom event content renderer
  const renderEventContent = (eventInfo: any) => {
    const status = eventInfo.event.extendedProps.status;
    const statusColors: Record<string, string> = {
      booked: "bg-blue-100 text-blue-800 border-blue-200",
      seated: "bg-green-100 text-green-800 border-green-200",
      completed: "bg-gray-100 text-gray-800 border-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };

    const statusColor = statusColors[status] || "bg-blue-100 text-blue-800 border-blue-200";

    return (
      <div className={`p-2 rounded border ${statusColor} text-sm`}>
        <div className="font-medium truncate">{eventInfo.event.title}</div>
        <div className="text-xs opacity-80">
          {eventInfo.timeText}
        </div>
      </div>
    );
  };

  // Get today's date at midnight for the valid range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return (
    <div className="h-[800px] w-full">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        initialDate={today} // Set initial date to today
        validRange={{
          start: today, // Prevent navigating to past dates
        }}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        eventClick={handleEventClick}
        selectable={true}
        selectMirror={true}
        selectAllow={(selectInfo) => {
          // Only allow selecting future dates/times
          return selectInfo.start >= new Date();
        }}
        dayMaxEvents={true}
        weekends={true}
        nowIndicator={true}
        select={handleDateSelect}
        eventContent={renderEventContent}
        businessHours={{
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
          startTime: '09:00',
          endTime: '23:00',
        }}
        slotMinTime="09:00:00"
        slotMaxTime="23:00:00"
        slotDuration="00:30:00"
        allDaySlot={false}
        firstDay={1}
        height="auto"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          meridiem: 'short'
        }}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedEvent ? "Edit Booking" : "New Booking"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Name</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Guest name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhoneNumber">Phone Number</Label>
                <Input
                  id="customerPhoneNumber"
                  name="customerPhoneNumber"
                  type="tel"
                  value={formData.customerPhoneNumber}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guestsCount">Party Size</Label>
                <Input
                  id="guestsCount"
                  name="guestsCount"
                  type="number"
                  min="1"
                  value={formData.guestsCount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex justify-between pt-2">
              <div>
                {selectedEvent && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Delete
                  </Button>
                )}
              </div>
              <div className="space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {selectedEvent ? "Saving..." : "Creating..."}
                    </>
                  ) : selectedEvent ? (
                    "Save Changes"
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Booking
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
