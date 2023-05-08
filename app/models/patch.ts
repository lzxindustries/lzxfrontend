// import Mongoose from 'mongoose';

export interface PatchInterface {
  name: string;
  diagram: string;
  // artist: { type: Mongoose.Schema.Types.ObjectId, ref: 'artist' };
  youtube: string;
  notes: string;
}

// const PatchSchema = new Mongoose.Schema({
//   name: String,
//   diagram: String,
//   artist: { type: Mongoose.Schema.Types.ObjectId, ref: 'artist' },
//   youtube: String,
//   notes: String
// }, {
//   timestamps: false,
// });

// export { PatchInterface };
