import mongoose from "mongoose";

export interface IUser {
  _id: string;
  clerkId: string;
  username?: string;
  email?: string;
  role?: string;
  experience?: string;
  hourlyRate?: number;
  location?: string;
  skills: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  escrowBalance: number;
  createdAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
  clerkId: { type: String, required: true, unique: true },
  username: { type: String },
  email: { type: String },
  role: { type: String },
  experience: { type: String },
  hourlyRate: { type: Number },
  location: { type: String },
  skills: [{ type: String }],
  githubUrl: { type: String },
  linkedinUrl: { type: String },
  escrowBalance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);