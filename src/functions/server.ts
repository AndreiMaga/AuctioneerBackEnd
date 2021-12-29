import { addDoc, collection, connectFirestoreEmulator, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore";
import { IBidRequest } from "..";
import {
  docToIAuction,
  docToIBidArray,
  IAuction,
  IBid,
} from "../common/auction";
import { docToIUser, IUser } from "../common/user";
import { database } from "../firebase/firebase";

export interface BidTry {
  error?: string;
}

async function getAuction(reqBody: IBidRequest) {

  let docref = doc(database, `auctions`, reqBody.auctionid.trim())

  let docdata = await getDoc(docref)
  return {id:docdata.id, ...docdata.data()} as IAuction
}

export async function getUser(reqBody: IBidRequest): Promise<IUser | null> {

  let docref = doc(database, `users`, reqBody.user.trim())

  let docdata = await getDoc(docref)

  let user: IUser = {id: docdata.id, ...docdata.data()}

  // if(user.token !== reqBody.token){
  //   return null
  // }

  return user;
}

async function getBids(id: string) {
  const q = query(
    collection(database, "bids", id.trim(), "bids"),
    orderBy("time", "asc")
  );

  let docs = await getDocs(q);
  let bids: IBid[] = [];

  docs.forEach((doc) => {
    bids.push(docToIBidArray(doc));
  });
  return bids;
}

export async function tryToBid(reqBody: IBidRequest): Promise<BidTry> {
  // check time && eligibility
  let auction = await getAuction(reqBody);
  if (auction == null) {
    return { error: "There is no such auction." };
  }
  let timeNow = Date.now();

  if (auction.endTime) {
    if (auction.endTime < timeNow) {
      return { error: "This auction expired." };
    }
  }

  // check funds
  let user = await getUser(reqBody);

  if (user == null) {
    return { error: "No such user." };
  }

  let nextBid: number = 0;
  if(auction.bidsId === undefined){
    nextBid = parseFloat(auction.startBid?.toString() || "0") || 100
    nextBid += nextBid * 0.01 // tax
    return createFirstBid(reqBody, user, auction, nextBid)
  }
  let bids = await getBids(auction.bidsId);

  if (bids == []) {
    nextBid = auction.startBid ? auction.startBid : 0;
  } else {
    let lastBid = bids[bids.length - 1];
    if (lastBid.bid === undefined) {
      nextBid = auction.startBid ? auction.startBid : 0;
    } else {
      nextBid =
        parseFloat(lastBid.bid as unknown as string) +
        lastBid.bid * (auction?.bidPercent || 0.1);
    }
  }

  if(nextBid  != 0 && nextBid != reqBody.bid){
    console.log(`Not equals ${nextBid} and ${reqBody.bid}`)
    return { error: "The requested bid is not valid or was surpassed." };
  }

  nextBid += nextBid * 0.01
  if(!user.availableFunds ||  nextBid> user.availableFunds){
    return { error: "Insufficient funds."}
  }

  // check bids did not change

  let newBids = await getBids(auction.bidsId)

  if(bids.length !== newBids.length){
    return { error: "The requested bid is not valid or was surpassed."}
  }

  // bid can go through
  await createBid(reqBody, user, auction)

  return {};
}


async function createFirstBid(reqBid: IBidRequest, user: IUser, auction: any,nextBid : number) :Promise<BidTry> {
  if(!user.availableFunds ||  nextBid > user.availableFunds){
    return { error: "Insufficient funds."}
  }

  let bidsdoc = doc(collection(database, "bids"))

  await setDoc(bidsdoc,{})

  let auctionDoc = doc(database, "auctions", reqBid.auctionid.trim())

  await updateDoc(auctionDoc, {bidsId: bidsdoc.id, currentBid:  nextBid})

  let bidDoc = collection(database, "bids", bidsdoc.id, "bids")

  await addDoc(bidDoc, {bid:nextBid, time: reqBid.time, username: user.username, userId: user.id})

  return {}
}


async function createBid(reqBid: IBidRequest, user: IUser, auction: any){
  let auctionDoc = doc(database, "auctions", reqBid.auctionid.trim())

  await updateDoc(auctionDoc, {"currentBid":  reqBid.bid})

  let bidDoc = collection(database, "bids", auction.bidsId.trim(), "bids")

  await addDoc(bidDoc, {bid:reqBid.bid, time: reqBid.time, username: user.username, userId: user.id})
}