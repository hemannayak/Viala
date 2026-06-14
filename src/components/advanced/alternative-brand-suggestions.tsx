'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Package, 
  CheckCircle, 
  AlertTriangle,
  MapPin,
  DollarSign,
  Pill,
  Building,
  ArrowRight
} from 'lucide-react'
import { AlternativeBrand, AdvancedFEFOEngine } from '@/lib/advanced-fefo-engine'
import { InventoryItem } from '@/lib/db'
import { toast } from 'sonner'

interface AlternativeBrandSuggestionsProps {
  inventory: InventoryItem[]
  onBrandSelected?: (alternative: AlternativeBrand) => void
}

export function AlternativeBrandSuggestions({ 
  inventory, 
  onBrandSelected 
}: AlternativeBrandSuggestionsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [alternatives, setAlternatives] = useState<AlternativeBrand[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedAlternative, setSelectedAlternative] = useState<AlternativeBrand | null>(null)

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setAlternatives([])
      return
    }

    setIsSearching(true)
    try {
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const suggestions = AdvancedFEFOEngine.findAlternativeBrands(term, inventory)
      setAlternatives(suggestions)
      
      if (suggestions.length === 0) {
        toast.info(`No alternative brands found for "${term}"`)
      } else {
        toast.success(`Found ${suggestions.length} alternative brands`)
      }
    } catch (error) {
      console.error('Error finding alternatives:', error)
      toast.error('Failed to find alternative brands')
    } finally {
      setIsSearching(false)
    }
  }

  const handleBrandSelect = (alternative: AlternativeBrand) => {
    setSelectedAlternative(alternative)
    onBrandSelected?.(alternative)
    toast.success(`Selected ${alternative.alternativeBrand} as substitute`)
  }

  const getPriceComparisonColor = (price: number) => {
    // Assuming average price around ₹50 for comparison
    if (price < 30) return 'text-green-600'
    if (price < 70) return 'text-orange-600'
    return 'text-red-600'
  }

  const getPriceComparisonLabel = (price: number) => {
    if (price < 30) return 'Budget Option'
    if (price < 70) return 'Standard Price'
    return 'Premium Option'
  }

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-teal-600" />
            Alternative Brand Finder
          </CardTitle>
          <p className="text-sm text-gray-600">
            Find equivalent formulations when specific brands are out of stock
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Enter out-of-stock medicine name (e.g., Crocin, Brufen, Novamox)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => handleSearch(searchTerm)}
              disabled={isSearching || !searchTerm.trim()}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isSearching ? 'Searching...' : 'Find Alternatives'}
            </Button>
          </div>

          {/* Search Status */}
          {isSearching && (
            <div className="mt-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Analyzing brand equivalencies...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alternative Suggestions */}
      {alternatives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Available Alternatives for "{searchTerm}"
            </CardTitle>
            <p className="text-sm text-gray-600">
              {alternatives.length} equivalent formulation{alternatives.length > 1 ? 's' : ''} found in inventory
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {alternatives.map((alternative, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedAlternative?.alternativeBrand === alternative.alternativeBrand
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleBrandSelect(alternative)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{alternative.alternativeBrand}</h4>
                      {alternative.equivalenceConfirmed && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified Equivalent
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {alternative.manufacturer}
                      </div>
                      <div className="flex items-center gap-1">
                        <Pill className="h-3 w-3" />
                        {alternative.dosage}
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {alternative.formulation}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {alternative.shelfLocation}
                      </div>
                    </div>

                    {/* Substitution Notes */}
                    <Alert className="border-blue-200 bg-blue-50 mb-3">
                      <AlertTriangle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800 text-sm">
                        <strong>Substitution Notes:</strong> {alternative.substitutionNotes}
                      </AlertDescription>
                    </Alert>
                  </div>

                  <div className="ml-4 text-right">
                    <div className={`text-lg font-semibold ${getPriceComparisonColor(alternative.priceComparison)}`}>
                      ₹{alternative.priceComparison}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      {getPriceComparisonLabel(alternative.priceComparison)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {alternative.availableQuantity} units available
                    </div>
                  </div>
                </div>

                {/* Equivalence Confirmation */}
                <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                  <div className="flex items-center gap-2 text-green-800 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Pharmacist Verification Required</span>
                  </div>
                  <p className="text-green-700 text-xs mt-1">
                    Please confirm dosage equivalence and patient suitability before dispensing
                  </p>
                </div>

                {/* Selection Indicator */}
                {selectedAlternative?.alternativeBrand === alternative.alternativeBrand && (
                  <div className="flex items-center gap-2 text-teal-600 text-sm font-medium">
                    <CheckCircle className="h-4 w-4" />
                    Selected as substitute for {alternative.originalBrand}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Substitution Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            Brand Substitution Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Important:</strong> Always verify dosage equivalence and patient allergies before substituting brands
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Same active ingredient confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Equivalent dosage and formulation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Available in adequate quantities</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-orange-500" />
                <span>Patient consent required for brand substitution</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-orange-500" />
                <span>Check for brand-specific allergies or preferences</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No Results State */}
      {searchTerm && !isSearching && alternatives.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No alternative brands found for "{searchTerm}"</p>
            <p className="text-xs text-gray-400 mt-1">
              Try searching with generic name or check if the medicine is available under different brand names
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}