export type BookingFormData = {
  customerName: string;
  customerPhoneNumber: string;
  guestsCount: number;
  startTime: string;
  endTime: string;
  status?: string;
  notes?: string;
};

export type ValidationErrors = Record<string, string>;

export const validateBookingForm = (formData: BookingFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Validate customer name
  if (!formData.customerName?.trim()) {
    errors.customerName = "Customer name is required";
  }

  // Validate phone number
  if (!formData.customerPhoneNumber?.trim()) {
    errors.customerPhoneNumber = "Phone number is required";
  } else if (!/^\+?[\d\s-]{10,}$/.test(formData.customerPhoneNumber)) {
    errors.customerPhoneNumber = "Please enter a valid phone number";
  }

  // Validate guests count
  if (!formData.guestsCount || formData.guestsCount < 1) {
    errors.guestsCount = "Please enter a valid number of guests";
  }

  // Validate start time
  if (!formData.startTime) {
    errors.startTime = "Start time is required";
  }

  // Validate end time
  if (!formData.endTime) {
    errors.endTime = "End time is required";
  } else if (formData.startTime && formData.endTime) {
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    if (end <= start) {
      errors.endTime = "End time must be after start time";
    }
  }

  return errors;
};

export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};
