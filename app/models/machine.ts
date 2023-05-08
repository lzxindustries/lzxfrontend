import Mongoose from 'mongoose';

interface MachineInterface {
  name: string;
  currentStack: { type: Mongoose.Schema.Types.ObjectId, ref: 'stack' };
}

const MachineSchema = new Mongoose.Schema({
  name: String,
  currentStack: { type: Mongoose.Schema.Types.ObjectId, ref: 'stack' }
}, {
  timestamps: false,
});

export { MachineInterface, MachineSchema };

