import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView, Alert, SafeAreaView, Platform, StatusBar} from 'react-native';
import {Button, Card, Title, Text, List, Searchbar, Chip} from 'react-native-paper';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';
import {MedicalItem} from '../types';
import {formatTaka} from '../utils/currency';
import ApiService from '../services/api';

type DatabaseScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Database'
>;

type Props = {
  navigation: DatabaseScreenNavigationProp;
};

const DATABASE_CATEGORIES = [
  'Registration Fees',
  'Dr. Fees',
  'Medic Fee',
  'Laboratory',
  'X-Ray',
  'Medicine',
  'Physical Therapy',
  'Limb and Brace',
  'Bed Charges',
  'Nursing Care',
  'ICU/CCU',
  'Operation Theatre',
  'Emergency',
  'Dialysis',
  'Physiotherapy',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Gynecology',
  'Pediatrics',
  'Anesthesia',
  'Blood Bank',
  'Pathology',
  'Radiology',
];

const DatabaseScreen: React.FC<Props> = ({navigation}) => {
  const [medicalItems, setMedicalItems] = useState<MedicalItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MedicalItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [medicalItems, searchQuery, selectedCategory]);

  const loadData = async () => {
    try {
      const items = await ApiService.getMedicalItems();
      setMedicalItems(items);
    } catch (error) {
      Alert.alert('Error', 'Failed to load medical items');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = medicalItems;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const getCategoryCount = (category: string) => {
    if (category === 'All') return medicalItems.length;
    return medicalItems.filter(item => item.category === category).length;
  };

  const getUniqueCategories = () => {
    const categories = Array.from(new Set(medicalItems.map(item => item.category)));
    return ['All', ...categories.sort()];
  };

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
        {/* Search */}
        <Card style={styles.card}>
          <Card.Content>
            <Searchbar
              placeholder="Search medical items..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
              inputStyle={styles.searchInput}
              iconColor="#10b981"
            />
          </Card.Content>
        </Card>

        {/* Categories */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Categories</Title>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryRow}>
                {getUniqueCategories().map(category => (
                  <Chip
                    key={category}
                    selected={selectedCategory === category}
                    onPress={() => setSelectedCategory(category)}
                    style={[
                      styles.categoryChip,
                      selectedCategory === category && styles.selectedChip,
                    ]}>
                    {category} ({getCategoryCount(category)})
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Results */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.resultsHeader}>
              <Title style={styles.sectionTitle}>
                Medical Items ({filteredItems.length})
              </Title>
              {selectedCategory !== 'All' && (
                <Button
                  mode="text"
                  onPress={() => setSelectedCategory('All')}
                  style={styles.clearFilterButton}>
                  Clear Filter
                </Button>
              )}
            </View>

            {filteredItems.length === 0 ? (
              <Text style={styles.noResultsText}>
                {searchQuery.trim() || selectedCategory !== 'All'
                  ? 'No items found matching your criteria'
                  : 'No medical items available'}
              </Text>
            ) : (
              filteredItems.map(item => (
                <List.Item
                  key={item.id}
                  title={item.name}
                  description={`${item.category} - ${formatTaka(item.price)}`}
                  titleStyle={styles.itemTitle}
                  descriptionStyle={styles.itemDescription}
                  left={() => (
                    <View style={styles.itemIcon}>
                      <Text style={styles.itemIconText}>
                        {item.category.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                />
              ))
            )}
          </Card.Content>
        </Card>

        {/* Statistics */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Database Statistics</Title>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{medicalItems.length}</Text>
                <Text style={styles.statLabel}>Total Items</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {getUniqueCategories().length - 1}
                </Text>
                <Text style={styles.statLabel}>Categories</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {formatTaka(
                    medicalItems.reduce((sum, item) => sum + item.price, 0) /
                      medicalItems.length || 0
                  )}
                </Text>
                <Text style={styles.statLabel}>Avg. Price</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
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
  searchbar: {
    backgroundColor: '#334155',
  },
  searchInput: {
    color: '#f1f5f9',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryChip: {
    backgroundColor: '#334155',
    marginRight: 5,
  },
  selectedChip: {
    backgroundColor: '#10b981',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clearFilterButton: {
    marginTop: -5,
  },
  noResultsText: {
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
  itemTitle: {
    color: '#f1f5f9',
    fontSize: 16,
  },
  itemDescription: {
    color: '#10b981',
    fontSize: 14,
  },
  itemIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#10b981',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  itemIconText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#10b981',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 5,
  },
});

export default DatabaseScreen;