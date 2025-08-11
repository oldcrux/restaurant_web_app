import React from "react";
import { StoreHours } from "@/lib/types";

interface Props {
  timezone: string;
  hours: StoreHours;
  onChange: (hours: StoreHours) => void;
}

const weekDays: Record<keyof StoreHours, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const StoreHoursEditor: React.FC<Props> = ({ timezone, hours, onChange }) => {
  const updateDay = (day: keyof StoreHours, open: string, close: string) => {
    const newHours = { ...hours };
    newHours[day] = [`${open} ${timezone}`, `${close} ${timezone}`];
    onChange(newHours);
  };

  const toggleDay = (day: keyof StoreHours, enabled: boolean) => {
    const newHours = { ...hours };
    newHours[day] = enabled ? [`09:00 ${timezone}`, `19:00 ${timezone}`] : null;
    onChange(newHours);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-600 block">Store Hours</label>
      {Object.entries(weekDays).map(([key, label]) => {
        const day = key as keyof StoreHours;
        const time = hours[day];
        return (
          <div key={day} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!time}
              onChange={(e) => toggleDay(day, e.target.checked)}
            />
            <span className="w-24">{label}</span>
            {time ? (
              <>
                <input
                  type="time"
                  value={time[0].split(" ")[0]}
                  onChange={(e) => updateDay(day, e.target.value, time[1].split(" ")[0])}
                />
                <span>to</span>
                <input
                  type="time"
                  value={time[1].split(" ")[0]}
                  onChange={(e) => updateDay(day, time[0].split(" ")[0], e.target.value)}
                />
              </>
            ) : (
              <span className="text-sm text-gray-400">Closed</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StoreHoursEditor;
