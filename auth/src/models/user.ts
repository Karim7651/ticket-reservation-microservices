import mongoose from 'mongoose';
import { Password } from '../services/password';
//an interface that describes the properties
//that are required to create a new User
interface UserAttrs {
  email: string;
  password: string;
}

//An interface that describes the properties
//that a User Model has
interface UserModel extends mongoose.Model<any> {
  build(attrs: UserAttrs): any;
}

//An interface that describes the properties
//that a User Document has (we'd have more properties than what we need to create a new User)
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret:any) {
        delete ret.password; //remove password from the response
        delete ret.__v; //remove __v from the response
        ret.id = ret._id; //rename _id to id
        delete ret._id; //remove _id from the response
      },
    },
  }
);
//we can't use an arrow function here because we need to use 'this' to refer to the user document
//and arrow functions do not have their own 'this' context
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
});
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);
User.build({
  email: 'test@test.com',
  password: 'password',
});
// //just to get ts involved in creating a new user (NEVER USE new User({...}))
// const buildUser = (attrs:UserAttrs)=>{
//     return new User(attrs);
// }
// buildUser({
//   email: 'test@test.com',
//   password: 'password'
// });
export { User };
