// import Mongoose from 'mongoose';

export interface PatchInterface {
  name: string;
  diagram: string;
  artist: string;
  artist_name: string;
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
