import Mongoose from 'mongoose';

interface ModuleAssemblyInterface {
  assembly: { type: Mongoose.Schema.Types.ObjectId, ref: 'assembly' };
  module: { type: Mongoose.Schema.Types.ObjectId, ref: 'module' };
}

const ModuleAssemblySchema = new Mongoose.Schema({
  assembly: { type: Mongoose.Schema.Types.ObjectId, ref: 'assembly' },
  module: { type: Mongoose.Schema.Types.ObjectId, ref: 'module' }
}, {
  timestamps: false,
});

export { ModuleAssemblyInterface, ModuleAssemblySchema };

