import Mongoose from 'mongoose';

interface CompanyInterface {
  name: string;
}

const CompanySchema = new Mongoose.Schema({
  name: String,
}, {
  timestamps: false,
});

export { CompanyInterface, CompanySchema };

