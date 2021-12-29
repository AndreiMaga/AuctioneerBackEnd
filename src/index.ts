// const express = require('express').default;
import bodyParser from "body-parser";
import cors from "cors";
import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import dotenv from "dotenv";

import { port } from "./config/.server.json";
import { apiKeyIsValid, tokenIsValid } from "./functions/login";
import { tryToBid } from "./functions/server";
import initFirebase from "./firebase/firebase";

interface IBidResponse {
  error?: string;
  success?: boolean;
}

export interface IBidRequest {
  apikey: string;
  token: string;
  user: string;
  bid: number;
  auctionid: string;
  time: number;
}

class App {
  app: Express;

  constructor() {
    dotenv.config();

    this.app = express();
    this.app.use(morgan("short"));
    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
    this.app.get("/", (req, res) => {
      res.json({ app: "What can man do against such reckless hate?" });
    });

    /**
     * Request to bid on the auction at id
     */
    this.app.post("/auction/bid/:id", this.bid.bind(this));

    this.app.listen(port, () => {
      console.log(`Express server started on port:${port}`);
    });
  }

  somethingWentWrong(res: Response, response: IBidResponse) {
    response.error = "Something went wrong.";
    res.json(response);
    return;
  }

  async bid(req: Request, res: Response) {

    let reqBody = req.body as IBidRequest

    let apikey = reqBody.apikey;
    console.log(reqBody)
    let response: IBidResponse = { success: false };

    // if (!apiKeyIsValid(apikey)) {
    //   this.somethingWentWrong(res, response);
    //   return;
    // }


    // if (!(await tokenIsValid(reqBody))) {
    //   this.somethingWentWrong(res, response);
    //   return;
    // }

    try{
      let tryBid = await tryToBid(reqBody)

      if(tryBid.error){
        response.error = tryBid.error;
        console.error(tryBid)
        res.json(response);
        return
      }
    }catch(e){
      console.error(e)
      this.somethingWentWrong(res, response)
      return
    }



    response.success = true;
    res.json(response);
  }

  async auctionid(req: any, res: any) {
    let response = {
      data: req.params.id,
    };

    res.send(JSON.stringify(response));
  }
}

initFirebase();
new App();
