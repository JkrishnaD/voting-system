import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Votingsystem} from '../target/types/votingsystem'

describe('votingsystem', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Votingsystem as Program<Votingsystem>

  const votingsystemKeypair = Keypair.generate()

  it('Initialize Votingsystem', async () => {
    await program.methods
      .initialize()
      .accounts({
        votingsystem: votingsystemKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([votingsystemKeypair])
      .rpc()

    const currentCount = await program.account.votingsystem.fetch(votingsystemKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Votingsystem', async () => {
    await program.methods.increment().accounts({ votingsystem: votingsystemKeypair.publicKey }).rpc()

    const currentCount = await program.account.votingsystem.fetch(votingsystemKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Votingsystem Again', async () => {
    await program.methods.increment().accounts({ votingsystem: votingsystemKeypair.publicKey }).rpc()

    const currentCount = await program.account.votingsystem.fetch(votingsystemKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Votingsystem', async () => {
    await program.methods.decrement().accounts({ votingsystem: votingsystemKeypair.publicKey }).rpc()

    const currentCount = await program.account.votingsystem.fetch(votingsystemKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set votingsystem value', async () => {
    await program.methods.set(42).accounts({ votingsystem: votingsystemKeypair.publicKey }).rpc()

    const currentCount = await program.account.votingsystem.fetch(votingsystemKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the votingsystem account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        votingsystem: votingsystemKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.votingsystem.fetchNullable(votingsystemKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
