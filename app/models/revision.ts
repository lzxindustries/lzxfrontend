import Mongoose from 'mongoose';

interface RevisionInterface {
  name: string;
  assembly: { type: Mongoose.Schema.Types.ObjectId, ref: 'assembly' };
}

const RevisionSchema = new Mongoose.Schema({
  name: String,
  assembly: { type: Mongoose.Schema.Types.ObjectId, ref: 'assembly' }
}, {
  timestamps: false,
});

export { RevisionInterface, RevisionSchema };

