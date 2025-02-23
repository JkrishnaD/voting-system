import {
  ActionPostRequest,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
} from "@solana/actions";
import { ActionGetResponse } from "./../../../../node_modules/@solana/actions-spec/index.d";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { BN, Program } from "@coral-xyz/anchor";
import { Votingsystem } from "@project/anchor";

import IDL from "../../../../anchor/target/idl/votingsystem.json";

export const OPTIONS = GET;

export async function GET(request: Request) {
  const actionMetaData: ActionGetResponse = {
    icon: "https://example.com/icon.png",
    title: "Voting System",
    description: "Vote for your favourite language",
    label: "Vote",
    links: {
      actions: [
        {
          label: "vote for javascript",
          href: "/api/vote?candidate=javascript",
          type: "transaction",
        },
        {
          label: "vote for rust",
          href: "/api/vote?candidate=rust",
          type: "transaction",
        },
      ],
    },
  };
  return Response.json(actionMetaData, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const candidate = url.searchParams.get("candidate");

  if (candidate != "javascript" && candidate != "rust") {
    return new Response("Invalid response", {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }

  const connection = new Connection("http://127.0.0.1:8899", "confirmed"); // to establish connection with the local validator
  const body: ActionPostRequest = await request.json(); // to get the account from the request
  const program: Program<Votingsystem> = new Program(IDL as Votingsystem, { connection }); // to create a program instance

  let voter;

  try {
    voter = new PublicKey(body.account);
  } catch (error) {
    return new Response("Invalid account", {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }

  const instruction = await program.methods
    .vote(candidate, new BN(1))
    .accounts({ user: voter })
    .instruction(); // to create an instruction to vote for the candidate

  const blockhash = await connection.getLatestBlockhash(); // getting the lastest

  const transaction = new Transaction({
    feePayer: voter,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
  }).add(instruction);

  const response = await createPostResponse({
    fields: {
      transaction: transaction,
      type: "transaction",
    },
  });
  
  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}