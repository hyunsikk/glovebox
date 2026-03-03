import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shared } from '../theme';
import { searchVehicles } from '../lib/vehicleDB';

const VehicleSearchItem = ({ vehicle, onSelect }) => (
  <TouchableOpacity
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: Colors.surface,
    }}
    onPress={() => onSelect(vehicle)}
    activeOpacity={0.7}
  >
    <View style={{ flex: 1 }}>
      <Text style={[Typography.body, { color: Colors.text }]}>
        {vehicle.make} {vehicle.model}
      </Text>
      <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
        {vehicle.years}{vehicle.generation ? ` • ${vehicle.generation}` : ''}
      </Text>
    </View>
    
    <View style={{
      backgroundColor: Colors.forestGreen + '20',
      borderRadius: 12,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 2,
      marginRight: Spacing.sm,
    }}>
      <Text style={[Typography.caption, { 
        color: Colors.forestGreen,
        fontSize: 10,
      }]}>
        ✓ Full data
      </Text>
    </View>
    
    <Ionicons name="chevron-forward" size={16} color={Colors.arcticSilver} />
  </TouchableOpacity>
);

export default function VehicleSearch({ onVehicleSelect, placeholder = "Search for your vehicle..." }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (searchQuery.length >= 2) {
      setIsSearching(true);
      debounceRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 150);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
    
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  const performSearch = (query) => {
    setIsSearching(true);
    
    try {
      const results = searchVehicles(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching vehicles:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleVehicleSelect = (vehicle) => {
    setSearchQuery(`${vehicle.make} ${vehicle.model} (${vehicle.years})`);
    setSearchResults([]);
    onVehicleSelect(vehicle);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  return (
    <View style={{ marginBottom: Spacing.lg }}>
      {/* Search Input */}
      <View style={{ position: 'relative' }}>
        <TextInput
          style={[Shared.input, {
            paddingRight: searchQuery ? 48 : Spacing.lg,
          }]}
          placeholder={placeholder}
          placeholderTextColor={Colors.arcticSilver}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="words"
          autoCorrect={false}
        />
        
        {searchQuery ? (
          <TouchableOpacity
            style={{
              position: 'absolute',
              right: Spacing.md,
              top: 14,
              width: 20,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={clearSearch}
          >
            <Ionicons name="close-circle" size={20} color={Colors.arcticSilver} />
          </TouchableOpacity>
        ) : (
          <View style={{
            position: 'absolute',
            right: Spacing.md,
            top: 14,
          }}>
            <Ionicons name="search" size={20} color={Colors.arcticSilver} />
          </View>
        )}
      </View>

      {/* Search Results */}
      {(searchResults.length > 0 || isSearching) && (
        <View style={{
          backgroundColor: Colors.elevated,
          borderRadius: 8,
          marginTop: Spacing.sm,
          overflow: 'hidden',
          maxHeight: 300,
        }}>
          {isSearching ? (
            <View style={{
              padding: Spacing.lg,
              alignItems: 'center',
            }}>
              <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                Searching...
              </Text>
            </View>
          ) : searchResults.length > 0 ? (
            <ScrollView nestedScrollEnabled={true}>
              {searchResults.map((item, index) => (
                <VehicleSearchItem
                  key={`${item.make}-${item.model}-${index}`}
                  vehicle={item}
                  onSelect={handleVehicleSelect}
                />
              ))}
            </ScrollView>
          ) : searchQuery.length >= 2 && (
            <View style={{
              padding: Spacing.lg,
              alignItems: 'center',
            }}>
              <Text style={[Typography.caption, { color: Colors.textSecondary, textAlign: 'center' }]}>
                No vehicles found for "{searchQuery}"
              </Text>
              <Text style={[Typography.caption, { 
                color: Colors.arcticSilver, 
                textAlign: 'center',
                marginTop: 4,
              }]}>
                Try searching for make and model (e.g., "Toyota Camry")
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Quick Examples */}
      {searchQuery.length === 0 && (
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginTop: Spacing.md,
        }}>
          <Text style={[Typography.caption, { color: Colors.textSecondary, marginRight: Spacing.sm }]}>
            Try:
          </Text>
          
          {['Toyota RAV4', 'Honda Civic', 'Ford F-150'].map((example, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSearchQuery(example)}
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 12,
                paddingHorizontal: Spacing.sm,
                paddingVertical: 2,
                marginRight: Spacing.sm,
                marginBottom: 4,
              }}
            >
              <Text style={[Typography.caption, { color: Colors.steelBlue }]}>
                {example}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}