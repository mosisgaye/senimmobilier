import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/properties/stats
 * Récupère les statistiques des propriétés
 * - Nombre total de propriétés actives
 * - Liste des villes avec compteur
 * - Prix moyen, min, max
 * - Répartition par type de propriété
 */
export async function GET() {
  try {
    // Récupérer toutes les propriétés actives pour calculer les stats
    const { data: properties, error } = await supabase
      .from('properties')
      .select('city, property_type, price, transaction_type')
      .eq('status', 'active')
      .eq('is_available', true)

    if (error) {
      console.error('Error fetching properties stats:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des statistiques' },
        { status: 500 }
      )
    }

    // Calculer les statistiques
    const stats = {
      total: properties.length,
      cities: {} as Record<string, number>,
      propertyTypes: {} as Record<string, number>,
      transactionTypes: {} as Record<string, number>,
      prices: {
        min: 0,
        max: 0,
        average: 0
      }
    }

    let totalPrice = 0

    properties.forEach(property => {
      // Compter par ville
      if (property.city) {
        stats.cities[property.city] = (stats.cities[property.city] || 0) + 1
      }

      // Compter par type de propriété
      if (property.property_type) {
        stats.propertyTypes[property.property_type] =
          (stats.propertyTypes[property.property_type] || 0) + 1
      }

      // Compter par type de transaction
      if (property.transaction_type) {
        stats.transactionTypes[property.transaction_type] =
          (stats.transactionTypes[property.transaction_type] || 0) + 1
      }

      // Calculer prix
      if (property.price) {
        totalPrice += property.price
        if (stats.prices.min === 0 || property.price < stats.prices.min) {
          stats.prices.min = property.price
        }
        if (property.price > stats.prices.max) {
          stats.prices.max = property.price
        }
      }
    })

    // Calculer le prix moyen
    if (properties.length > 0) {
      stats.prices.average = Math.round(totalPrice / properties.length)
    }

    // Convertir les objets en tableaux triés
    const citiesArray = Object.entries(stats.cities)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    const propertyTypesArray = Object.entries(stats.propertyTypes)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)

    const transactionTypesArray = Object.entries(stats.transactionTypes)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      total: stats.total,
      cities: citiesArray,
      propertyTypes: propertyTypesArray,
      transactionTypes: transactionTypesArray,
      prices: stats.prices
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur inattendue' },
      { status: 500 }
    )
  }
}
