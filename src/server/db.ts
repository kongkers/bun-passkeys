import { DevicePasskey, User } from "../types";
import {
  FindOneAndReplaceOptions,
  InsertOneResult,
  MongoClient,
  WithId,
} from "mongodb";

const DB_URI = "mongodb://www:Loyalty098abc@10.1.1.252:27017/identity";
const DB_OPTIONS: FindOneAndReplaceOptions = {
  returnDocument: "after",
};

const client = new MongoClient(DB_URI);

const db = client.db("identity");
const usersCollection = db.collection<User>("users");

export async function getUserByEmail(email: string): Promise<User> {
  const resp = await usersCollection.findOne({
    email,
  });
  return <User>resp;
}

export async function updateUser(user: User): Promise<User> {
  const resp = await usersCollection.findOneAndReplace(
    {
      email: user.email,
    },
    user,
    DB_OPTIONS,
  );
  return <User>resp;
}

export async function updateUserChallenge(
  userEmail: string,
  challenge: string,
): Promise<User> {
  return await usersCollection.findOneAndUpdate(
    {
      email: userEmail,
    },
    {
      $set: { challenge },
    },
    DB_OPTIONS,
  );
}

export async function addUserCredential(
  userEmail: string,
  credential: DevicePasskey,
): Promise<User> {
  return await usersCollection.findOneAndUpdate(
    {
      email: userEmail,
    },
    {
      $addToSet: {
        credentials: credential,
      },
    },
    {
      returnDocument: "after",
    },
  );
}

export async function addUser(user: User): Promise<User> {
  const resp = await usersCollection.insertOne({
    ...user,
    credentials: [],
  });
  return {
    _id: resp.insertedId,
    ...user,
    credentials: [],
  };
}
