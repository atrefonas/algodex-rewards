/* eslint-disable max-len */
import React, { useMemo } from 'react'
import Image from 'next/image'

//Material UI
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Button from '@mui/material/Button'

//Custom hook
import useRewardsAddresses from '@/hooks/useRewardsAddresses'
import { WarningCard } from './WarningCard'

const styles = {
  accordionStyles: {
    marginBlock: '1rem',
    boxShadow: 'none',
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
}

export const WalletList = () => {
  const { addresses, activeWallet, handleDisconnect, minAmount } =
    useRewardsAddresses()

  const shortenAddress = (address) => {
    const list = address.split('')
    const first = list.slice(0, 6)
    const last = list.slice(list.length - 6, list.length)
    return `${first.join('')}...${last.join('')}`
  }

  const formattedAddresses = useMemo(() => {
    const copy = [...addresses]
    if (activeWallet) {
      const index = copy.findIndex(
        (wallet) => wallet?.address == activeWallet.address
      )
      if (index >= 0) {
        copy.splice(index, 1)
      }
      copy.unshift(activeWallet)
    }
    return copy
  }, [addresses, activeWallet])
  
  return (
    <>
      {formattedAddresses.map(({ address, type, assets, amount }) => (
        <Box key={address} marginY={'2rem'}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              color: 'primary.light',
            }}
          >
            <Typography fontSize={'0.95rem'}>WALLET NAME</Typography>
            <Typography fontSize={'0.95rem'}>BALANCE</Typography>
          </Box>
          <Accordion sx={styles.accordionStyles}>
            <AccordionSummary
              expandIcon={
                <ExpandMoreIcon sx={{ color: 'primary.contrastText' }} />
              }
              aria-controls="panel1a-content"
              id="panel1a-header"
              sx={{
                ['&.Mui-expanded']: { minHeight: 'auto' },
                ['.css-o4b71y-MuiAccordionSummary-content.Mui-expanded']: {
                  margin: 0,
                },
              }}
            >
              <Typography
                fontWeight={500}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'primary.contrastText',
                }}
              >
                <Image
                  src="/wallet-outline.svg"
                  height={13}
                  width={14}
                  alt="wallet"
                />
                <span style={{ marginLeft: '10px' }}>
                  {shortenAddress(address)}
                </span>
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {amount < minAmount ? (
                <WarningCard
                  title="Not enough ALGX in wallet for rewards"
                  warnings={[
                    `At least ${minAmount} ALGX must be held for a wallet to vest retroactive rewards and/or earn new rewards.`,
                  ]}
                />
              ) : (
                <>
                  {assets.map((asset) => (
                    <Box
                      key={asset['asset-id']}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '5px',
                      }}
                    >
                      <Typography
                        color={'primary.main'}
                        fontSize={'0.8rem'}
                        fontWeight={600}
                      >
                        {asset['asset-id'] == 724480511 && 'ALGX'}
                        {asset['asset-id'] == 31566704 && 'ALGO'}
                      </Typography>
                      <Typography
                        color={'primary.light2'}
                        fontSize={'0.8rem'}
                        textAlign={'right'}
                      >
                        {asset.amount / 1000000}
                      </Typography>
                    </Box>
                  ))}
                </>
              )}
              <Box sx={{ marginBlock: '1.5rem', textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  sx={{ fontSize: '0.8rem' }}
                  onClick={() => handleDisconnect(address, type)}
                >
                  Disconnect {shortenAddress(address)}
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      ))}
    </>
  )
}