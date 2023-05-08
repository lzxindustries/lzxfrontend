import Mongoose from 'mongoose';

interface StackInterface {
  name: string;
  machine: { type: Mongoose.Schema.Types.ObjectId, ref: 'machine' }
}

const StackSchema = new Mongoose.Schema({
  name: String,
  machine: { type: Mongoose.Schema.Types.ObjectId, ref: 'machine' }
}, {
  timestamps: false,
});

export { StackInterface, StackSchema };

