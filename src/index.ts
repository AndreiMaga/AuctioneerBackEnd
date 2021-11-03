import express, { Express } from "express";
import { port } from "./config/.server.json";
import { LogCalls } from "./functions/server";
class App {
  app: Express;

  constructor() {
    this.app = express();
    this.app.get("/", (req, res) => {});

    /**
     * Request to see the auction at id, returns the auction
     */
    this.app.post("/auction/:id", this.auctionid.bind(this));
    /**
     * Request to bid on the auction at id
     */
    this.app.post("/auction/bid/:id", async (req, res) => {});

    /**
     * Request to see the list of bids, return the list of bids
     */
    this.app.post("/auction/bids/:id", async (req, res) => {});

    /**
     * Request to login, returns a sessionid
     */
    this.app.post("/login", async (req, res) => {});

    /**
     * Request to delete sessionid
     */
    this.app.post("/logout", async (req, res) => {});

    this.app.listen(port, () => {
      console.log(`Express server started`);
    });
  }

  @LogCalls
  async auctionid(req: any, res: any) {
    let response = {
      data: req.params.id,
    };

    res.send(JSON.stringify(response));
  }
}

new App();
