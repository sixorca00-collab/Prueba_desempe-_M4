import mongoose from 'mongoose';

const { Schema } = mongoose;

// Schema for deletion_logs collection used for audit (MongoDB)
const DeletionLogSchema = new Schema(
  {
    entity: { type: String, required: true, index: true },
    entity_id: { type: Number, required: true, index: true },
    deleted_data: { type: Schema.Types.Mixed, required: true },
    deleted_at: { type: Date, required: true, default: () => new Date() }
  },
  { collection: 'deletion_logs' }
);

// Ensure an index for quick lookups by entity + entity_id
DeletionLogSchema.index({ entity: 1, entity_id: 1 });

export const DeletionLog = mongoose.models.DeletionLog || mongoose.model('DeletionLog', DeletionLogSchema);

export default DeletionLog;
