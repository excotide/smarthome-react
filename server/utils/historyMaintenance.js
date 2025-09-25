import History from '../models/History.js';

// Fungsi untuk membersihkan history lama (lebih dari 30 hari)
export const cleanupOldHistory = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await History.deleteMany({
      timestamp: { $lt: thirtyDaysAgo }
    });

    console.log(`Cleanup: Deleted ${result.deletedCount} old history entries`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error during history cleanup:', error);
    return 0;
  }
};

// Fungsi untuk membersihkan duplikat history berdasarkan timestamp dan message
export const cleanupDuplicateHistory = async () => {
  try {
    const duplicates = await History.aggregate([
      {
        $group: {
          _id: {
            timestamp: "$timestamp",
            message: "$message"
          },
          count: { $sum: 1 },
          docs: { $push: "$_id" }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    let deletedCount = 0;
    for (const duplicate of duplicates) {
      // Hapus semua kecuali yang pertama
      const toDelete = duplicate.docs.slice(1);
      await History.deleteMany({ _id: { $in: toDelete } });
      deletedCount += toDelete.length;
    }

    console.log(`Cleanup: Deleted ${deletedCount} duplicate history entries`);
    return deletedCount;
  } catch (error) {
    console.error('Error during duplicate cleanup:', error);
    return 0;
  }
};

// Fungsi untuk menjalankan semua cleanup tasks
export const runMaintenanceTasks = async () => {
  console.log('Running history maintenance tasks...');
  
  const oldDeleted = await cleanupOldHistory();
  const duplicatesDeleted = await cleanupDuplicateHistory();
  
  console.log(`Maintenance completed: ${oldDeleted + duplicatesDeleted} entries cleaned up`);
  
  return {
    oldEntriesDeleted: oldDeleted,
    duplicatesDeleted: duplicatesDeleted,
    totalDeleted: oldDeleted + duplicatesDeleted
  };
};