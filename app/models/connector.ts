import Mongoose from 'mongoose';

interface ConnectorInterface {
  name: string;
  module: { type: Mongoose.Schema.Types.ObjectId, ref: 'module' };
  is_input: boolean;
  is_output: boolean;
}

const ConnectorSchema = new Mongoose.Schema({
  name: String,
  module: { type: Mongoose.Schema.Types.ObjectId, ref: 'module' },
  is_input: Boolean,
  is_output: Boolean
}, {
  timestamps: false,
});

export { ConnectorInterface, ConnectorSchema };

