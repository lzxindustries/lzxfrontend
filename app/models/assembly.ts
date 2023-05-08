import Mongoose from 'mongoose';

interface AssemblyInterface {
  name: string;
}

const AssemblySchema = new Mongoose.Schema({
  name: String,
}, {
  timestamps: false,
});

export { AssemblyInterface, AssemblySchema };

