import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Migration utility to add userId to existing documents
 * Run this once to migrate your existing data
 */
export async function migrateUserIds(userId: string) {
  console.log('🔄 Starting userId migration for user:', userId);

  const collections = [
    'subjects',
    'assignments',
    'notes',
    'quizzes',
    'chatMessages',
    'timetableEntries',
  ];

  let totalUpdated = 0;
  let totalSkipped = 0;

  for (const collectionName of collections) {
    console.log(`\n📁 Migrating ${collectionName}...`);

    try {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);

      let updated = 0;
      let skipped = 0;

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();

        // Skip if userId already exists
        if (data.userId) {
          skipped++;
          continue;
        }

        // Add userId to document
        const docRef = doc(db, collectionName, docSnapshot.id);
        await updateDoc(docRef, { userId });
        updated++;
      }

      console.log(`✅ ${collectionName}: Updated ${updated}, Skipped ${skipped}`);
      totalUpdated += updated;
      totalSkipped += skipped;
    } catch (error) {
      console.error(`❌ Error migrating ${collectionName}:`, error);
    }
  }

  console.log(`\n🎉 Migration complete!`);
  console.log(`   Total updated: ${totalUpdated}`);
  console.log(`   Total skipped: ${totalSkipped}`);

  return { totalUpdated, totalSkipped };
}
