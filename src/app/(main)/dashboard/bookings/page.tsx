import BookingScheduler from "./components/booking-scheduler";

export default async function BookingsPage() {

  return (
    // <div className="space-y-6">
      <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bookings</h2>
          <p className="text-muted-foreground">
            Manage your restaurant's Bookings
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <BookingScheduler />
      </div>
    </div>
  );
}
