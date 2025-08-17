import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import FeatherIcon from '@expo/vector-icons/Feather';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useAuthContext } from '../../hooks/useAuthContext';
import axios from 'axios';
import { PRODUCTION_URL } from "../../constants/Api";
import images from "../../constants/images";

export default function Profile() {
  const { dispatch, state } = useAuthContext();
  const [contractor, setContractor] = useState([]);

  // ✅ Redirect when userData is null
  useEffect(() => {
    if (!state.userData) {
      router.replace("/"); 
    }
  }, [state.userData]);

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userData");
      dispatch({ type: "SIGN_OUT" });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (state.userData) {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `${PRODUCTION_URL}/contractor/${state.userData.contractor_id}`
          );
          setContractor(response.data.contractor);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      fetchData();
    }
  }, [state.userData]);

  if (!state.userData) {
    return null; // Prevents rendering until redirect happens
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView contentContainerStyle={styles.content} className="mt-10">
        <View style={[styles.section, { paddingTop: 4 }]}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.sectionBody}>
            <TouchableOpacity style={styles.profile}>
              <Image
                alt=""
                source={images.avatar}
                style={styles.profileAvatar}
              />
              <View style={styles.profileBody}>
                <Text style={styles.profileName}>{state.userData.full_name}</Text>
                <Text style={styles.profileHandle}>{state.userData.email}</Text>
              </View>
              <FeatherIcon color="#bcbcbc" name="chevron-right" size={22} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information</Text>
          <View style={styles.sectionBody}>
            <View style={[styles.rowWrapper, styles.rowFirst]}>
              <TouchableOpacity style={styles.row}>
                <Text style={styles.rowLabel}>Company Name</Text>
                <View style={styles.rowSpacer} />
                <Text style={styles.rowValue}>{contractor.contractor_company_name}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.rowWrapper}>
              <TouchableOpacity style={styles.row}>
                <Text style={styles.rowLabel}>Location</Text>
                <View style={styles.rowSpacer} />
                <Text style={styles.rowValue}>{contractor.office_location}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionBody}>
            <View style={[styles.rowWrapper, styles.rowFirst, styles.rowLast, { alignItems: 'center' }]}>
              <TouchableOpacity onPress={signOut} style={styles.row}>
                <Text style={[styles.rowLabel, styles.rowLabelLogout]}>
                  Log Out
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16 },
  section: { paddingVertical: 12 },
  sectionTitle: {
    margin: 8,
    marginLeft: 12,
    fontSize: 13,
    letterSpacing: 0.33,
    fontWeight: '500',
    color: '#000',
    textTransform: 'uppercase',
  },
  sectionBody: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  profile: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 9999,
    marginRight: 12,
  },
  profileBody: { marginRight: 'auto' },
  profileName: { fontSize: 18, fontWeight: '600', color: '#292929' },
  profileHandle: { marginTop: 2, fontSize: 16, fontWeight: '400', color: '#858585' },
  row: {
    height: 44,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
  },
  rowWrapper: {
    paddingLeft: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#f0f0f0',
  },
  rowFirst: { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  rowLabel: { fontSize: 16, letterSpacing: 0.24, color: '#000' },
  rowSpacer: { flexGrow: 1 },
  rowValue: { fontSize: 16, fontWeight: '500', color: '#ababab', marginRight: 4 },
  rowLast: { borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  rowLabelLogout: {
    width: '100%',
    textAlign: 'center',
    fontWeight: '600',
    color: '#dc2626',
  },
});
