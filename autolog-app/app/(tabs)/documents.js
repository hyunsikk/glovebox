/**
 * Digital Glovebox - Documents Tab
 * 
 * Store and track vehicle documents like Insurance, Registration, Title
 * Features: expiry date tracking, expiry countdown badges
 */

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Shared } from '../../theme';
import { VehicleStorage, DocumentStorage } from '../../lib/storage';
import AddDocumentModal from '../../components/AddDocumentModal';

// Document types with their icons and colors
const DOCUMENT_TYPES = {
  insurance: { name: 'Insurance', emoji: '🛡️', color: Colors.primary },
  registration: { name: 'Registration', emoji: '📋', color: Colors.success },
  title: { name: 'Title', emoji: '📜', color: Colors.warning },
  inspection: { name: 'Inspection', emoji: '✅', color: Colors.primary },
  emissions: { name: 'Emissions', emoji: '🌱', color: Colors.success },
  other: { name: 'Other', emoji: '📄', color: Colors.steelBlue },
};

const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) return null;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntil = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) {
    return { text: 'expired', color: Colors.danger, days: Math.abs(daysUntil), status: 'expired' };
  } else if (daysUntil <= 30) {
    return { text: `expires in ${daysUntil}d`, color: Colors.warning, days: daysUntil, status: 'soon' };
  } else {
    return { text: `expires in ${daysUntil}d`, color: Colors.success, days: daysUntil, status: 'valid' };
  }
};

const DocumentCard = ({ document, vehicle, onPress }) => {
  const docType = DOCUMENT_TYPES[document.type] || DOCUMENT_TYPES.other;
  const expiryStatus = getExpiryStatus(document.expiryDate);

  return (
    <TouchableOpacity
      style={[Shared.card, { marginBottom: Spacing.md }]}
      onPress={() => onPress(document)}
      activeOpacity={0.9}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: document.notes || document.expiryDate ? Spacing.md : 0 }}>
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

      {(document.expiryDate || document.notes) && (
        <View style={{
          backgroundColor: Colors.surface1 + '60',
          padding: Spacing.md,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: Colors.glassBorder,
        }}>
          {document.expiryDate && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: document.notes ? Spacing.sm : 0 }}>
              <Text style={[Typography.body, { color: Colors.textSecondary }]}>expiry date</Text>
              <Text style={[Typography.body, { color: Colors.textPrimary }]}>
                {new Date(document.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
          )}
          {expiryStatus && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: document.notes ? Spacing.sm : 0 }}>
              <Text style={[Typography.body, { color: Colors.textSecondary }]}>status</Text>
              <Text style={[Typography.body, { color: expiryStatus.color }]}>{expiryStatus.text}</Text>
            </View>
          )}
          {document.notes && (
            <Text style={[Typography.caption, { color: Colors.textSecondary, marginTop: Spacing.xs }]}>
              {document.notes}
            </Text>
          )}
        </View>
      )}
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

const EmptyState = () => (
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
);

export default function DocumentsScreen() {
  const [vehicles, setVehicles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [editingDocument, setEditingDocument] = useState(null);

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

      const allDocs = await DocumentStorage.getAll();
      setDocuments(allDocs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = (vehicle = null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedVehicle(vehicle);
    setEditingDocument(null);
    setShowAddDocumentModal(true);
  };

  const handleDocumentPress = (document) => {
    Haptics.selectionAsync();
    setEditingDocument(document);
    setSelectedVehicle(vehicles.find(v => v.id === document.vehicleId) || null);
    setShowAddDocumentModal(true);
  };

  const handleSaveDocument = async (docData) => {
    try {
      if (docData.id) {
        // Update existing
        await DocumentStorage.update(docData.id, docData);
      } else {
        // Add new
        await DocumentStorage.add(docData);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      loadData();
    } catch (error) {
      console.error('Error saving document:', error);
      Alert.alert('Error', 'Failed to save document. Please try again.');
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await DocumentStorage.delete(docId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      loadData();
    } catch (error) {
      console.error('Error deleting document:', error);
      Alert.alert('Error', 'Failed to delete document. Please try again.');
    }
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
        <EmptyState />
      </View>
    );
  }

  // Count expiring/expired documents for summary
  const expiredCount = documents.filter(d => {
    const s = getExpiryStatus(d.expiryDate);
    return s && s.status === 'expired';
  }).length;
  const soonCount = documents.filter(d => {
    const s = getExpiryStatus(d.expiryDate);
    return s && s.status === 'soon';
  }).length;

  return (
    <View style={Shared.container}>
      {/* Summary Header */}
      {documents.length > 0 && (
        <View style={[Shared.card, { marginTop: Spacing.lg, marginBottom: Spacing.lg }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
                {documents.length} document{documents.length !== 1 ? 's' : ''} stored
              </Text>
              <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                {expiredCount > 0 ? `${expiredCount} expired` : soonCount > 0 ? `${soonCount} expiring soon` : 'all up to date'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => handleAddDocument(vehicles[0])}
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
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: documents.length === 0 ? Spacing.lg : 0, paddingBottom: 100 }}
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

      <AddDocumentModal
        visible={showAddDocumentModal}
        onClose={() => { setShowAddDocumentModal(false); setEditingDocument(null); }}
        onSave={handleSaveDocument}
        onDelete={handleDeleteDocument}
        vehicleId={selectedVehicle?.id}
        editDocument={editingDocument}
      />
    </View>
  );
}
