'use client'

import { useState } from 'react'
import { Calculator, TrendingUp, Calendar, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'

interface FinancingCalculatorProps {
  terrainPrice: number
}

export default function FinancingCalculator({ terrainPrice }: FinancingCalculatorProps) {
  const [downPaymentPercent, setDownPaymentPercent] = useState(30)
  const [loanTerm, setLoanTerm] = useState(15)
  const [interestRate, setInterestRate] = useState(6.5)

  // Calculations
  const downPayment = (terrainPrice * downPaymentPercent) / 100
  const loanAmount = terrainPrice - downPayment
  const monthlyRate = interestRate / 100 / 12
  const numberOfPayments = loanTerm * 12

  // Monthly payment calculation (formula: M = P * [r(1+r)^n] / [(1+r)^n - 1])
  const monthlyPayment =
    loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

  const totalCost = downPayment + monthlyPayment * numberOfPayments
  const totalInterest = totalCost - terrainPrice

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(Math.round(price))
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-6 border border-emerald-100 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-600 rounded-xl">
          <Calculator className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Calculateur de Financement</h3>
          <p className="text-sm text-gray-600">Estimez vos mensualités</p>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-6 mb-6">
        {/* Down Payment */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Apport initial
            </label>
            <span className="text-lg font-bold text-emerald-600">
              {downPaymentPercent}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="50"
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10%</span>
            <span>50%</span>
          </div>
        </div>

        {/* Loan Term */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Durée du prêt
            </label>
            <span className="text-lg font-bold text-emerald-600">
              {loanTerm} ans
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="25"
            value={loanTerm}
            onChange={(e) => setLoanTerm(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5 ans</span>
            <span>25 ans</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Taux d'intérêt
            </label>
            <span className="text-lg font-bold text-emerald-600">
              {interestRate.toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min="3"
            max="12"
            step="0.5"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>3%</span>
            <span>12%</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3 p-4 bg-white rounded-xl border-2 border-emerald-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-700">Apport initial</span>
          </div>
          <span className="font-bold text-gray-900">{formatPrice(downPayment)} FCFA</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-700">Montant du prêt</span>
          </div>
          <span className="font-bold text-gray-900">{formatPrice(loanAmount)} FCFA</span>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-medium text-gray-900">Mensualité</span>
            </div>
            <span className="text-2xl font-bold text-emerald-600">
              {formatPrice(monthlyPayment)} FCFA
            </span>
          </div>
          <p className="text-xs text-gray-600 text-right">sur {loanTerm} ans</p>
        </div>

        <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-200">
          <span className="text-gray-700">Coût total</span>
          <span className="font-semibold text-gray-900">{formatPrice(totalCost)} FCFA</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700">Intérêts totaux</span>
          <span className="font-semibold text-orange-600">{formatPrice(totalInterest)} FCFA</span>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 mt-4 text-center">
        * Simulation indicative. Les conditions réelles peuvent varier selon l'établissement bancaire.
      </p>
    </div>
  )
}
