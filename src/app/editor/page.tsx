'use client'

import { useAccount } from 'wagmi'
import { useMemo, useState } from 'react'
import { isAddress, type Address } from 'viem'
import { useTranslation } from 'react-i18next'
import { useConnectModal } from '@rainbow-me/rainbowkit'

import Legend from './components/legend'
import { Search } from '#/components/search'
import { useCart } from '#/contexts/cart-context'
import { useConnectedProfile } from '#/api/actions'
import { FollowList } from '#/components/follow-list'
import { listOpAddListRecord } from '#/utils/list-ops'
import Recommendations from '#/components/recommendations'
import { PrimaryButton } from '#/components/primary-button'
import CreateOrUpdateEFPList from './components/create-or-update-efp-list'

export default function EditorPage() {
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const { isConnected } = useAccount()
  const { t } = useTranslation('editor')
  const { openConnectModal } = useConnectModal()
  const { totalCartItems, cartAddresses, addCartItem } = useCart()

  const { profile: connectedProfile } = useConnectedProfile()
  const hasCreatedEfpList = !Number.isNaN(connectedProfile?.primaryList)

  const profiles = useMemo(
    () =>
      cartAddresses.map(address => ({
        address,
        tags: []
      })),
    [cartAddresses]
  )

  const handleAddFollow = (address: Address) => {
    if (!isAddress(address)) return
    addCartItem({ listOp: listOpAddListRecord(address) })
  }

  return (
    <main className='flex flex-col-reverse xl:flex-row gap-4 min-h-full h-full w-full items-center xl:items-start justify-center text-center pt-10 xl:gap-6 pb-28 mt-20 md:mt-32 xl:mt-48 px-2 lg:px-8'>
      {isCheckingOut ? (
        <CreateOrUpdateEFPList setOpen={setIsCheckingOut} hasCreatedEfpList={hasCreatedEfpList} />
      ) : (
        <>
          <div className='flex  flex-col glass-card gap-6 p-6 h-fit rounded-2xl border-2 border-gray-200 xl:max-w-116 w-full xl:w-1/3'>
            <h1 className='text-left text-3xl font-semibold hidden xl:block'>{t('editor')}</h1>
            <div className='flex gap-2'>
              <Search size='w-3/4' />
              <button
                className='bg-gradient-to-b py-3 px-6 from-kournikova-300 rounded-full to-salmon-400 text-black h-auto'
                onClick={() => handleAddFollow('0x')}
              >
                Add
              </button>
            </div>
            <Recommendations header={t('recommendations')} />
          </div>
          <div className='flex h-full flex-col glass-card rounded-2xl border-2 border-gray-200 gap-3 md:gap-4 md:py-8 py-6 px-1 sm:px-3 md:px-4 w-full xl:w-2/3'>
            <div className='flex sm:justify-between flex-col gap-2 sm:flex-row sm:items-center px-3 md:px-4'>
              <h3 className='font-bold text-left text-2xl'>{t('unc-changes')}</h3>
              <Legend />
            </div>
            <FollowList
              profiles={profiles}
              listClassName='rounded-xl gap-1 sm:gap-0'
              listItemClassName='rounded-xl md:p-4 p-1.5 sm:p-2 hover:bg-white/80'
              showTags={true}
              isEditor={true}
              createListItem={!hasCreatedEfpList}
            />
          </div>
          <div className='fixed w-full top-[87.5vh] lg:top-[85vh] right-0 px-4 lg:right-[5vw] flex justify-end'>
            <div className='flex gap-6 w-full border-[1px] border-gray-200 lg:w-fit items-center p-4 bg-white/10 justify-between glass-card bg-opacity-50 shadow-xl rounded-xl'>
              <div className='flex gap-2 items-center'>
                <p className='text-6xl font-bold'>{totalCartItems}</p>
                <div className='flex flex-col text-lg text-left'>
                  <p className='font-bold'>Unconfirmed</p>
                  <p className='font-bold'>Changes</p>
                </div>
              </div>
              <PrimaryButton
                className='py-[14px] px-4 text-xl font-medium rounded-full'
                onClick={() => {
                  if (!isConnected) {
                    if (openConnectModal) openConnectModal()
                    return
                  }

                  setIsCheckingOut(true)
                }}
                label='Confirm'
              />
            </div>
          </div>
          <h1 className='text-center text-4xl font-semibold mb-6 xl:hidden'>{t('editor')}</h1>
        </>
      )}
    </main>
  )
}
