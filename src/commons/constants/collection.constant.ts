import { MongooseQueryOrDocumentMiddleware } from 'mongoose';

export const READ_MODE = '';

export const MONGOOSE_MIDDLEWARE_METHODS: MongooseQueryOrDocumentMiddleware[] = [
  'countDocuments',
  'deleteMany',
  'deleteOne',
  'distinct',
  'estimatedDocumentCount',
  'find',
  'findOne',
  'findOneAndDelete',
  'findOneAndReplace',
  'findOneAndUpdate',
  'replaceOne',
  'updateMany',
  'updateOne',
];

export const AUTH_COLLECTION = {
  
};

export const EVENT_COLLECTION = {

};

