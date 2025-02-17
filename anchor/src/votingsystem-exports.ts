// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import VotingsystemIDL from '../target/idl/votingsystem.json'
import type { Votingsystem } from '../target/types/votingsystem'

// Re-export the generated IDL and type
export { Votingsystem, VotingsystemIDL }

// The programId is imported from the program IDL.
export const VOTINGSYSTEM_PROGRAM_ID = new PublicKey(VotingsystemIDL.address)

// This is a helper function to get the Votingsystem Anchor program.
export function getVotingsystemProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...VotingsystemIDL, address: address ? address.toBase58() : VotingsystemIDL.address } as Votingsystem, provider)
}

// This is a helper function to get the program ID for the Votingsystem program depending on the cluster.
export function getVotingsystemProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Votingsystem program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return VOTINGSYSTEM_PROGRAM_ID
  }
}
