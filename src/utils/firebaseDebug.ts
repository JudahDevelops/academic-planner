import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Debug utility to check Firebase connectivity and data access
 */
export async function debugFirebaseAccess() {
  console.log('🔍 Debugging Firebase Access...');

  try {
    // Test Subjects collection
    console.log('📚 Checking subjects collection...');
    const subjectsRef = collection(db, 'subjects');
    const subjectsSnapshot = await getDocs(subjectsRef);
    console.log(`✅ Subjects accessible: ${subjectsSnapshot.size} documents found`);
    subjectsSnapshot.forEach(doc => {
      console.log('  - Subject:', doc.id, doc.data());
    });

    // Test Timetable collection
    console.log('📅 Checking timetableEntries collection...');
    const timetableRef = collection(db, 'timetableEntries');
    const timetableSnapshot = await getDocs(timetableRef);
    console.log(`✅ Timetable accessible: ${timetableSnapshot.size} documents found`);
    timetableSnapshot.forEach(doc => {
      console.log('  - Entry:', doc.id, doc.data());
    });

    // Test Assignments collection
    console.log('📝 Checking assignments collection...');
    const assignmentsRef = collection(db, 'assignments');
    const assignmentsSnapshot = await getDocs(assignmentsRef);
    console.log(`✅ Assignments accessible: ${assignmentsSnapshot.size} documents found`);

    console.log('✨ Firebase access test completed successfully!');
    return {
      success: true,
      subjects: subjectsSnapshot.size,
      timetable: timetableSnapshot.size,
      assignments: assignmentsSnapshot.size,
    };
  } catch (error: any) {
    console.error('❌ Firebase access error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);

    if (error.code === 'permission-denied') {
      console.error('🚨 PERMISSION DENIED - Your Firestore rules are blocking access!');
      console.error('This means your data is still there, but the rules prevent reading it.');
    }

    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
}
