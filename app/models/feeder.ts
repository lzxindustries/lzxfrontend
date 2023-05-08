import Mongoose from 'mongoose';

interface FeederInterface {
  name: string;
  machine: { type: Mongoose.Schema.Types.ObjectId, ref: 'machine' };
}

const FeederSchema = new Mongoose.Schema({
  name: String,
  machine: { type: Mongoose.Schema.Types.ObjectId, ref: 'machine' }
}, {
  timestamps: false,
});

export { FeederInterface, FeederSchema };

