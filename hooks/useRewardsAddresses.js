import useWallets from '@/hooks/useWallets'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import PropTypes from 'prop-types'
import algosdk from 'algosdk'

// PouchDB
// import DB from 'lib/db'

export const RewardsAddressesContext = createContext(undefined)

export function RewardsAddressesProvider({ children }) {
  const [formattedAddresses, setFormattedAddresses] = useState([])
  const [addresses, setAddresses] = useState([])
  const [activeWallet, setActiveWallet] = useState()

  return (
    <RewardsAddressesContext.Provider
      value={{
        addresses,
        setAddresses,
        formattedAddresses,
        setFormattedAddresses,
        activeWallet,
        setActiveWallet,
      }}
    >
      {children}
    </RewardsAddressesContext.Provider>
  )
}
RewardsAddressesProvider.propTypes = {
  children: PropTypes.node,
}
const indexerClient = new algosdk.Indexer(
  '',
  'https://algoindexer.algoexplorerapi.io',
  443
)
/**
 * Account info from Algorand Indexer
 * @param {Wallet} wallet
 * @return {Object}
 * @private
 */
const _getEmptyAccountInfo = (wallet) => {
  return {
    amount: 0,
    'amount-without-pending-rewards': 0,
    'apps-local-state': [],
    'apps-total-schema': { 'num-byte-slice': 0, 'num-uint': 0 },
    assets: [],
    'created-apps': [],
    'created-assets': [],
    'pending-rewards': 0,
    'reward-base': 0,
    rewards: 0,
    round: -1,
    status: 'Offline',
    ...wallet,
  }
}

export default function useRewardsAddresses() {
  // const db = new DB('algodex_user_wallet_addresses')
  const context = useContext(RewardsAddressesContext)
  if (context === undefined) {
    throw new Error('Must be inside of a Rewards Addresses Provider')
  }
  const {
    formattedAddresses,
    addresses,
    setAddresses,
    activeWallet,
    setActiveWallet,
  } = context

  const updateAddresses = useCallback((_addresses) => {
    if (_addresses == null) {
      return
    }
    updateStorage(_addresses, activeWallet)
  }, [])

  const {
    setAddresses: _setAddresses,
    myAlgoConnect,
    peraConnect,
    peraDisconnect,
    myAlgoDisconnect,
  } = useWallets(updateAddresses)

  const rehydrate = (wallet) => {
    return (
      typeof wallet !== 'undefined' && //activeWallet exists &
      typeof wallet?.connector?.sign === 'undefined' // does not have a signing method
    )
  }

  // Fetch saved and active wallets from storage
  useEffect(() => {
    const getDBData = async () => {
      //  const _addresses = db.getAddresses()
      const _activeWallet = JSON.parse(localStorage.getItem('activeWallet'))
      const _addresses =
        JSON.parse(localStorage.getItem('algodex_user_wallet_addresses')) || []
      setAddresses(_addresses)
      _setAddresses(_addresses)
      if (_addresses.length > 0) {
        setActiveWallet(_activeWallet)
        if (
          _activeWallet.type == 'wallet-connect' &&
          rehydrate(_activeWallet)
        ) {
          peraConnect()
        }
      }
    }
    getDBData()
  }, [])

  //save active wallet when updated
  useEffect(() => {
    const _activeWallet = JSON.parse(localStorage.getItem('activeWallet'))
    if (
      addresses.length > 0 &&
      _activeWallet?.address !== activeWallet?.address
    ) {
      if (_activeWallet.type == 'wallet-connect' && rehydrate(_activeWallet)) {
        setActiveWallet(_activeWallet)
        peraConnect()
      } else {
        updateStorage(addresses, activeWallet)
      }
    }
  }, [activeWallet])

  //Get account info
  const getAccountInfo = async (_addresses) => {
    const result = await Promise.all(
      _addresses.map(async (addr) => {
        let accountInfo
        try {
          accountInfo = (
            await indexerClient
              .lookupAccountByID(addr.address)
              .includeAll(true)
              .do()
          ).account
          if (typeof accountInfo?.assets === 'undefined') {
            accountInfo.assets = []
          }
        } catch (e) {
          if (e.status !== 404) {
            throw e
          } else {
            accountInfo = _getEmptyAccountInfo(addr)
          }
        }
        return {
          ...addr,
          ...accountInfo,
        }
      })
    )
    return result
  }

  // Handle storage
  const updateStorage = async (_addresses, _activeWallet) => {
    const result = await getAccountInfo(_addresses)
    if (_activeWallet?.address) {
      const active = _addresses.find(
        ({ address }) => address == _activeWallet?.address
      )
      let _formattedAddresses = [
        active,
        ...result.filter(({ address }) => address !== _activeWallet?.address),
      ]
      setAddresses(_formattedAddresses)
      _setAddresses(_formattedAddresses)
      setActiveWallet(_activeWallet)
      localStorage.setItem(
        'algodex_user_wallet_addresses',
        JSON.stringify(_formattedAddresses)
      )
      localStorage.setItem('activeWallet', JSON.stringify(_activeWallet))
    } else {
      setAddresses(result)
      _setAddresses(result)
      if (result.length > 0) {
        localStorage.setItem(
          'algodex_user_wallet_addresses',
          JSON.stringify(result)
        )
        setActiveWallet(result[0])
        localStorage.setItem('activeWallet', JSON.stringify(result[0]))
      }
    }
  }

  // Handle removing from storage
  const handleDisconnect = (_address, type) => {
    if (type == 'wallet-connect') {
      peraDisconnect(type)
    } else {
      myAlgoDisconnect(_address)
    }
    if (addresses.length > 1) {
      const remainder = addresses.filter(({ address }) => address != _address)
      _setAddresses(remainder)
      if (_address == activeWallet?.address) {
        updateStorage(remainder, remainder[0].address)
      } else {
        updateStorage(remainder, activeWallet)
      }
    } else {
      localStorage.removeItem('algodex_user_wallet_addresses')
      localStorage.removeItem('activeWallet')
      setAddresses([])
      _setAddresses([])
      setActiveWallet()
    }
  }

  return {
    formattedAddresses,
    addresses,
    setAddresses,
    activeWallet,
    setActiveWallet,
    myAlgoConnect,
    peraConnect,
    handleDisconnect,
  }
}
