"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { toast } from "sonner";
import { allBookings, createBooking } from "@/services/booking-services";
import { getClientSessionUser } from "@/auth/supertokens/config/app-utils";
import BookingCalendar from "./booking-calendar";
import CheckAvailabilityDialog from "./check-availability-dialog";
import BookingFormDialog from "./booking-form-dialog";
import { DateTime } from "luxon";
import { validateBookingForm } from "./form-validation";
import { Booking } from "@/lib/types";

export default function BookingScheduler() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const calendarRef = useRef<any>(null);

  const sessionUser = getClientSessionUser();
  const currentStore = sessionUser?.storeRoles?.find(
    (role: any) => role.storeName === sessionUser?.currentStore
  );
  const timezone = currentStore?.timezone || "UTC";

  const formatForInput = (utcString: string, tz: string) => {
    if (!utcString) return "";
    return DateTime.fromISO(utcString, { zone: "utc" })
      .setZone(tz)
      .toFormat("yyyy-LL-dd'T'HH:mm");
  };

  const parseFromInput = (dateTime: DateTime, tz: string) => {
    if (!dateTime || !dateTime.isValid) return "";

    return dateTime.setZone(tz).toUTC().toISO(); // to UTC ISO string
  };

  const fetchEvents = useCallback(async (start?: Date, end?: Date) => {
    try {
      setIsLoading(true);
      const resp = await allBookings();
      const bookings = resp?.data || [];
      const formatted = bookings.map((booking: any) => ({
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
      }));
      setEvents(formatted);
    } catch (err) {
      console.error("fetchEvents error:", err);
      toast.error("Failed to fetch bookings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Booking form dialog control & initial data
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [bookingInitialData, setBookingInitialData] = useState<any | null>(null);

  useEffect(() => {
    // load today's range
    const today = new Date();
    const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    fetchEvents(dayStart, dayEnd);
  }, [fetchEvents]);

  const getCurrentViewRangeAndFetch = async () => {
    try {
      const api = calendarRef.current?.getApi();
      const start = api?.view?.activeStart || null;
      const end = api?.view?.activeEnd || null;
      await fetchEvents(start, end);
    } catch (err) {
      await fetchEvents();
    }
  };

  // handle selecting an empty range on the calendar
  const handleDateSelect = (selectInfo: any) => {
    // convert selectInfo.startStr (UTC) to store timezone and prefill form
    const now = DateTime.utc();
    const start = DateTime.fromISO(selectInfo.startStr, { zone: "utc" });
    if (start < now) {
      toast.warning("Cannot create bookings in the past");
      return;
    }

    setBookingInitialData({
      customerName: "",
      customerPhoneNumber: "",
      guestsCount: 2,
      startTime: formatForInput(selectInfo.startStr, timezone),
      endTime: formatForInput(selectInfo.endStr, timezone),
      status: "booked",
      notes: "",
    });
    setIsFormOpen(true);
  };

  // handle clicking an existing event
  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    setBookingInitialData({
      id: event.id,
      customerName: event.extendedProps.customerName || "",
      customerPhoneNumber: event.extendedProps.customerPhoneNumber || "",
      guestsCount: event.extendedProps.guestsCount || 2,
      startTime: formatForInput(event.startStr, timezone),
      endTime: formatForInput(event.endStr, timezone),
      status: event.extendedProps.status || "booked",
      notes: event.extendedProps.notes || "",
    });
    setIsFormOpen(true);
  };

  // when a slot is clicked from CheckAvailabilityDialog, open booking form prefilled
  const handleSlotSelectFromAvailability = async (
    slot: any,
    customerName: string,
    customerPhoneNumber: string,
    notes: string,
    partySize: number
  ) => {

    // Parse the slot time and calculate end time in the store's timezone
    const start = DateTime.fromSQL(slot.start, { setZone: true });
    if (!start.isValid) {
      console.error("Invalid start DateTime:", start.invalidReason, start.invalidExplanation);
      return;
    }
    const endTime = start.plus({ minutes: slot.minutes || 60 });

    const formData = {
      customerName: customerName || "",
      customerPhoneNumber: customerPhoneNumber || "",
      guestsCount: partySize || 2,
      startTime: parseFromInput(start, timezone),
      endTime: parseFromInput(endTime, timezone),
      status: "booked",
      notes: notes || "",
    };

    console.log("handleSlotSelectFromAvailability formData:", formData);
    
    setBookingInitialData(formData);
    await createBooking(formData as Booking);
    toast.success("Booking created successfully!");
    await getCurrentViewRangeAndFetch();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>Manage your restaurant's Bookings</CardDescription>
          <CardAction>
            <div className="flex items-center gap-2">
              <CheckAvailabilityDialog
                onSlotSelect={handleSlotSelectFromAvailability}
                initialCustomerName={bookingInitialData?.customerName || ""}
                initialCustomerPhoneNumber={bookingInitialData?.customerPhoneNumber || ""}
              />
            </div>
          </CardAction>
        </CardHeader>

        <CardContent>
          <BookingCalendar
            events={events}
            onEventClick={handleEventClick}
            onDateSelect={handleDateSelect}
            calendarRef={calendarRef}
          />
        </CardContent>
      </Card>

      <BookingFormDialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={bookingInitialData}
        timezone={timezone}
        onSaved={async () => {
          await getCurrentViewRangeAndFetch();
        }}
      />
    </div>
  );
}