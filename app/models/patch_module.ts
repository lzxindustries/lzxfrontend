import Mongoose from 'mongoose';

interface PatchModuleInterface {
  patch: { type: Mongoose.Schema.Types.ObjectId, ref: 'patch' };
  module: { type: Mongoose.Schema.Types.ObjectId, ref: 'module' };
}

const PatchModuleSchema = new Mongoose.Schema({
  patch: { type: Mongoose.Schema.Types.ObjectId, ref: 'patch' },
  module: { type: Mongoose.Schema.Types.ObjectId, ref: 'module' }
}, {
  timestamps: false,
});

export { PatchModuleInterface, PatchModuleSchema };

