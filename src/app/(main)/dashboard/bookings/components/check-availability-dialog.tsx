"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { checkAvailability } from "@/services/booking-services";

interface CheckAvailabilityDialogProps {
    /**
     * Called when the user selects an available slot.
     * slot: slot object returned from API
     * customerName, customerPhoneNumber: filled-in values from dialog
     * partySize: integer
     */
    onSlotSelect: (
        slot: any,
        customerName: string,
        customerPhoneNumber: string,
        notes: string,
        partySize: number
    ) => void;

    /**
     * optionally prefill name/phone from parent
     */
    initialCustomerName?: string;
    initialCustomerPhoneNumber?: string;
}

export default function CheckAvailabilityDialog({
    onSlotSelect,
    initialCustomerName = "",
    initialCustomerPhoneNumber = "",
}: CheckAvailabilityDialogProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [customerName, setCustomerName] = useState(initialCustomerName);
    const [customerPhoneNumber, setCustomerPhoneNumber] = useState(
        initialCustomerPhoneNumber
    );
    const [notes, setNotes] = useState("");

    const [availabilityDate, setAvailabilityDate] = useState<string>("");
    const [partySize, setPartySize] = useState<number>(2);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    const [showAvailability, setShowAvailability] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const handleCheckAvailability = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};
        // if (!customerName.trim()) newErrors.customerName = "Name is required";
        // if (!customerPhoneNumber.trim())
        //   newErrors.customerPhoneNumber = "Phone number is required";
        if (!availabilityDate) newErrors.date = "Date is required";
        if (!partySize || partySize < 1)
            newErrors.partySize = "Number of guests is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setIsChecking(true);
            const response = await checkAvailability(availabilityDate, partySize);
            if (response?.data?.slots?.length > 0) {
                const available = response.data.slots
                    .filter((s: any) => s.isAvailable)
                    .slice(0, 5);
                setAvailableSlots(available);
                setShowAvailability(true);
            } else {
                setAvailableSlots([]);
                setShowAvailability(false);
                toast.info("No available slots found for the selected date");
            }
        } catch (err) {
            console.error("checkAvailability error:", err);
            toast.error("Failed to check availability. Please try again.");
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button type="button" className="gap-2">
                    <Clock className="w-4 h-4" />
                    Check Availability
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <ScrollArea className="h-[60vh] pr-4">
                    <DialogHeader>
                        <DialogTitle>Check Availability</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleCheckAvailability} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="caName">Name</Label>
                                    {errors.customerName && (
                                        <span className="text-xs text-red-500">
                                            {errors.customerName}
                                        </span>
                                    )}
                                </div>
                                <Input
                                    id="caName"
                                    name="customerName"
                                    value={customerName}
                                    onChange={(e) => {
                                        setCustomerName(e.target.value);
                                        if (errors.customerName) {
                                            setErrors((prev) => {
                                                const n = { ...prev };
                                                delete n.customerName;
                                                return n;
                                            });
                                        }
                                    }}
                                    placeholder="Guest name"
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="caPhone">Phone Number</Label>
                                    {errors.customerPhoneNumber && (
                                        <span className="text-xs text-red-500">
                                            {errors.customerPhoneNumber}
                                        </span>
                                    )}
                                </div>
                                <Input
                                    id="caPhone"
                                    name="customerPhoneNumber"
                                    type="tel"
                                    value={customerPhoneNumber}
                                    onChange={(e) => {
                                        setCustomerPhoneNumber(e.target.value);
                                        if (errors.customerPhoneNumber) {
                                            setErrors((prev) => {
                                                const n = { ...prev };
                                                delete n.customerPhoneNumber;
                                                return n;
                                            });
                                        }
                                    }}
                                    placeholder="e.g., +1 (555) 123-4567"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={notes || ""}
                                onChange={(e) => {
                                    setNotes(e.target.value);
                                    if (errors.notes) {
                                        setErrors((prev) => {
                                            const n = { ...prev };
                                            delete n.notes;
                                            return n;
                                        });
                                    }
                                }}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                                placeholder="Additional notes..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Date</Label>
                            <div className="rounded-md border p-3">
                                <Calendar
                                    className="rounded-md border shadow-sm"
                                    mode="single"
                                    onSelect={(date) => {
                                        if (date) {
                                            setAvailabilityDate(date.toISOString().split("T")[0]);
                                            if (errors.date) {
                                                setErrors((prev) => {
                                                    const n = { ...prev };
                                                    delete n.date;
                                                    return n;
                                                });
                                            }
                                        }
                                    }}
                                />
                            </div>
                            {errors.date && (
                                <p className="text-sm text-red-500">{errors.date}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="partySize">Party Size</Label>
                            <Input
                                id="partySize"
                                type="number"
                                min={1}
                                value={partySize}
                                onChange={(e) => setPartySize(parseInt(e.target.value || "1"))}
                                required
                            />
                            {errors.partySize && (
                                <p className="text-sm text-red-500">{errors.partySize}</p>
                            )}
                        </div>

                        {showAvailability && availableSlots.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <Label className="text-base font-medium text-gray-900">Available Time Slots</Label>
                                    <span className="text-sm text-gray-500">(select a slot to book)</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {availableSlots.map((slot: any, idx: number) => (
                                        <Button
                                            key={idx}
                                            type="button"
                                            variant="outline"
                                            className="flex flex-col items-center justify-center h-16"
                                            onClick={() => {
                                                const newErrors: Record<string, string> = {};
                                                if (!customerName.trim()) newErrors.customerName = 'Name is required';
                                                if (!customerPhoneNumber.trim()) newErrors.customerPhoneNumber = 'Phone number is required';

                                                if (Object.keys(newErrors).length > 0) {
                                                    setErrors(newErrors);
                                                    return;
                                                }

                                                onSlotSelect(
                                                    slot,
                                                    customerName,
                                                    customerPhoneNumber,
                                                    notes,
                                                    partySize
                                                );
                                                setIsDialogOpen(false);
                                                // reset UI
                                                setShowAvailability(false);
                                                setAvailableSlots([]);
                                            }}
                                        >
                                            <span className="font-medium">
                                                {new Date(slot.start).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {slot.availableSeats} seats
                                            </span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsDialogOpen(false);
                                    setShowAvailability(false);
                                    setAvailableSlots([]);
                                }}
                            >
                                Cancel
                            </Button>

                            <Button type="submit" disabled={isChecking}>
                                {isChecking ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    "Check Availability"
                                )}
                            </Button>
                        </div>
                    </form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
