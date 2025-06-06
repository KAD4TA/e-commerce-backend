import { Users } from "src/typeorm";


declare module 'express' {
  interface Request {
    user?: Users; // `user` nesnesinin `User` tipinde olmasını sağla
  }
}
