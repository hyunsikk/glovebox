import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Typography, Spacing, Shared } from '../theme';

export default function DatePickerField({ value, onChange, label, error, maxDate }) {
  const [showPicker, setShowPicker] = useState(false);

  const dateValue = value ? new Date(value + 'T12:00:00') : new Date();
  const max = maxDate || new Date();

  const formatDisplay = (dateStr) => {
    if (!dateStr) return 'tap to select date';
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const toISODate = (d) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const handleChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'dismissed') return;
    if (selectedDate) {
      onChange(toISODate(selectedDate));
    }
  };

  const handleConfirmIOS = () => {
    setShowPicker(false);
  };

  if (Platform.OS === 'web') {
    return (
      <View>
        {label && (
          <Text style={[Typography.h2, { color: Colors.textPrimary, marginBottom: Spacing.md }]}>
            {label}
          </Text>
        )}
        <input
          type="date"
          value={value || ''}
          max={toISODate(max)}
          onChange={(e) => onChange(e.target.value)}
          style={{
            backgroundColor: Colors.surface1 || '#111827',
            color: Colors.textPrimary || '#F1F5F9',
            border: `1px solid ${error ? (Colors.danger || '#EF4444') : (Colors.glassBorder || 'rgba(255,255,255,0.06)')}`,
            borderRadius: 12,
            padding: 16,
            fontSize: 15,
            fontFamily: 'Nunito',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
        {error && (
          <Text style={[Typography.caption, { color: Colors.danger, marginTop: Spacing.xs }]}>
            {error}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View>
      {label && (
        <Text style={[Typography.h2, { color: Colors.textPrimary, marginBottom: Spacing.md }]}>
          {label}
        </Text>
      )}
      <TouchableOpacity
        style={[
          Shared.input,
          { justifyContent: 'center' },
          error && { borderColor: Colors.danger, borderWidth: 2 },
        ]}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Text style={[Typography.body, {
          color: value ? Colors.textPrimary : (Colors.textTertiary || Colors.arcticSilver),
          fontFamily: 'Nunito_400Regular',
        }]}>
          {formatDisplay(value)}
        </Text>
      </TouchableOpacity>

      {error && (
        <Text style={[Typography.caption, { color: Colors.danger, marginTop: Spacing.xs }]}>
          {error}
        </Text>
      )}

      {value && !error && (
        <Text style={[Typography.caption, { color: Colors.textSecondary, marginTop: Spacing.xs }]}>
          {formatDisplay(value)}
        </Text>
      )}

      {showPicker && Platform.OS === 'ios' && (
        <Modal transparent animationType="slide">
          <View style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
            <View style={{
              backgroundColor: Colors.surface1 || Colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: 40,
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: Spacing.lg,
                borderBottomWidth: 1,
                borderBottomColor: Colors.glassBorder,
              }}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={[Typography.body, { color: Colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirmIOS}>
                  <Text style={[Typography.body, { color: Colors.primary, fontFamily: 'Nunito_700Bold' }]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={dateValue}
                mode="date"
                display="spinner"
                maximumDate={max}
                onChange={handleChange}
                textColor={Colors.textPrimary}
                themeVariant="dark"
              />
            </View>
          </View>
        </Modal>
      )}

      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display="default"
          maximumDate={max}
          onChange={handleChange}
        />
      )}
    </View>
  );
}
