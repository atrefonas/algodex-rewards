import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'

//MUI components
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell, { tableCellClasses } from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Checkbox from '@mui/material/Checkbox'
import { styled } from '@mui/material/styles'
import { ChartDataContext } from 'context/chartContext'

const rows = [
  {
    asset: 'ALL',
    EDRewards: '267 ALGX',
    total: '56.5 ALGX',
  },
  {
    asset: 'goBTC',
    EDRewards: '267 ALGX',
    total: '56.5 ALGX',
  },
  {
    asset: 'ACORN',
    EDRewards: '37.8 ALGX',
    total: '265.8 ALGX',
  },
]

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: theme.palette.primary.light,
    borderColor: theme.palette.secondary.main,
    fontSize: 15,
    fontWeight: 600,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    color: theme.palette.secondary.contrastText,
    borderColor: theme.palette.secondary.main,
  },
}))

export const AssetTable = ({ isConnected }) => {
  const [selected, setSelected] = useState([])
  const context = useContext(ChartDataContext)
  if (context === undefined) {
    throw new Error('Must be inside of a Chart Provider')
  }
  const { activeRange } = context

  const columns = [
    { id: 'asset', label: 'Asset' },
    {
      id: 'EDRewards',
      label: 'Est Daily Rewards',
      format: (value) => value.toLocaleString('en-US'),
    },
    {
      id: 'total',
      label: `Total (${activeRange == '1D' ? '1wk' : activeRange})`,
      format: (value) => value.toLocaleString('en-US'),
    },
  ]

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.asset)
      setSelected(newSelecteds)
      return
    }
    setSelected([])
  }

  const handleClick = (event, asset) => {
    const selectedIndex = selected.indexOf(asset)
    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, asset)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      )
    }

    setSelected(newSelected)
  }

  const isSelected = (name) => selected.indexOf(name) !== -1

  return (
    <>
      {isConnected && (
        <>
          <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
              <TableHead>
                <TableRow>
                  <StyledTableCell></StyledTableCell>
                  {columns.map((item) => (
                    <StyledTableCell key={item.id}>
                      {item.label}
                    </StyledTableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => {
                  const isItemSelected = isSelected(row.asset)
                  const labelId = `enhanced-table-checkbox-${index}`
                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.asset)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.asset}
                      selected={isItemSelected}
                    >
                      <StyledTableCell padding="checkbox">
                        {row.asset == 'ALL' ? (
                          <Checkbox
                            sx={{ color: 'secondary.contrastText' }}
                            indeterminate={
                              selected.length > 0 &&
                              selected.length < rows.length
                            }
                            checked={
                              rows.length > 0 && selected.length === rows.length
                            }
                            onChange={handleSelectAllClick}
                            inputProps={{
                              'aria-label': 'select all',
                            }}
                          />
                        ) : (
                          <Checkbox
                            sx={{ color: 'secondary.contrastText' }}
                            checked={isItemSelected}
                            inputProps={{
                              'aria-labelledby': labelId,
                            }}
                          />
                        )}
                      </StyledTableCell>
                      {columns.map((column) => {
                        const value = row[column.id]
                        return (
                          <StyledTableCell key={column.id} align={column.align}>
                            {value}
                          </StyledTableCell>
                        )
                      })}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </>
  )
}

AssetTable.propTypes = {
  isConnected: PropTypes.bool,
}

AssetTable.defaultProps = {
  isConnected: false,
}
