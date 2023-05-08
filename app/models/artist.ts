import Mongoose from 'mongoose';

interface ArtistInterface {
  name: string;
}

const ArtistSchema = new Mongoose.Schema({
  name: String
}, {
  timestamps: false,
});

export { ArtistInterface, ArtistSchema };
