import z from "zod";

export const menuSchema = z.object({
    orgName: z.string(),
	storeName: z.string(),
	itemName: z.string(),
	itemDescription: z.string(),
	itemPrice: z.number(),
	itemComposition: z.string(),
	customizable: z.boolean(),  
})