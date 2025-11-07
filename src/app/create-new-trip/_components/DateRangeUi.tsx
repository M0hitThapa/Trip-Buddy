'use client'

import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { DateRange } from 'react-day-picker'

type Props = {
  onSelectedRange: (value: string) => void
  autoOpen?: boolean
}

const DateRangeUi = ({ onSelectedRange, autoOpen = false }: Props) => {
  const [open, setOpen] = useState(autoOpen)
  const [range, setRange] = useState<DateRange | undefined>(undefined)

  const isValid = Boolean(range?.from && range?.to)

  const formatted = useMemo(() => {
    if (!range?.from || !range?.to) return null
    const toISO = (d: Date) => d.toISOString().slice(0, 10)
    return `Travel dates: from ${toISO(range.from)} to ${toISO(range.to)}`
  }, [range])

  function submit() {
    if (!isValid || !formatted) return
    onSelectedRange(formatted)
    setOpen(false)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select your travel dates</DialogTitle>
          <DialogDescription>Choose a start and end date for your trip.</DialogDescription>
        </DialogHeader>
        <div className='flex justify-center'>
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={range}
            onSelect={setRange}
            disabled={{ before: today }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={!isValid} onClick={submit}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DateRangeUi


