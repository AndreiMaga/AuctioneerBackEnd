import {
  collection,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { IBidRequest } from "..";
import { database } from "../firebase/firebase";

export function apiKeyIsValid(apikey: string): boolean {
  return apikey === process.env.APIKEY;
}

export async function tokenIsValid(
    reqBody:IBidRequest
): Promise<boolean> {
  return (
    (
      await getDocs(
        query(
          collection(database, "users", "tokens"),
          where("uid", "==", reqBody.user),
          where("token", "==", reqBody.token)
        )
      )
    ).size !== 0
  );
}
