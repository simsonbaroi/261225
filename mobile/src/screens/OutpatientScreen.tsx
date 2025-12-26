import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView, Alert, SafeAreaView, Platform, StatusBar} from 'react-native';
import {Button, Card, Title, Text, List, Chip} from 'react-native-paper';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';
import {MedicalItem, BillItem, CategoryTotal} from '../types';
import {formatTaka} from '../utils/currency';
import ApiService from '../services/api';

type OutpatientScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Outpatient'
>;

type Props = {
  navigation: OutpatientScreenNavigationProp;
};

const OUTPATIENT_CATEGORIES = [
  'Registration Fees',
  'Dr. Fees',
  'Medic Fee',
  'Laboratory',
  'X-Ray',
  'Medicine',
  'Physical Therapy',
  'Limb and Brace',
];

const OutpatientScreen: React.FC<Props> = ({navigation}) => {
  const [medicalItems, setMedicalItems] = useState<MedicalItem[]>([]);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [items, bills] = await Promise.all([
        ApiService.getMedicalItems(),
        ApiService.getBills('mobile-session', 'outpatient'),
      ]);
      setMedicalItems(items);
      setBillItems(bills);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const addToBill = async (item: MedicalItem) => {
    try {
      const billItem = await ApiService.addBillItem({
        medicalItem: item,
        quantity: 1,
        category: item.category,
        sessionId: 'mobile-session',
        type: 'outpatient',
      });
      setBillItems(prev => [...prev, billItem]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to bill');
    }
  };

  const removeFromBill = async (billId: string) => {
    try {
      await ApiService.removeBillItem(billId);
      setBillItems(prev => prev.filter(item => item.id !== billId));
    } catch (error) {
      Alert.alert('Error', 'Failed to remove item from bill');
    }
  };

  const clearBill = async () => {
    Alert.alert(
      'Clear Bill',
      'Are you sure you want to clear all items?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.clearBills('mobile-session', 'outpatient');
              setBillItems([]);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear bill');
            }
          },
        },
      ]
    );
  };

  const getCategoryItems = (category: string) => {
    return medicalItems.filter(item => item.category === category);
  };

  const calculateCategoryTotals = (): CategoryTotal[] => {
    const totals: { [key: string]: CategoryTotal } = {};
    
    billItems.forEach(bill => {
      if (!totals[bill.category]) {
        totals[bill.category] = {
          category: bill.category,
          total: 0,
          itemCount: 0,
        };
      }
      totals[bill.category].total += bill.medicalItem.price * bill.quantity;
      totals[bill.category].itemCount += 1;
    });
    
    return Object.values(totals);
  };

  const grandTotal = billItems.reduce(
    (sum, item) => sum + item.medicalItem.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.loadingText}>Loading...</Title>
            </Card.Content>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
        {/* Categories */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Medical Categories</Title>
            <View style={styles.categoryGrid}>
              {OUTPATIENT_CATEGORIES.map(category => (
                <Chip
                  key={category}
                  selected={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.selectedChip,
                  ]}>
                  {category}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Category Items */}
        {selectedCategory && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>{selectedCategory}</Title>
              {getCategoryItems(selectedCategory).map(item => (
                <List.Item
                  key={item.id}
                  title={item.name}
                  description={formatTaka(item.price)}
                  titleStyle={styles.itemTitle}
                  descriptionStyle={styles.itemPrice}
                  right={() => (
                    <Button
                      mode="contained"
                      onPress={() => addToBill(item)}
                      style={styles.addButton}>
                      Add
                    </Button>
                  )}
                />
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Bill Summary */}
        {billItems.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.billHeader}>
                <Title style={styles.sectionTitle}>Current Bill</Title>
                <Button
                  mode="outlined"
                  onPress={clearBill}
                  style={styles.clearButton}>
                  Clear
                </Button>
              </View>

              {calculateCategoryTotals().map(categoryTotal => (
                <View key={categoryTotal.category} style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>
                    {categoryTotal.category} ({categoryTotal.itemCount} items)
                  </Text>
                  {billItems
                    .filter(item => item.category === categoryTotal.category)
                    .map(item => (
                      <View key={item.id} style={styles.billItem}>
                        <View style={styles.billItemContent}>
                          <Text style={styles.billItemName}>
                            {item.medicalItem.name}
                          </Text>
                          <Text style={styles.billItemPrice}>
                            {formatTaka(item.medicalItem.price)}
                          </Text>
                        </View>
                        <Button
                          mode="text"
                          onPress={() => removeFromBill(item.id)}
                          style={styles.removeButton}>
                          Remove
                        </Button>
                      </View>
                    ))}
                  <Text style={styles.categoryTotal}>
                    Subtotal: {formatTaka(categoryTotal.total)}
                  </Text>
                </View>
              ))}

              <View style={styles.grandTotalSection}>
                <Title style={styles.grandTotal}>
                  Grand Total: {formatTaka(grandTotal)}
                </Title>
              </View>
            </Card.Content>
          </Card>
        )}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: 0, // Remove extra padding since header handles it
  },
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#1e293b',
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#10b981',
    fontSize: 20,
    marginBottom: 15,
  },
  loadingText: {
    color: '#cbd5e1',
    textAlign: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    backgroundColor: '#334155',
  },
  selectedChip: {
    backgroundColor: '#10b981',
  },
  itemTitle: {
    color: '#f1f5f9',
  },
  itemPrice: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#10b981',
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  clearButton: {
    borderColor: '#ef4444',
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    color: '#6ee7b7',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  billItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#334155',
    marginBottom: 5,
    borderRadius: 8,
  },
  billItemContent: {
    flex: 1,
  },
  billItemName: {
    color: '#f1f5f9',
    fontSize: 14,
  },
  billItemPrice: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: 'bold',
  },
  removeButton: {
    marginLeft: 10,
  },
  categoryTotal: {
    color: '#6ee7b7',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 8,
  },
  grandTotalSection: {
    borderTopWidth: 2,
    borderTopColor: '#10b981',
    paddingTop: 15,
    marginTop: 15,
  },
  grandTotal: {
    color: '#10b981',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default OutpatientScreen;