import Mongoose from 'mongoose';

interface CableInterface {
  input_connector: { type: Mongoose.Schema.Types.ObjectId, ref: 'connector' };
  output_connector: { type: Mongoose.Schema.Types.ObjectId, ref: 'connector' };
  input_module: { type: Mongoose.Schema.Types.ObjectId, ref: 'patch_module' };
  output_module: { type: Mongoose.Schema.Types.ObjectId, ref: 'patch_module' };
}

const CableSchema = new Mongoose.Schema({
  input_connector: { type: Mongoose.Schema.Types.ObjectId, ref: 'connector' },
  output_connector: { type: Mongoose.Schema.Types.ObjectId, ref: 'connector' },
  input_module: { type: Mongoose.Schema.Types.ObjectId, ref: 'patch_module' },
  output_module: { type: Mongoose.Schema.Types.ObjectId, ref: 'patch_module' }
}, {
  timestamps: false,
});

export { CableInterface, CableSchema };

