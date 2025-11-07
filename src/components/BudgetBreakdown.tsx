'use client'

import React from 'react'
import { DollarSign, PieChart, TrendingUp } from 'lucide-react'

type BudgetCategory = {
  category: string
  cost: number
  notes?: string
}

type BudgetEstimate = {
  currency?: string
  total?: number
  categories?: BudgetCategory[]
}

type Props = {
  budget: BudgetEstimate
  days?: number
}

export default function BudgetBreakdown({ budget, days = 1 }: Props) {
  if (!budget || !budget.categories?.length) return null

  const { currency = 'USD', total = 0, categories = [] } = budget
  const perDay = total / days

  // Calculate percentages for visual representation
  const categoriesWithPercentage = categories.map(cat => ({
    ...cat,
    percentage: total > 0 ? (cat.cost / total) * 100 : 0
  }))

  // Color scheme for categories
  const colors = [
    'bg-blue-500',
    'bg-rose-500',
    'bg-amber-500',
    'bg-emerald-500',
    'bg-purple-500',
    'bg-indigo-500'
  ]

  return (
    <section className="mt-8 rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 px-6 py-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <DollarSign className="size-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">💰 Budget Breakdown</h2>
              <p className="text-sm text-neutral-600">Complete cost estimate for your trip</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-emerald-600">${total.toLocaleString()}</div>
            <div className="text-sm text-neutral-600">Total Estimate</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="size-4 text-blue-600" />
              <div className="text-xs font-semibold text-blue-900 uppercase">Per Day</div>
            </div>
            <div className="text-2xl font-bold text-blue-900">${perDay.toFixed(0)}</div>
          </div>
          
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
            <div className="flex items-center gap-2 mb-1">
              <PieChart className="size-4 text-emerald-600" />
              <div className="text-xs font-semibold text-emerald-900 uppercase">Duration</div>
            </div>
            <div className="text-2xl font-bold text-emerald-900">{days} Days</div>
          </div>

          <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="size-4 text-amber-600" />
              <div className="text-xs font-semibold text-amber-900 uppercase">Currency</div>
            </div>
            <div className="text-2xl font-bold text-amber-900">{currency}</div>
          </div>
        </div>

        {/* Visual Budget Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-neutral-800">Budget Allocation</div>
            <div className="text-xs text-neutral-600">Percentage by category</div>
          </div>
          <div className="flex h-8 rounded-lg overflow-hidden shadow-sm">
            {categoriesWithPercentage.map((cat, idx) => (
              <div
                key={cat.category}
                className={`${colors[idx % colors.length]} relative group`}
                style={{ width: `${cat.percentage}%` }}
                title={`${cat.category}: ${cat.percentage.toFixed(1)}%`}
              >
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  {cat.percentage > 10 && `${cat.percentage.toFixed(0)}%`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-neutral-200">
                <th className="text-left py-3 px-3 font-semibold text-neutral-900">Category</th>
                <th className="text-right py-3 px-3 font-semibold text-neutral-900">Amount</th>
                <th className="text-right py-3 px-3 font-semibold text-neutral-900">% of Total</th>
                <th className="text-left py-3 px-3 font-semibold text-neutral-900">Details</th>
              </tr>
            </thead>
            <tbody>
              {categoriesWithPercentage.map((cat, idx) => (
                <tr key={cat.category} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${colors[idx % colors.length]}`}></div>
                      <span className="font-medium text-neutral-700">{cat.category}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-neutral-900">
                    ${cat.cost.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right text-neutral-600">
                    {cat.percentage.toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-neutral-600 text-sm">
                    {cat.notes}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-neutral-300 bg-neutral-50 font-bold">
                <td className="py-3 px-3 text-neutral-900">Total Estimate</td>
                <td className="py-3 px-3 text-right text-emerald-600 text-lg">
                  ${total.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right text-neutral-900">100%</td>
                <td className="py-3 px-3 text-neutral-600 text-xs">
                  Per person estimate
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Budget Tips */}
        <div className="mt-6 rounded-lg border border-amber-100 bg-amber-50/50 p-4">
          <div className="text-sm font-semibold text-amber-900 mb-2">💡 Budget Tips</div>
          <ul className="space-y-1 text-sm text-amber-900/90">
            <li>• Prices are estimates and may vary by season and availability</li>
            <li>• Consider booking accommodations and flights in advance for better rates</li>
            <li>• Local transport costs can be reduced by using public transportation</li>
            <li>• Set aside 10-15% extra for unexpected expenses and souvenirs</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
