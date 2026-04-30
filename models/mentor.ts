import mongoose from 'mongoose'

export interface IMentor {
  _id: string;
  name: string;
  expertise: string;
  rating: number;
  hourlyRate: number;
  image: string;
  specialties: string[];
  availability: string;
  country: string;
  clerkId: string;
  createdAt: Date;
  updatedAt: Date;
}

const MentorSchema = new mongoose.Schema<IMentor>({
  name: { type: String, required: true },
  expertise: { type: String, required: true },
  rating: { type: Number, required: true },
  hourlyRate: { type: Number, required: true },
  image: { type: String, required: true },
  specialties: [{ type: String }],
  availability: { type: String, required: true },
  country: { type: String, required: true },
  clerkId: { type: String, required: true },
}, { timestamps: true })

export const Mentor = mongoose.models.Mentor || mongoose.model<IMentor>('Mentor', MentorSchema)
