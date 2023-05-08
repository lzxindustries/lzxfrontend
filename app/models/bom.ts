import Mongoose from 'mongoose';

interface BomInterface {
  name: string;
  revision: { type: Mongoose.Schema.Types.ObjectId, ref: 'revision' };
}

const BomSchema = new Mongoose.Schema({
  name: String,
  revision: { type: Mongoose.Schema.Types.ObjectId, ref: 'revision' }
}, {
  timestamps: false,
});

export { BomInterface, BomSchema };

