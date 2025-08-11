import z from "zod";

export const storeSchema = z.object({
  orgName: z.string(),
  storeName: z.string(),
  timezone: z.string(),
  storeHour: z.object({
    monday: z.tuple([z.string(), z.string()]).nullable(),
    tuesday: z.tuple([z.string(), z.string()]).nullable(),
    wednesday: z.tuple([z.string(), z.string()]).nullable(),
    thursday: z.tuple([z.string(), z.string()]).nullable(),
    friday: z.tuple([z.string(), z.string()]).nullable(),
    saturday: z.tuple([z.string(), z.string()]).nullable(),
    sunday: z.tuple([z.string(), z.string()]).nullable(),
  }),
  dineInCapacity: z.number(),
  slotDurationMinutes: z.number(),
  isActive: z.boolean(),
  phoneNumber: z.string(),
  trunkPhoneNumber: z.string(),
  address1: z.string(),
  address2: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  country: z.string(),
  createdBy: z.string(),
});
