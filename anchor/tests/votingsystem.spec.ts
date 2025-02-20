import { Votingsystem } from "./../target/types/votingsystem";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BankrunProvider, startAnchor } from "anchor-bankrun";

const IDL = require("../target/idl/votingsystem.json");

const votingAddress = new PublicKey(
  "coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF"
);

describe("votingsystem", () => {
  let context;
  let provider: BankrunProvider;
  let votingProgram: Program<Votingsystem>;
  let voter1: Keypair;
  let voter2: Keypair;

  beforeAll(async () => {
    context = await startAnchor(
      "",
      [{ name: "votingsystem", programId: votingAddress }],
      []
    );
    provider = new BankrunProvider(context);
    votingProgram = new Program<Votingsystem>(IDL, provider);
    voter1 = anchor.web3.Keypair.generate();
    voter2 = anchor.web3.Keypair.generate();
  });

  it("Initialize poll", async () => {
    await votingProgram.methods
      .startPoll(
        new anchor.BN(1),
        "who is your favourite hero",
        new anchor.BN(0),
        new anchor.BN(1739963768)
      )
      .rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      votingAddress
    );
    const poll = await votingProgram.account.poll.fetch(pollAddress);

    console.log(poll);

    expect(poll.pollId.toNumber()).toEqual(1);
    expect(poll.pollDescription).toEqual("who is your favourite hero");
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());
  });

  it("initialize candidate", async () => {
    await votingProgram.methods
      .initializeCandidate("Thalapathy", new anchor.BN(1))
      .rpc();

    await votingProgram.methods
      .initializeCandidate("Thala", new anchor.BN(1))
      .rpc();

    const [thalapathyAddress] = PublicKey.findProgramAddressSync(
      [
        new anchor.BN(1).toArrayLike(Buffer, "le", 8),
        Buffer.from("Thalapathy"),
      ],
      votingAddress
    );
    const thalapathy = await votingProgram.account.candidate.fetch(
      thalapathyAddress
    );
    expect(thalapathy.candidateVotes.toNumber()).toEqual(0);
    console.log(thalapathy);

    const [thalaAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Thala")],
      votingAddress
    );
    const thala = await votingProgram.account.candidate.fetch(thalaAddress);
    expect(thala.candidateVotes.toNumber()).toEqual(0);
    console.log(thala);
  });

  it("vote", async () => {
    await votingProgram.methods
      .vote("Thalapathy", new anchor.BN(1))
      .accounts({
        user: voter1.publicKey,
      })
      .signers([voter1])
      .rpc();
    await votingProgram.methods
      .vote("Thalapathy", new anchor.BN(1))
      .accounts({
        user: voter2.publicKey,
      })
      .signers([voter2])
      .rpc();
    // this following will throw an error because the voter2 has already voted
    // await votingProgram.methods
    //   .vote("Thala", new anchor.BN(1))
    //   .accounts({
    //     user: voter2.publicKey,
    //   })
    //   .signers([voter2])
    //   .rpc();

    const [thalapathyAddress] = PublicKey.findProgramAddressSync(
      [
        new anchor.BN(1).toArrayLike(Buffer, "le", 8),
        Buffer.from("Thalapathy"),
      ],
      votingAddress
    );
    const thalapathy = await votingProgram.account.candidate.fetch(
      thalapathyAddress
    );

    expect(thalapathy.candidateVotes.toNumber()).toEqual(2);
    console.log(thalapathy);
  });
});
