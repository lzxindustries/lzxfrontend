import Mongoose from 'mongoose';

interface StackFeederPartInterface {
  stack: { type: Mongoose.Schema.Types.ObjectId, ref: 'stack' };
  feeder: { type: Mongoose.Schema.Types.ObjectId, ref: 'feeder' };
  part: { type: Mongoose.Schema.Types.ObjectId, ref: 'part' };
}

const StackFeederPartSchema = new Mongoose.Schema({
  stack: { type: Mongoose.Schema.Types.ObjectId, ref: 'stack' },
  feeder: { type: Mongoose.Schema.Types.ObjectId, ref: 'feeder' },
  part: { type: Mongoose.Schema.Types.ObjectId, ref: 'part' }
}, {
  timestamps: false,
});

export { StackFeederPartInterface, StackFeederPartSchema };

