import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  useColorScheme
} from 'react-native';
import { mockEntries, Entry } from '@distitrack/common';

export default function App() {
  const [showList, setShowList] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = isDark ? darkStyles : lightStyles;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.header, { color: theme.textColor }]}>Bo'zor Daftari</Text>

        {!showList ? (
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.labelColor }]}>Market nomi</Text>
              <TextInput
                style={[styles.input, { color: theme.textColor, borderColor: theme.borderColor }]}
                placeholder="Market nomi"
                placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.labelColor }]}>Market raqami</Text>
              <TextInput
                style={[styles.input, { color: theme.textColor, borderColor: theme.borderColor }]}
                defaultValue="+998"
                keyboardType="phone-pad"
                placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.labelColor }]}>Mahsulot turi</Text>
              <TextInput
                style={[styles.input, { color: theme.textColor, borderColor: theme.borderColor }]}
                placeholder="Mahsulot turi"
                placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
              />
            </View>

            <TextInput
              style={[styles.input, styles.mt10, { color: theme.textColor, borderColor: theme.borderColor }]}
              placeholder="Miqdori"
              placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
            />

            <View style={[styles.pickerContainer, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
              <Text style={styles.pickerPlaceholder}>To'lov holati</Text>
            </View>

            <TouchableOpacity style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Saqlash</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.listBtn, { backgroundColor: isDark ? '#334155' : '#64748b' }]}
              onPress={() => setShowList(true)}
            >
              <Text style={styles.listBtnText}>Yozuvlar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
            <View style={styles.listHeader}>
              <Text style={[styles.listTitle, { color: theme.textColor }]}>Barcha yozuvlar</Text>
              <TouchableOpacity onPress={() => setShowList(false)}>
                <Text style={styles.backBtn}>Orqaga</Text>
              </TouchableOpacity>
            </View>

            {mockEntries.map(entry => (
              <View key={entry.id} style={[styles.entryItem, { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: theme.borderColor }]}>
                <View style={styles.entryMain}>
                  <Text style={[styles.entryMarket, { color: theme.textColor }]}>{entry.marketNomi}</Text>
                  <Text style={styles.entryAmount}>{entry.miqdori}</Text>
                </View>
                <Text style={styles.entryDetails}>
                  {entry.mahsulotTuri} • {entry.sana}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const lightStyles = {
  backgroundColor: '#f1f5f9',
  cardBackground: '#ffffff',
  textColor: '#1e293b',
  labelColor: '#334155',
  borderColor: '#e2e8f0',
};

const darkStyles = {
  backgroundColor: '#0f172a',
  cardBackground: '#1e293b',
  textColor: '#f8fafc',
  labelColor: '#94a3b8',
  borderColor: '#334155',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    fontSize: 32,
    fontFamily: 'System',
    fontWeight: '900',
    textAlign: 'left',
    marginBottom: 30,
    letterSpacing: -1,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  mt10: {
    marginTop: 10,
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  pickerPlaceholder: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  listBtn: {
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  listBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  listTitle: {
    fontSize: 24,
    fontWeight: '900',
  },
  backBtn: {
    color: '#2563eb',
    fontWeight: '800',
    fontSize: 16,
  },
  entryItem: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
  },
  entryMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryMarket: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    marginRight: 10,
  },
  entryAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2563eb',
  },
  entryDetails: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
});
