import Mongoose from 'mongoose';

interface PlacementInterface {
  refDes: string;
  part: { type: Mongoose.Schema.Types.ObjectId, ref: 'part' };
  bom: { type: Mongoose.Schema.Types.ObjectId, ref: 'bom' };
}

const PlacementSchema = new Mongoose.Schema({
  refDes: String,
  part: { type: Mongoose.Schema.Types.ObjectId, ref: 'part' },
  bom: { type: Mongoose.Schema.Types.ObjectId, ref: 'bom' }
}, {
  timestamps: false,
});

export { PlacementInterface, PlacementSchema };

