/**
 * Digital Glovebox - Documents Tab
 * 
 * Store and track vehicle documents like Insurance, Registration, Title
 * Features: expiry date tracking, photo attachments, expiry countdown badges
 * Uses existing photo/image infrastructure from imageUtils.js and ImageStorage
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Shared } from '../../theme';
import { VehicleStorage } from '../../lib/storage';

// Document types with their icons and typical expiry periods
const DOCUMENT_TYPES = {
  insurance: {
    name: 'Insurance',
    icon: 'shield-checkmark',
    color: Colors.primary,
    emoji: '🛡️',
    defaultValidityMonths: 12,
  },
  registration: {
    name: 'Registration',
    icon: 'document-text',
    color: Colors.success,
    emoji: '📋',
    defaultValidityMonths: 12,
  },
  title: {
    name: 'Title',
    icon: 'certificate',
    color: Colors.warning,
    emoji: '📜',
    defaultValidityMonths: null, // Usually permanent
  },
  inspection: {
    name: 'Inspection',
    icon: 'checkmark-circle',
    color: Colors.primary,
    emoji: '✅',
    defaultValidityMonths: 12,
  },
  emissions: {
    name: 'Emissions',
    icon: 'leaf',
    color: Colors.success,
    emoji: '🌱',
    defaultValidityMonths: 24,
  },
};

const DocumentCard = ({ document, vehicle, onPress, onEdit }) => {
  const docType = DOCUMENT_TYPES[document.type] || DOCUMENT_TYPES.insurance;
  
  const getExpiryStatus = () => {
    if (!document.expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(document.expiryDate);
    const daysUntil = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) {
      return { 
        text: 'expired', 
        color: Colors.danger, 
        days: Math.abs(daysUntil),
        status: 'expired'
      };
    } else if (daysUntil <= 30) {
      return { 
        text: `expires in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`, 
        color: Colors.warning,
        days: daysUntil,
        status: 'soon'
      };
    } else {
      return { 
        text: `expires in ${daysUntil} days`, 
        color: Colors.success,
        days: daysUntil,
        status: 'valid'
      };
    }
  };

  const expiryStatus = getExpiryStatus();

  return (
    <TouchableOpacity
      style={[Shared.card, { marginBottom: Spacing.md }]}
      onPress={() => onPress(document)}
      activeOpacity={0.9}
    >
      {/* Document Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
        <View style={{
          backgroundColor: docType.color + '20',
          borderRadius: 24,
          padding: 12,
          marginRight: Spacing.md,
          borderWidth: 1,
          borderColor: docType.color + '30',
        }}>
          <Text style={{ fontSize: 24 }}>{docType.emoji}</Text>
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
            {docType.name}
          </Text>
          <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
            {vehicle?.nickname || `${vehicle?.year} ${vehicle?.make} ${vehicle?.model}`}
          </Text>
        </View>

        {/* Photo indicator */}
        {document.photoUri && (
          <View style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: Colors.primary + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: Spacing.sm,
          }}>
            <Ionicons name="camera" size={12} color={Colors.primary} />
          </View>
        )}

        {/* Expiry status badge */}
        {expiryStatus && (
          <View style={{
            backgroundColor: expiryStatus.color + '20',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: expiryStatus.color + '40',
          }}>
            <Text style={[Typography.small, { 
              color: expiryStatus.color,
              fontFamily: 'Nunito_600SemiBold',
            }]}>
              {expiryStatus.status === 'expired' ? 'EXPIRED' : 
               expiryStatus.status === 'soon' ? `${expiryStatus.days}d` :
               'VALID'}
            </Text>
          </View>
        )}
      </View>

      {/* Document Details */}
      <View style={{
        backgroundColor: Colors.surface1 + '60',
        padding: Spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
      }}>
        {document.expiryDate && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
            <Text style={[Typography.body, { color: Colors.textSecondary }]}>
              expiry date
            </Text>
            <Text style={[Typography.body, { color: Colors.textPrimary }]}>
              {new Date(document.expiryDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
        )}
        
        {expiryStatus && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
            <Text style={[Typography.body, { color: Colors.textSecondary }]}>
              status
            </Text>
            <Text style={[Typography.body, { color: expiryStatus.color }]}>
              {expiryStatus.text}
            </Text>
          </View>
        )}

        {document.notes && (
          <View style={{ marginTop: Spacing.sm }}>
            <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
              {document.notes}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const VehicleSection = ({ vehicle, documents, onDocumentPress, onAddDocument }) => {
  const vehicleDocuments = documents.filter(doc => doc.vehicleId === vehicle.id);
  
  return (
    <View style={{ marginBottom: Spacing.section }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md }}>
        <Text style={[Typography.h1, { color: Colors.textPrimary }]}>
          {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        </Text>
        
        <TouchableOpacity
          onPress={() => onAddDocument(vehicle)}
          style={{
            backgroundColor: Colors.primary + '20',
            borderRadius: 16,
            padding: 8,
            borderWidth: 1,
            borderColor: Colors.primary + '30',
          }}
        >
          <Ionicons name="add" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      
      {vehicleDocuments.length > 0 ? (
        vehicleDocuments.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            vehicle={vehicle}
            onPress={onDocumentPress}
          />
        ))
      ) : (
        <View style={[Shared.card, {
          alignItems: 'center',
          paddingVertical: Spacing.xl,
          borderStyle: 'dashed',
          borderWidth: 2,
          borderColor: Colors.glassBorder,
          backgroundColor: 'transparent',
        }]}>
          <Text style={{ fontSize: 32, marginBottom: Spacing.md }}>📂</Text>
          <Text style={[Typography.body, { color: Colors.textSecondary, textAlign: 'center' }]}>
            no documents yet
          </Text>
          <Text style={[Typography.caption, { color: Colors.textTertiary, textAlign: 'center' }]}>
            tap + to add insurance, registration, or title
          </Text>
        </View>
      )}
    </View>
  );
};

const EmptyState = ({ onAddDocument }) => (
  <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.horizontalLarge,
  }}>
    <Text style={{ fontSize: 60, marginBottom: Spacing.xl }}>📂</Text>
    
    <Text style={[Typography.hero, { 
      textAlign: 'center', 
      marginBottom: Spacing.md,
      color: Colors.textPrimary,
    }]}>
      your digital glovebox
    </Text>
    
    <Text style={[Typography.body, { 
      textAlign: 'center', 
      color: Colors.textSecondary, 
      marginBottom: Spacing.section,
      lineHeight: 22,
    }]}>
      store insurance, registration, and title documents with expiry tracking. never miss a renewal again.
    </Text>

    <TouchableOpacity
      style={[Shared.buttonPrimary, { width: '100%', maxWidth: 280 }]}
      onPress={() => onAddDocument(null)}
      activeOpacity={0.9}
    >
      <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
        add first document
      </Text>
    </TouchableOpacity>
  </View>
);

export default function DocumentsScreen() {
  const [vehicles, setVehicles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const vehicleList = await VehicleStorage.getAll();
      setVehicles(vehicleList);
      
      // TODO: Load documents from storage
      // For now, use mock data
      const mockDocuments = vehicleList.length > 0 ? [
        {
          id: '1',
          vehicleId: vehicleList[0]?.id,
          type: 'insurance',
          expiryDate: '2024-08-15',
          notes: 'State Farm Policy #12345',
          photoUri: null,
        },
        {
          id: '2', 
          vehicleId: vehicleList[0]?.id,
          type: 'registration',
          expiryDate: '2024-12-31',
          notes: 'Valid through 2024',
          photoUri: null,
        },
      ] : [];
      
      setDocuments(mockDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = (vehicle = null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedVehicle(vehicle);
    setShowAddDocumentModal(true);
  };

  const handleDocumentPress = (document) => {
    Haptics.selectionAsync();
    
    Alert.alert(
      'Document Options',
      `What would you like to do with this ${DOCUMENT_TYPES[document.type]?.name || 'document'}?`,
      [
        { text: 'View', style: 'default' },
        { text: 'Edit', style: 'default' },
        { text: 'Delete', style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[Shared.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[Typography.body, { color: Colors.textSecondary }]}>
          loading documents...
        </Text>
      </View>
    );
  }

  if (vehicles.length === 0) {
    return (
      <View style={Shared.container}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: Spacing.horizontalLarge,
        }}>
          <Text style={{ fontSize: 60, marginBottom: Spacing.xl }}>🚗</Text>
          <Text style={[Typography.hero, { 
            textAlign: 'center', 
            marginBottom: Spacing.md,
            color: Colors.textPrimary,
          }]}>
            add a vehicle first
          </Text>
          <Text style={[Typography.body, { 
            textAlign: 'center', 
            color: Colors.textSecondary, 
            marginBottom: Spacing.section,
            lineHeight: 22,
          }]}>
            go to your garage and add a vehicle to start storing documents.
          </Text>
        </View>
      </View>
    );
  }

  if (documents.length === 0) {
    return (
      <View style={Shared.container}>
        <EmptyState onAddDocument={handleAddDocument} />
      </View>
    );
  }

  return (
    <View style={Shared.container}>
      {/* Summary Header */}
      <View style={[Shared.card, { marginTop: Spacing.lg, marginBottom: Spacing.lg }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
              {documents.length} documents stored
            </Text>
            <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
              across {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={() => handleAddDocument()}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 24,
              padding: 12,
              borderWidth: 1,
              borderColor: Colors.glassBorder,
            }}
          >
            <Ionicons name="add" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {vehicles.map((vehicle) => (
          <VehicleSection
            key={vehicle.id}
            vehicle={vehicle}
            documents={documents}
            onDocumentPress={handleDocumentPress}
            onAddDocument={handleAddDocument}
          />
        ))}
      </ScrollView>

      {/* Add Document Modal would go here */}
      {/* TODO: Implement AddDocumentModal component */}
    </View>
  );
}