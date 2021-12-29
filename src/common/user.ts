import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export interface IUser{
    id: string,
    availableFunds?: number,
    username?: string,
    token?: string
}

export function docToIUser(doc: QueryDocumentSnapshot<DocumentData>) : IUser{
    return {
        id: doc.id,
        ...doc.data()
      }
}