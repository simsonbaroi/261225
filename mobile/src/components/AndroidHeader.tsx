import React from 'react';
import {View, Text, StyleSheet, Platform, StatusBar, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

interface AndroidHeaderProps {
  title: string;
  showBackButton?: boolean;
  backgroundColor?: string;
  textColor?: string;
}

const AndroidHeader: React.FC<AndroidHeaderProps> = ({
  title,
  showBackButton = true,
  backgroundColor = '#0f172a',
  textColor = '#f1f5f9',
}) => {
  const navigation = useNavigation();

  if (Platform.OS !== 'android') {
    return null; // Only show on Android
  }

  return (
    <View style={[styles.header, {backgroundColor}]}>
      <StatusBar 
        backgroundColor={backgroundColor} 
        barStyle="light-content" 
        translucent={false}
      />
      <View style={styles.headerContent}>
        {showBackButton && navigation.canGoBack() && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={[styles.backButtonText, {color: textColor}]}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={[styles.headerTitle, {color: textColor}]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.placeholder} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    elevation: 4,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  placeholder: {
    width: 48, // Same width as back button + margin to center the title
  },
});

export default AndroidHeader;