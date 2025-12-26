import React from 'react';
import {View, StyleSheet, ScrollView, SafeAreaView, Platform, StatusBar} from 'react-native';
import {Button, Card, Title, Paragraph} from 'react-native-paper';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen: React.FC<Props> = ({navigation}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Hospital Bill Calculator</Title>
            <Paragraph style={styles.subtitle}>
              Professional medical billing for hospitals and clinics
            </Paragraph>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Outpatient')}
            style={styles.mainButton}
            contentStyle={styles.buttonContent}>
            Outpatient Calculator
          </Button>

          <Button
            mode="contained"
            onPress={() => navigation.navigate('Inpatient')}
            style={styles.mainButton}
            contentStyle={styles.buttonContent}>
            Inpatient Calculator
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Database')}
            style={styles.secondaryButton}
            contentStyle={styles.buttonContent}>
            Medical Items Database
          </Button>
        </View>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Title style={styles.infoTitle}>Features</Title>
            <Paragraph style={styles.feature}>• Professional medical billing calculations</Paragraph>
            <Paragraph style={styles.feature}>• Outpatient and Inpatient services</Paragraph>
            <Paragraph style={styles.feature}>• Comprehensive medical items database</Paragraph>
            <Paragraph style={styles.feature}>• Real-time bill management</Paragraph>
            <Paragraph style={styles.feature}>• Bangladeshi Taka (৳) currency support</Paragraph>
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
    marginBottom: 30,
  },
  title: {
    color: '#10b981',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 30,
  },
  mainButton: {
    backgroundColor: '#10b981',
  },
  secondaryButton: {
    borderColor: '#10b981',
  },
  buttonContent: {
    paddingVertical: 10,
  },
  infoCard: {
    backgroundColor: '#1e293b',
  },
  infoTitle: {
    color: '#10b981',
    fontSize: 20,
    marginBottom: 10,
  },
  feature: {
    color: '#cbd5e1',
    fontSize: 14,
    marginBottom: 5,
  },
});

export default HomeScreen;