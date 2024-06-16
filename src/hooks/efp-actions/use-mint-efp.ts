import { useMemo, useState } from 'react'
import { encodePacked, type Address } from 'viem'
import { useAccount, useWalletClient } from 'wagmi'

import * as abi from 'src/lib/abi.ts'
import { DEFAULT_CHAIN } from '#/lib/constants/chain'
import { generateListStorageLocationSlot } from '#/app/efp/utilities.ts'
import { coreEfpContracts, ListRecordContracts } from '#/lib/constants/contracts.ts'

export function useMintEFP() {
  const [listHasBeenMinted, setListHasBeenMinted] = useState(false)
  const { address: accountAddress } = useAccount()
  const { data: walletClient } = useWalletClient()
  const nonce = useMemo(() => generateListStorageLocationSlot(), [])

  const mint = async (selectedChainId?: number) => {
    if (!accountAddress) return

    const listRecordsContractAddress = selectedChainId
      ? (ListRecordContracts[selectedChainId] as Address)
      : coreEfpContracts.EFPListRecords

    try {
      const hash = await walletClient?.writeContract({
        chain: DEFAULT_CHAIN,
        address: coreEfpContracts.EFPListMinter,
        abi: abi.efpListMinterAbi,
        functionName: 'easyMint',
        args: [
          encodePacked(
            ['uint8', 'uint8', 'uint256', 'address', 'uint'],
            [1, 1, BigInt(selectedChainId || DEFAULT_CHAIN.id), listRecordsContractAddress, nonce]
          )
        ]
      })

      setListHasBeenMinted(true)
      return hash
    } catch (e: any) {
      setListHasBeenMinted(false)
      throw new Error(e)
    }
  }

  return {
    mint,
    nonce,
    walletClient,
    listHasBeenMinted
  }
}
