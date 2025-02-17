'use client'

import { getVotingsystemProgram, getVotingsystemProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useVotingsystemProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getVotingsystemProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getVotingsystemProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['votingsystem', 'all', { cluster }],
    queryFn: () => program.account.votingsystem.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['votingsystem', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ votingsystem: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useVotingsystemProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useVotingsystemProgram()

  const accountQuery = useQuery({
    queryKey: ['votingsystem', 'fetch', { cluster, account }],
    queryFn: () => program.account.votingsystem.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['votingsystem', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ votingsystem: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['votingsystem', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ votingsystem: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['votingsystem', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ votingsystem: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['votingsystem', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ votingsystem: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
