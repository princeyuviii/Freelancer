import mongoose from 'mongoose'

export interface IJobApplication {
  _id: string;
  userId: string;
  jobId: mongoose.Types.ObjectId | any;
  status: 'Pending' | 'Reviewing' | 'Accepted' | 'Rejected' | 'Completed';
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema = new mongoose.Schema<IJobApplication>({
  userId: { type: String, required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  status: { type: String, enum: ['Pending', 'Reviewing', 'Accepted', 'Rejected', 'Completed'], default: 'Pending' },
}, { timestamps: true })

export const JobApplication = mongoose.models.JobApplication || mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema)
