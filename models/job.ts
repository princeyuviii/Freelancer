import mongoose from 'mongoose'

export interface IJob {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  posted: string;
  description: string;
  skills: string[];
  level: string;
  category: string;
  employerId: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new mongoose.Schema<IJob>({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true },
  salary: { type: String, required: true },
  posted: { type: String, required: true },
  description: { type: String, required: true },
  skills: [{ type: String }],
  level: { type: String, required: true },
  category: { type: String, required: true },
  employerId: { type: String, required: true },
}, { timestamps: true })

export const Job = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema)