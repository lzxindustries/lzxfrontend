import Mongoose from 'mongoose';

interface PartInterface {
  name: string;
}

const PartSchema = new Mongoose.Schema({
  name: String,
}, {
  timestamps: false,
});

export { PartInterface, PartSchema };

