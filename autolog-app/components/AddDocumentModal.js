import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../theme';

const DOCUMENT_TYPES = {
  insurance: { name: 'Insurance', emoji: '🛡️' },
  registration: { name: 'Registration', emoji: '📋' },
  title: { name: 'Title', emoji: '📜' },
  inspection: { name: 'Inspection', emoji: '✅' },
  emissions: { name: 'Emissions', emoji: '🌱' },
  other: { name: 'Other', emoji: '📄' },
};

export default function AddDocumentModal({ visible, onClose, onSave, vehicleId, editDocument }) {
  const isEditing = !!editDocument;
  const [type, setType] = useState(editDocument?.type || 'insurance');
  const [notes, setNotes] = useState(editDocument?.notes || '');
  const [expiryDate, setExpiryDate] = useState(editDocument?.expiryDate || '');

  const resetForm = () => {
    setType('insurance');
    setNotes('');
    setExpiryDate('');
  };

  const handleClose = () => {
    if (!isEditing) resetForm();
    onClose();
  };

  const handleSave = () => {
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
    if (!isEditing) resetForm();
    onClose();
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this document?')) {
        onSave({ ...editDocument, _delete: true });
        onClose();
      }
    } else {
      const { Alert } = require('react-native');
      Alert.alert('Delete Document', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onSave({ ...editDocument, _delete: true });
            onClose();
          },
        },
      ]);
    }
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
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.title}>{isEditing ? 'Edit Document' : 'Add Document'}</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Document Type */}
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeGrid}>
              {Object.entries(DOCUMENT_TYPES).map(([key, val]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.typeChip, type === key && styles.typeChipActive]}
                  onPress={() => setType(key)}
                >
                  <Text style={styles.typeEmoji}>{val.emoji}</Text>
                  <Text style={[styles.typeLabel, type === key && styles.typeLabelActive]}>
                    {val.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Expiry Date */}
            <Text style={styles.label}>Expiry Date (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.textMuted}
              value={expiryDate}
              onChangeText={(t) => setExpiryDate(formatDateInput(t))}
              keyboardType="number-pad"
              maxLength={10}
            />

            {/* Notes */}
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Policy number, details, etc."
              placeholderTextColor={Colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            {/* Delete button for editing */}
            {isEditing && (
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                <Text style={styles.deleteText}>Delete Document</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  saveText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '700',
  },
  body: {
    padding: Spacing.md,
  },
  label: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.elevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  typeChipActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(59,130,246,0.15)',
  },
  typeEmoji: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  typeLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  typeLabelActive: {
    color: Colors.primary,
  },
  input: {
    backgroundColor: Colors.elevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    color: Colors.textPrimary,
    ...Typography.body,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
    padding: Spacing.sm,
  },
  deleteText: {
    ...Typography.body,
    color: Colors.danger,
    marginLeft: Spacing.xs,
  },
});
