import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Typography, Shared } from '../theme';

const DOCUMENT_TYPES = {
  insurance: { name: 'Insurance', emoji: '🛡️' },
  registration: { name: 'Registration', emoji: '📋' },
  title: { name: 'Title', emoji: '📜' },
  inspection: { name: 'Inspection', emoji: '✅' },
  emissions: { name: 'Emissions', emoji: '🌱' },
  other: { name: 'Other', emoji: '📄' },
};

export default function AddDocumentModal({ visible, onClose, onSave, onDelete, vehicleId, editDocument }) {
  const isEditing = !!editDocument;
  const [type, setType] = useState('insurance');
  const [notes, setNotes] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // Reset form when modal opens or editDocument changes
  useEffect(() => {
    if (visible) {
      if (editDocument) {
        setType(editDocument.type || 'insurance');
        setNotes(editDocument.notes || '');
        setExpiryDate(editDocument.expiryDate || '');
      } else {
        setType('insurance');
        setNotes('');
        setExpiryDate('');
      }
    }
  }, [visible, editDocument]);

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const doc = {
      vehicleId,
      type,
      notes: notes.trim(),
      expiryDate: expiryDate.trim() || null,
    };

    if (isEditing) {
      doc.id = editDocument.id;
    }

    onSave(doc);
    onClose();
  };

  const handleDelete = () => {
    Alert.alert('Delete Document', 'Are you sure you want to delete this document?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          if (onDelete) onDelete(editDocument.id);
          onClose();
        },
      },
    ]);
  };

  const formatDateInput = (text) => {
    const nums = text.replace(/[^0-9]/g, '');
    if (nums.length <= 4) return nums;
    if (nums.length <= 6) return nums.slice(0, 4) + '-' + nums.slice(4);
    return nums.slice(0, 4) + '-' + nums.slice(4, 6) + '-' + nums.slice(6, 8);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'flex-end',
        }}
      >
        <View style={{
          backgroundColor: Colors.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: '80%',
          borderWidth: 1,
          borderColor: Colors.glassBorder,
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: Spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: Colors.glassBorder,
          }}>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
              {isEditing ? 'Edit Document' : 'Add Document'}
            </Text>
            <TouchableOpacity onPress={handleSave} style={{ padding: 4 }}>
              <Text style={[Typography.body, { color: Colors.primary, fontFamily: 'Nunito_700Bold' }]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: Spacing.lg }} showsVerticalScrollIndicator={false}>
            {/* Document Type */}
            <Text style={[Typography.caption, {
              color: Colors.textSecondary,
              marginBottom: Spacing.sm,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }]}>
              Type
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg }}>
              {Object.entries(DOCUMENT_TYPES).map(([key, val]) => (
                <TouchableOpacity
                  key={key}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: type === key ? Colors.primary + '20' : Colors.surface1,
                    paddingHorizontal: Spacing.md,
                    paddingVertical: Spacing.sm,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: type === key ? Colors.primary + '60' : Colors.glassBorder,
                  }}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setType(key);
                  }}
                >
                  <Text style={{ fontSize: 16, marginRight: Spacing.xs }}>{val.emoji}</Text>
                  <Text style={[Typography.caption, {
                    color: type === key ? Colors.primary : Colors.textSecondary,
                    fontFamily: type === key ? 'Nunito_600SemiBold' : 'Nunito_500Medium',
                  }]}>
                    {val.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Expiry Date */}
            <Text style={[Typography.caption, {
              color: Colors.textSecondary,
              marginBottom: Spacing.sm,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }]}>
              Expiry Date (optional)
            </Text>
            <TextInput
              style={[Shared.input, { marginBottom: Spacing.lg }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.arcticSilver}
              value={expiryDate}
              onChangeText={(t) => setExpiryDate(formatDateInput(t))}
              keyboardType="number-pad"
              maxLength={10}
            />

            {/* Notes */}
            <Text style={[Typography.caption, {
              color: Colors.textSecondary,
              marginBottom: Spacing.sm,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }]}>
              Notes
            </Text>
            <TextInput
              style={[Shared.input, { minHeight: 80, textAlignVertical: 'top', paddingTop: Spacing.md, marginBottom: Spacing.lg }]}
              placeholder="Policy number, details, etc."
              placeholderTextColor={Colors.arcticSilver}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            {/* Delete button for editing */}
            {isEditing && (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: Spacing.md,
                  marginBottom: Spacing.xl,
                  paddingVertical: Spacing.md,
                }}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={18} color={Colors.deepRed} style={{ marginRight: Spacing.sm }} />
                <Text style={[Typography.body, { color: Colors.deepRed }]}>Delete Document</Text>
              </TouchableOpacity>
            )}

            {/* Bottom padding for keyboard */}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
