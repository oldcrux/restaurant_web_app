"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  cancelBooking,
  completeBooking,
  createBooking,
  seatBooking,
  updateBooking,
} from "@/services/booking-services";
import { toast } from "sonner";
import { DateTime } from "luxon";
import { validateBookingForm, hasValidationErrors } from "./form-validation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export const STATUS_OPTIONS = [
  { value: "booked", label: "Booked" },
  { value: "seated", label: "Seated" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

type BookingFormData = {
  id?: string;
  customerName: string;
  customerPhoneNumber: string;
  guestsCount: number;
  startTime: string; // datetime-local (store timezone)
  endTime: string; // datetime-local (store timezone)
  status: string;
  notes?: string;
};

interface BookingFormDialogProps {
  open: boolean;
  onClose: () => void;
  /**
   * initialData should be using datetime-local strings in store timezone.
   */
  initialData?: BookingFormData | null;
  timezone: string; // store timezone (used to convert local -> UTC)
  onSaved: () => Promise<void> | void; // called after successful create/update or actions
}

export default function BookingFormDialog({
  open,
  onClose,
  initialData = null,
  timezone,
  onSaved,
}: BookingFormDialogProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    customerName: "",
    customerPhoneNumber: "",
    guestsCount: 2,
    startTime: "",
    endTime: "",
    status: "booked",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          id: initialData.id,
          customerName: initialData.customerName || "",
          customerPhoneNumber: initialData.customerPhoneNumber || "",
          guestsCount: initialData.guestsCount || 2,
          startTime: initialData.startTime || "",
          endTime: initialData.endTime || "",
          status: initialData.status || "booked",
          notes: initialData.notes || "",
        });
      } else {
        setFormData({
          customerName: "",
          customerPhoneNumber: "",
          guestsCount: 2,
          startTime: "",
          endTime: "",
          status: "booked",
          notes: "",
        });
        setErrors({});
      }
    } else {
      // reset on close to keep behavior same as original
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open, initialData]);

//   const formatForInput = (utcString: string, tz: string) => {
//     if (!utcString) return "";
//     return DateTime.fromISO(utcString, { zone: "utc" })
//       .setZone(tz)
//       .toFormat("yyyy-LL-dd'T'HH:mm");
//   };

  const parseFromInput = (localString: string, tz: string) => {
    if (!localString) return "";
    return DateTime.fromFormat(localString, "yyyy-LL-dd'T'HH:mm", {
      zone: tz,
    })
      .toUTC()
      .toISO();
  };

  const validateForm = () => {
    const newErrors = validateBookingForm(formData);
    setErrors(newErrors);
    return !hasValidationErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isValid = validateForm();
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      // convert start/end from store timezone -> UTC ISO for DB
      const bookingPayload: any = {
        ...formData,
        startTime: parseFromInput(formData.startTime, timezone) || "",
        endTime: parseFromInput(formData.endTime, timezone) || "",
        // fill required DB fields -- adapt to your backend shape if needed:
        orgName: "",
        storeName: "",
        createdBy: "",
        updatedBy: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (formData.id) {
        // keep id in payload
        bookingPayload.id = formData.id;
        await updateBooking(bookingPayload);
        toast.success("Booking updated successfully!");
      } else {
        await createBooking(bookingPayload);
        toast.success("Booking created successfully!");
      }

      onClose();
      await (onSaved ? onSaved() : null);
    } catch (err) {
      console.error("save booking error:", err);
      toast.error("Failed to save booking. Please check your input and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!formData.id) return;
    try {
      await cancelBooking(formData.id);
      toast.warning("Booking cancelled successfully");
      setDeleteDialogOpen(false);
      onClose();
      await (onSaved ? onSaved() : null);
    } catch (err) {
      console.error("cancel booking error:", err);
      toast.error("Failed to cancel booking");
    }
  };

  const handleAdvanceStatus = async () => {
    if (!formData.id) return;
    try {
      if (formData.status === "booked") {
        await seatBooking(formData.id);
        toast.success("Booking seated successfully");
      } else if (formData.status === "seated") {
        await completeBooking(formData.id);
        toast.success("Booking completed successfully");
      }
      onClose();
      await (onSaved ? onSaved() : null);
    } catch (err) {
      console.error("status update error:", err);
      toast.error("Failed to update booking status");
    }
  };

  const handleStatusSelectChange = async (newStatus: string) => {
    // if switching to immediate actions, call the corresponding endpoint
    setFormData((prev) => ({ ...prev, status: newStatus }));
    try {
      if (!formData.id) return;
      if (newStatus === "seated") {
        await seatBooking(formData.id);
        toast.success("Booking seated successfully");
        onClose();
        await (onSaved ? onSaved() : null);
      } else if (newStatus === "completed") {
        await completeBooking(formData.id);
        toast.success("Booking completed successfully");
        onClose();
        await (onSaved ? onSaved() : null);
      }
      // if cancelled via select we won't auto-call cancel endpoint here to avoid accidental cancels.
    } catch (err) {
      console.error("status change error:", err);
      toast.error("Failed to update status");
    }
  };

  // minimal date restriction for inputs (browser local iso)
  const minDateLocal = new Date().toISOString().slice(0, 16);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
      <ScrollArea>
        <DialogHeader>
          <DialogTitle className="mb-2">{formData.id ? "Edit Booking" : "New Booking"}</DialogTitle>
          {formData.id && (
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 capitalize">
                {formData.status}
              </span>
              {(formData.status === "booked" || formData.status === "seated") && (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="font-medium"
                  onClick={handleAdvanceStatus}
                >
                  {formData.status === "booked" ? "✓ Mark as Seated" : "✓ Mark as Completed"}
                </Button>
              )}
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="customerName">Name</Label>
                {errors.customerName && (
                  <span className="text-xs text-red-500">{errors.customerName}</span>
                )}
              </div>
              <Input
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, customerName: e.target.value }));
                  if (errors.customerName) {
                    const n = { ...errors };
                    delete n.customerName;
                    setErrors(n);
                  }
                }}
                placeholder="Guest name"
                className={errors.customerName ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="customerPhoneNumber">Phone Number</Label>
                {errors.customerPhoneNumber && (
                  <span className="text-xs text-red-500">{errors.customerPhoneNumber}</span>
                )}
              </div>
              <Input
                id="customerPhoneNumber"
                name="customerPhoneNumber"
                type="tel"
                value={formData.customerPhoneNumber}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, customerPhoneNumber: e.target.value }));
                  if (errors.customerPhoneNumber) {
                    const n = { ...errors };
                    delete n.customerPhoneNumber;
                    setErrors(n);
                  }
                }}
                placeholder="e.g., +1 (555) 123-4567"
                className={errors.customerPhoneNumber ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="guestsCount">Party Size</Label>
                {errors.guestsCount && (
                  <span className="text-xs text-red-500">{errors.guestsCount}</span>
                )}
              </div>
              <Input
                id="guestsCount"
                name="guestsCount"
                type="number"
                min={1}
                max={20}
                value={formData.guestsCount}
                onChange={(e) => setFormData((prev) => ({ ...prev, guestsCount: parseInt(e.target.value || "1") }))}
                className={errors.guestsCount ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="startTime">Start Time</Label>
                {errors.startTime && (
                  <span className="text-xs text-red-500">{errors.startTime}</span>
                )}
              </div>
              <Input
                id="startTime"
                name="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                min={minDateLocal}
                className={errors.startTime ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="endTime">End Time</Label>
                {errors.endTime && (
                  <span className="text-xs text-red-500">{errors.endTime}</span>
                )}
              </div>
              <Input
                id="endTime"
                name="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                min={formData.startTime || minDateLocal}
                className={errors.endTime ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
              placeholder="Additional notes..."
            />
          </div>

          {formData.status !== "completed" && formData.status !== "cancelled" && (
            <div className="flex justify-between pt-2">
              <div>
                {formData.id && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Cancel Booking
                  </Button>
                )}
              </div>

              <div className="space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onClose()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {formData.id ? "Saving..." : "Creating..."}
                    </>
                  ) : formData.id ? (
                    "Save Changes"
                  ) : (
                    <>
                      Create Booking
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will cancel the booking. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  await handleCancelBooking();
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Cancel Booking
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
